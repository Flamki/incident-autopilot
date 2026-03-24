from __future__ import annotations

from shared.base_agent import BaseAgent

from .expertise_scorer import score_candidates


class OwnerFinderAgent(BaseAgent):
    def run(self, context: dict) -> dict:
        project_id = context['project_id']
        affected_files = context.get('pipeline', {}).get('affected_files', [])
        author_name = context.get('breaking_commit', {}).get('author_username', '')

        primary = {'username': author_name, 'source': 'commit_author', 'score': 0.9}

        blame_owners = []
        for file_path in affected_files[:3]:
            try:
                blame = self.gitlab.get(
                    f'/projects/{project_id}/repository/blame',
                    params={'file_path': file_path, 'ref': 'main'},
                )
                blame_owners.extend(self._extract_blame_owners(blame))
            except Exception:
                continue

        members = self.gitlab.get(f'/projects/{project_id}/members/all')
        member_map = {m.get('username'): m for m in members if m.get('username')}
        candidates = score_candidates(primary, blame_owners, member_map)
        top = candidates[0] if candidates else primary

        return {
            'ownership': {
                'primary_owner': top.get('username'),
                'expertise_score': top.get('score', 0.5),
                'gitlab_user_id': member_map.get(top.get('username'), {}).get('id'),
                'secondary_owners': [c['username'] for c in candidates[1:3]],
            }
        }

    @staticmethod
    def _extract_blame_owners(blame_payload):
        owners = []
        for chunk in blame_payload:
            commit = chunk.get('commit') or {}
            author = commit.get('author_name') or commit.get('author_email')
            if author:
                owners.append(str(author).split('@')[0])
        return owners