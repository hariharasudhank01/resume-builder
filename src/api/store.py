"""
This Script file is used as temp in-memory storage area.
This Script will be removed once the application is moved to Database
"""
from api.schemas.session import SessionResponse

# In-memory storage: lost on every server restart. Replaced by a real database later.
_sessions: dict[str, SessionResponse] = {}


def save_session(session: SessionResponse) -> None:
    """
    This function stores each session created in the temp
    dict _sessions.

    Arguments:
        - session: SessionResponse, Current Session
    Returns:
        None
    """
    _sessions[session.id] = session


def get_session(session_id: str) -> SessionResponse | None:
    """
    This function returns the session based on the provided
    session_id from the _sessions dict

    Arguments:
        - session_id: int, session ID of the requested session
    Returns:
        - SessionResponse, session.
    """
    return _sessions.get(session_id)
