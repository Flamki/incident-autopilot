from __future__ import annotations

from collections import Counter
from typing import Dict, List


def score_candidates(primary: dict, blame_owners: List[str], member_map: Dict[str, dict]) -> List[dict]:
    counter = Counter(blame_owners)
    candidates = []

    if primary.get('username'):
        candidates.append({'username': primary['username'], 'score': primary.get('score', 0.9), 'source': 'commit_author'})

    for username, count in counter.items():
        score = min(0.85, 0.35 + count * 0.1)
        if username in member_map:
            score += 0.05
        candidates.append({'username': username, 'score': round(min(score, 0.98), 2), 'source': 'git_blame'})

    dedup: Dict[str, dict] = {}
    for candidate in candidates:
        existing = dedup.get(candidate['username'])
        if not existing or candidate['score'] > existing['score']:
            dedup[candidate['username']] = candidate

    return sorted(dedup.values(), key=lambda c: c['score'], reverse=True)