from __future__ import annotations

import json
from typing import Any


def parse_json_response(text: str) -> dict[str, Any]:
    cleaned = text.strip()
    if cleaned.startswith('```'):
        cleaned = cleaned.strip('`')
        if cleaned.startswith('json'):
            cleaned = cleaned[4:]
    return json.loads(cleaned)