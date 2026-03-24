from __future__ import annotations

from textwrap import dedent


def format_incident_issue(context: dict) -> str:
    pipeline = context.get('pipeline', {})
    breaking = context.get('breaking_commit', {})
    code = context.get('code_context', {})
    ownership = context.get('ownership', {})
    plan = context.get('recovery_plan', {})

    body = dedent(
        f"""
        ## Incident Summary
        - Incident ID: `{context.get('incident_id')}`
        - Pipeline: {context.get('pipeline_url')}
        - Error Type: `{pipeline.get('error_type')}`
        - Severity: `{context.get('severity', 'warning')}`

        ## Pipeline Analysis (Agent 1)
        - Failed Stage: `{pipeline.get('failed_stage')}`
        - Failed Job: `{pipeline.get('failed_job')}`
        - Summary: {pipeline.get('error_summary')}
        - Affected Files: {', '.join(pipeline.get('affected_files', [])[:8])}

        ## Breaking Commit (Agent 2)
        - SHA: `{breaking.get('breaking_commit_sha')}`
        - Author: `{breaking.get('author_username')}`
        - Message: {breaking.get('commit_message')}
        - Confidence: {breaking.get('confidence_score')}

        ## Code Context (Agent 3)
        - Root Cause: {code.get('root_cause_hypothesis')}
        - Bug Class: `{code.get('bug_class')}`

        ## Ownership (Agent 4)
        - Primary Owner: @{ownership.get('primary_owner')}
        - Secondary Owners: {', '.join(ownership.get('secondary_owners', []))}

        ## Recovery Plan (Agent 5)
        - Recommendation: `{plan.get('recommendation')}`
        - Risk: `{plan.get('risk_level')}`
        - ETA: {plan.get('estimated_minutes')} minutes
        - Steps:
        """
    ).strip()

    steps = plan.get('steps') or []
    if steps:
        body += '\n' + '\n'.join(f'{idx + 1}. {step}' for idx, step in enumerate(steps))

    return body