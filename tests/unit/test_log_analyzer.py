from unittest.mock import MagicMock

from agents.log_analyzer.agent import LogAnalyzerAgent


def test_run_returns_pipeline_section():
    model = MagicMock()
    model.complete.return_value = MagicMock(
        text='{"error_type":"test_failure","error_summary":"pytest failed","affected_files":["auth.py"],"confidence":0.94}'
    )
    gitlab = MagicMock()
    gitlab.get.return_value = [{'id': 100, 'stage': 'test', 'name': 'unit-tests'}]
    gitlab.get_raw.return_value = 'FAILED auth/test_auth.py AssertionError: assert True == False'

    agent = LogAnalyzerAgent(model=model, gitlab_client=gitlab)
    result = agent.run({'project_id': 1, 'pipeline_id': 123})

    assert 'pipeline' in result
    assert result['pipeline']['error_type'] == 'test_failure'
    assert result['pipeline']['confidence'] > 0.5


def test_handles_no_failed_jobs():
    model = MagicMock()
    gitlab = MagicMock()
    gitlab.get.return_value = []
    gitlab.get_raw.return_value = ''

    agent = LogAnalyzerAgent(model=model, gitlab_client=gitlab)
    result = agent.run({'project_id': 1, 'pipeline_id': 999})
    assert result['pipeline']['error_type'] == 'unknown'


def test_handles_claude_json_error_fallback():
    model = MagicMock()
    model.complete.return_value = MagicMock(text='not json')
    gitlab = MagicMock()
    gitlab.get.return_value = [{'id': 100, 'stage': 'test', 'name': 'unit-tests'}]
    gitlab.get_raw.return_value = 'FAILED test session failed'

    agent = LogAnalyzerAgent(model=model, gitlab_client=gitlab)
    result = agent.run({'project_id': 1, 'pipeline_id': 123})
    assert 'pipeline' in result