from __future__ import annotations

import json
import logging
from abc import ABC, abstractmethod
from typing import Any

from shared.exceptions import ClaudeResponseError


class BaseAgent(ABC):
    """Base class for all Incident Autopilot agents."""

    def __init__(self, model=None, gitlab_client=None, **kwargs):
        del kwargs
        self.model = model
        self.gitlab = gitlab_client
        self.logger = logging.getLogger(self.__class__.__name__)

    def ask_claude(self, prompt: str, max_tokens: int = 1000) -> dict[str, Any]:
        if self.model is None:
            raise ClaudeResponseError('Model is not injected by runtime')

        try:
            response = self.model.complete(prompt=prompt, max_tokens=max_tokens)
            text = getattr(response, 'text', '') or ''
            text = text.strip()
            if text.startswith('```'):
                text = text.strip('`')
                if text.startswith('json'):
                    text = text[4:]
            return json.loads(text)
        except json.JSONDecodeError as exc:
            raise ClaudeResponseError('Claude did not return valid JSON') from exc

    @abstractmethod
    def run(self, context: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError