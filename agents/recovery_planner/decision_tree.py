from __future__ import annotations


def choose_fallback_plan(error_type: str) -> dict:
    if error_type in {'test_failure', 'build_error'}:
        return {
            'recommendation': 'rollback',
            'urgency': 'high',
            'reasoning': 'Fastest low-risk mitigation for broken build/test path.',
            'steps': ['Revert breaking commit', 'Run CI suite', 'Open follow-up root cause issue'],
            'rollback_command': 'git revert <breaking_sha>',
            'estimated_minutes': 15,
            'risk_level': 'low',
            'prevention': 'Add regression tests around changed code path.',
        }
    if error_type in {'oom', 'timeout'}:
        return {
            'recommendation': 'config_change',
            'urgency': 'high',
            'reasoning': 'Resource constraints suggest runtime tuning over rollback.',
            'steps': ['Increase memory/cpu limits', 'Redeploy service', 'Monitor error rate'],
            'rollback_command': None,
            'estimated_minutes': 20,
            'risk_level': 'medium',
            'prevention': 'Create autoscaling guardrails and load-test thresholds.',
        }
    return {
        'recommendation': 'retry',
        'urgency': 'medium',
        'reasoning': 'Insufficient evidence for decisive rollback; retry and monitor.',
        'steps': ['Retry pipeline', 'Collect additional telemetry', 'Escalate to owner if recurring'],
        'rollback_command': None,
        'estimated_minutes': 10,
        'risk_level': 'medium',
        'prevention': 'Improve observability and error categorization quality.',
    }