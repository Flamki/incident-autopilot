from __future__ import annotations

import re
from typing import List


def extract_key_lines(log: str, max_lines: int = 15) -> List[str]:
    interesting = []
    for line in log.splitlines():
        if any(token in line.lower() for token in ['error', 'failed', 'exception', 'traceback', 'oom', 'timeout']):
            interesting.append(line.strip())
    return interesting[:max_lines]


def extract_file_paths(log: str) -> List[str]:
    pattern = re.compile(r'([\w\-./]+\.(?:py|ts|tsx|js|jsx|go|java|rb|yml|yaml|json|toml))')
    paths = pattern.findall(log)
    unique = []
    seen = set()
    for path in paths:
        if path not in seen:
            seen.add(path)
            unique.append(path)
    return unique[:30]