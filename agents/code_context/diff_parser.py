from __future__ import annotations

from typing import Iterable, List


def format_diff(diff_items: Iterable[dict], max_chars: int = 8000) -> str:
    chunks: List[str] = []
    size = 0
    for item in diff_items:
        block = f"FILE: {item.get('new_path') or item.get('old_path')}\n{item.get('diff', '')}\n"
        block_size = len(block)
        if size + block_size > max_chars:
            break
        chunks.append(block)
        size += block_size
    return '\n'.join(chunks)