from __future__ import annotations

from datetime import datetime, timezone
from typing import Dict, List


def _file_overlap_score(changed_files: List[str], affected_files: List[str]) -> float:
    if not affected_files:
        return 0.2
    overlap = len(set(changed_files) & set(affected_files))
    return overlap / max(len(set(affected_files)), 1)


def _time_proximity_score(authored_date: str, pipeline_failed_at: datetime) -> float:
    try:
        commit_time = datetime.fromisoformat(authored_date.replace('Z', '+00:00'))
    except ValueError:
        return 0.0
    delta_hours = abs((pipeline_failed_at - commit_time).total_seconds()) / 3600
    return max(0.0, 1.0 - min(delta_hours / 48, 1.0))


def _change_size_score(commit: Dict) -> float:
    stats = commit.get('stats') or {}
    changes = int(stats.get('additions', 0)) + int(stats.get('deletions', 0))
    if changes <= 15:
        return 0.3
    if changes <= 80:
        return 0.7
    if changes <= 220:
        return 1.0
    return 0.4


def _merge_penalty(commit: Dict) -> float:
    return 0.0 if commit.get('parent_ids') and len(commit['parent_ids']) > 1 else 1.0


def calculate_commit_score(
    commit: Dict,
    changed_files: List[str],
    affected_files: List[str],
    pipeline_failed_at: datetime,
) -> float:
    overlap = _file_overlap_score(changed_files, affected_files)
    time_score = _time_proximity_score(commit.get('authored_date', datetime.now(timezone.utc).isoformat()), pipeline_failed_at)
    size_score = _change_size_score(commit)
    merge_score = _merge_penalty(commit)

    score = 0.4 * overlap + 0.3 * time_score + 0.2 * size_score + 0.1 * merge_score
    return round(score, 4)