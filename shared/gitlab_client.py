from __future__ import annotations

import time
from typing import Any, Optional

import httpx


class GitLabClient:
    BASE_URL = 'https://gitlab.com/api/v4'
    MAX_RETRIES = 3
    RETRY_DELAY = 1.0

    def __init__(self, token: str):
        self.token = token
        self.headers = {'PRIVATE-TOKEN': token, 'Content-Type': 'application/json'}

    def get(self, path: str, params: Optional[dict] = None) -> Any:
        return self._request('GET', path, params=params)

    def post(self, path: str, data: Optional[dict] = None) -> Any:
        return self._request('POST', path, json=data)

    def get_raw(self, path: str) -> str:
        return self._request('GET', path, raw=True)

    def _request(self, method: str, path: str, raw: bool = False, **kwargs):
        url = f'{self.BASE_URL}{path}'
        for attempt in range(self.MAX_RETRIES):
            try:
                resp = httpx.request(method, url, headers=self.headers, timeout=15.0, **kwargs)
                if resp.status_code == 429:
                    retry_after = int(resp.headers.get('Retry-After', 60))
                    time.sleep(retry_after)
                    continue
                resp.raise_for_status()
                return resp.text if raw else resp.json()
            except httpx.HTTPStatusError:
                if attempt == self.MAX_RETRIES - 1:
                    raise
                time.sleep(self.RETRY_DELAY * (attempt + 1))

        raise RuntimeError(f'Max retries exceeded for {path}')