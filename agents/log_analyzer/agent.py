from __future__ import annotations

from shared.base_agent import BaseAgent
from shared.exceptions import AgentError, ClaudeResponseError

from .error_classifier import pre_classify_error
from .log_parser import extract_file_paths, extract_key_lines


class LogAnalyzerAgent(BaseAgent):
    MAX_LOG_CHARS = 40000

    def run(self, context: dict) -> dict:
        pipeline_id = context.get('pipeline_id')
        project_id = context.get('project_id')
        if not pipeline_id:
            raise AgentError('No pipeline_id in context')

        failed_jobs = self._get_failed_jobs(project_id, pipeline_id)
        if not failed_jobs:
            return self._partial_result('No failed jobs found')

        primary_job = failed_jobs[0]
        raw_log = self._get_job_log(project_id, primary_job['id'])
        truncated_log = raw_log[-self.MAX_LOG_CHARS :]

        pre_class = pre_classify_error(raw_log)
        key_lines = extract_key_lines(raw_log, max_lines=15)
        affected_files = extract_file_paths(raw_log)

        try:
            claude_result = self._analyze_with_claude(
                raw_log=truncated_log,
                pre_class=pre_class,
                failed_stage=primary_job.get('stage'),
                failed_job=primary_job.get('name'),
            )
        except ClaudeResponseError:
            claude_result = {
                'error_type': pre_class,
                'error_summary': 'Claude analysis unavailable. Falling back to regex classifier.',
                'affected_files': affected_files,
                'confidence': 0.45,
            }

        return {
            'pipeline': {
                'failed_job_id': primary_job['id'],
                'failed_stage': primary_job.get('stage'),
                'failed_job': primary_job.get('name'),
                'error_type': claude_result.get('error_type', pre_class),
                'error_summary': claude_result.get('error_summary', ''),
                'key_log_lines': key_lines,
                'affected_files': list(set(affected_files + claude_result.get('affected_files', []))),
                'confidence': claude_result.get('confidence', 0.7),
            }
        }

    def _get_failed_jobs(self, project_id, pipeline_id):
        jobs = self.gitlab.get(
            f'/projects/{project_id}/pipelines/{pipeline_id}/jobs',
            params={'scope': 'failed'},
        )
        return sorted(jobs, key=lambda j: j.get('id', 0))

    def _get_job_log(self, project_id, job_id) -> str:
        return self.gitlab.get_raw(f'/projects/{project_id}/jobs/{job_id}/trace')

    def _analyze_with_claude(self, raw_log, pre_class, failed_stage, failed_job) -> dict:
        prompt = f'''You are an expert DevOps engineer.
Analyze this CI/CD pipeline failure. Respond ONLY with valid JSON.
Failed stage: {failed_stage}
Failed job: {failed_job}
Pre-classification: {pre_class}
Pipeline logs (last portion):
---
{raw_log}
---
Return this exact JSON structure:
{{
"error_type": "test_failure|build_error|timeout|oom|config_error|permission_error|network_error|unknown",
"error_summary": "2-sentence plain English description of what failed",
"affected_files": ["file/path.py"],
"confidence": 0.0
}}
Return ONLY the JSON. No explanation.'''
        return self.ask_claude(prompt, max_tokens=600)

    def _partial_result(self, reason: str) -> dict:
        return {
            'pipeline': {
                'error_type': 'unknown',
                'error_summary': f'Could not analyze: {reason}',
                'affected_files': [],
                'key_log_lines': [],
                'confidence': 0.0,
            }
        }