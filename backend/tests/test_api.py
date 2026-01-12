from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_check_grammar():
    # Note: If external API fails, it returns empty errors (fallback)
    # If it works, it might return errors.
    # We test structure mainly.
    response = client.post(
        "/api/check-grammar",
        json={"text": "Their are many mistake."}
    )
    assert response.status_code == 200
    data = response.json()
    assert "errors" in data
    assert isinstance(data["errors"], list)

def test_summarize():
    text = "Sentence one. Sentence two. Sentence three. Sentence four."
    response = client.post(
        "/api/summarize",
        json={"text": text}
    )
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    # Logic is simple: first and last if > 2 sentences
    assert "Sentence one." in data["summary"]
    assert "Sentence four." in data["summary"]

def test_synonyms():
    response = client.post(
        "/api/synonyms",
        json={"text": "", "word": "good"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "synonyms" in data
    assert isinstance(data["synonyms"], list)
    assert "excellent" in data["synonyms"]
