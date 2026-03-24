from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone

from shared.base_agent import BaseAgent

from .scoring import calculate_commit_score


class CommitBisectorAgent(BaseAgent):
    LOOKBACK_HOURS = 48
    TOP_N_FOR_CLAUDE = 5

    def run(self, context: dict) -> dict:
        project_id = context['project_id']
        pipeline_ref = context.get('pipeline_ref', 'main')
        affected_files = context.get('pipeline', {}).get('affected_files', [])
        error_summary = context.get('pipeline', {}).get('error_summary', '')
        error_type = context.get('pipeline', {}).get('error_type', 'unknown')

        since = (datetime.now(timezone.utc) - timedelta(hours=self.LOOKBACK_HOURS)).isoformat()
        all_commits = self.gitlab.get(
            f'/projects/{project_id}/repository/commits',
            params={'ref_name': pipeline_ref, 'since': since, 'per_page': 50, 'with_stats': True},
        )

        if not all_commits:
            return {'breaking_commit': {'sha': None, 'confidence_score': 0.0, 'reasoning': 'No commits in lookback window'}}

        scored = []
        pipeline_failed_at = datetime.now(timezone.utc)

        for commit in all_commits[:30]:
            diff = self.gitlab.get(f'/projects/{project_id}/repository/commits/{commit["id"]}/diff')
            changed_files = [d.get('new_path') for d in diff if d.get('new_path')]
            score = calculate_commit_score(
                commit=commit,
                changed_files=changed_files,
                affected_files=affected_files,
                pipeline_failed_at=pipeline_failed_at,
            )
            if score > 0.05:
                scored.append({'commit': commit, 'changed_files': changed_files, 'diff_sample': diff[:3], 'score': score})

        if not scored:
            return {'breaking_commit': {'sha': None, 'confidence_score': 0.2, 'reasoning': 'No relevant commits found'}}

        top = sorted(scored, key=lambda x: x['score'], reverse=True)[: self.TOP_N_FOR_CLAUDE]
        result = self._claude_bisect(top, error_summary, error_type)
        return {'breaking_commit': result}

    def _claude_bisect(self, candidates, error_summary, error_type) -> dict:
        cands_json = json.dumps(
            [
                {
                    'sha': c['commit']['id'][:8],
                    'full_sha': c['commit']['id'],
                    'message': c['commit'].get('title'),
                    'author': c['commit'].get('author_name'),
                    'date': c['commit'].get('authored_date'),
                    'changed_files': c['changed_files'][:10],
                    'additions': (c['commit'].get('stats') or {}).get('additions', 0),
                    'deletions': (c['commit'].get('stats') or {}).get('deletions', 0),
                    'pre_score': round(c['score'], 3),
                }
                for c in candidates
            ],
            indent=2,
        )

        prompt = f'''You are a git forensics expert.
A pipeline failed with this error: {error_summary}
Error type: {error_type}
Candidates:
{cands_json}
Respond ONLY with JSON:
{{
"breaking_commit_sha": "full SHA",
"confidence_score": 0.0,
"reasoning": "2-3 sentences",
"alternative_sha": null,
"alternative_confidence": 0.0
}}'''

        result = self.ask_claude(prompt, max_tokens=500)
        sha = result.get('breaking_commit_sha')
        matched = next((c for c in candidates if c['commit']['id'] == sha), None)
        if matched:
            result['author_username'] = matched['commit'].get('author_name')
            result['authored_at'] = matched['commit'].get('authored_date')
            result['commit_message'] = matched['commit'].get('title')
        return result