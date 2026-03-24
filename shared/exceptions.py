class AgentError(Exception):
    """Known recoverable agent errors."""


class ClaudeResponseError(AgentError):
    """Raised when Claude returns unparseable content."""