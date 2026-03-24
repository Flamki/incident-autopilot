from __future__ import annotations

from shared.base_agent import BaseAgent
from shared.exceptions import ClaudeResponseError

from .decision_tree import choose_fallback_plan


class RecoveryPlannerAgent(BaseAgent):
    def run(self, context: dict) -> dict:
        error_summary = context.get('pipeline', {}).get('error_summary', '')
        error_type = context.get('pipeline', {}).get('error_type', 'unknown')
        breaking_sha = context.get('breaking_commit', {}).get('breaking_commit_sha', '')
        commit_message = context.get('breaking_commit', {}).get('commit_message', '')
        author = context.get('breaking_commit', {}).get('author_username', '')
        root_cause = context.get('code_context', {}).get('root_cause_hypothesis', '')
        bug_class = context.get('code_context', {}).get('bug_class', '')
        affected_files = context.get('pipeline', {}).get('affected_files', [])

        try:
            result = self.ask_claude(
                f'''You are a senior SRE.
Generate a specific, actionable recovery plan.
Error: {error_summary}
Type: {error_type} | Bug class: {bug_class}
Breaking commit: {breaking_sha[:8]} by @{author}: '{commit_message}'
Root cause: {root_cause}
Affected files: {affected_files[:5]}
Return JSON:
{{
"recommendation": "rollback|hotfix|config_change|retry|flag_disable",
"urgency": "critical|high|medium|low",
"reasoning": "why this recommendation",
"steps": ["numbered actionable steps"],
"rollback_command": "git revert SHA or null",
"estimated_minutes": 15,
"risk_level": "low|medium|high",
"prevention": "one sentence"
}}''',
                max_tokens=1000,
            )
        except ClaudeResponseError:
            result = choose_fallback_plan(error_type)

        return {'recovery_plan': result}