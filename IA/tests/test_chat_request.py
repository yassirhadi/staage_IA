from app.schemas.requests import ChatRequest


def test_chat_request_accepts_message_alias():
    request = ChatRequest(message='Quels documents contiennent un CIN ?')
    assert request.get_text() == 'Quels documents contiennent un CIN ?'
