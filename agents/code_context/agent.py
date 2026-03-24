from __future__ import annotations

import base64

from shared.base_agent import BaseAgent

from .diff_parser import format_diff


class CodeContextAgent(BaseAgent):
    def run(self, context: dict) -> dict:
        sha = context.get('breaking_commit', {}).get('breaking_commit_sha')
        project_id = context['project_id']
        if not sha:
            return {'code_context': {'root_cause_hypothesis': 'No commit identified'}}

        diff = self.gitlab.get(f'/projects/{project_id}/repository/commits/{sha}/diff')
        diff_text = format_diff(diff, max_chars=8000)

        main_file = diff[0].get('new_path') if diff else None
        file_content = ''
        if main_file:
            try:
                path = main_file.replace('/', '%2F')
                resp = self.gitlab.get(f'/projects/{project_id}/repository/files/{path}', params={'ref': sha})
                file_content = base64.b64decode(resp['content']).decode('utf-8', errors='ignore')[:4000]
            except Exception:
                file_content = ''

        result = self.ask_claude(
            f'''You are a senior code reviewer.
Analyze this failing commit diff and identify root cause.
Commit diff:\n{diff_text}
File content:\n{file_content}
Return JSON:
{{"affected_functions":[],"root_cause_hypothesis":"","bug_class":"logic_error|null_ref|type_error|race|missing_import|config","complexity_score":1}}''',
            max_tokens=800,
        )
        return {'code_context': result}