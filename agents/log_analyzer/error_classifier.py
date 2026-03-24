from __future__ import annotations

import re

ERROR_PATTERNS = {
    'test_failure': [
        r'AssertionError',
        r'FAILED',
        r'test session failed',
        r'\d+ failed',
        r'pytest.*error',
        r'jest.*failed',
    ],
    'build_error': [
        r'error: could not compile',
        r'ModuleNotFoundError',
        r'ImportError',
        r'SyntaxError',
        r'npm ERR!',
    ],
    'timeout': [r'timed out', r'timeout exceeded', r'Job execution took'],
    'oom': [r'Out of memory', r'Cannot allocate memory', r'OOMKilled'],
    'config_error': [r'YAML error', r'Invalid configuration', r'undefined variable'],
    'permission_error': [r'Permission denied', r'403 Forbidden', r'Access denied'],
    'network_error': [r'Connection refused', r'DNS lookup failed', r'ECONNREFUSED'],
}


def pre_classify_error(log: str) -> str:
    for error_type, patterns in ERROR_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, log, re.IGNORECASE):
                return error_type
    return 'unknown'