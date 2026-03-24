from __future__ import annotations

from typing import Dict, Set

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from api.core.security import verify_jwt

router = APIRouter()


class ConnectionManager:
    def __init__(self) -> None:
        self.active: Dict[str, Set[WebSocket]] = {}

    async def connect(self, ws: WebSocket, user_id: str) -> None:
        await ws.accept()
        self.active.setdefault(user_id, set()).add(ws)

    def disconnect(self, ws: WebSocket, user_id: str) -> None:
        conns = self.active.get(user_id)
        if not conns:
            return
        conns.discard(ws)
        if not conns:
            self.active.pop(user_id, None)

    async def push_to_user(self, user_id: str, data: dict) -> None:
        conns = self.active.get(user_id)
        if not conns:
            return
        dead: Set[WebSocket] = set()
        for ws in conns:
            try:
                await ws.send_json(data)
            except Exception:
                dead.add(ws)
        for ws in dead:
            self.disconnect(ws, user_id)

    async def broadcast(self, data: dict) -> None:
        for user_id in list(self.active.keys()):
            await self.push_to_user(user_id, data)


manager = ConnectionManager()


@router.websocket('/ws')
async def websocket_endpoint(ws: WebSocket, token: str = Query(...)):
    payload = verify_jwt(token)
    user_id = str(payload.get('sub'))
    await manager.connect(ws, user_id)

    try:
        while True:
            data = await ws.receive_text()
            if data == 'ping':
                await ws.send_text('pong')
    except WebSocketDisconnect:
        manager.disconnect(ws, user_id)