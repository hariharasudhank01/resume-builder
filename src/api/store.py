from api.schemas.session import SessionResponse

# In-memory storage: lost on every server restart. Replaced by a real database later.
_sessions: dict[str, SessionResponse] = {}


def save_session(session: SessionResponse) -> None:
    _sessions[session.id] = session


def get_session(session_id: str) -> SessionResponse | None:
    return _sessions.get(session_id)
