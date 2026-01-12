from fastapi.testclient import TestClient
from app.main import app
from app.utils.nlp import init_nlp

# Ensure NLP data is loaded for tests
init_nlp()

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

    # Test specific neural correction and spelling
    # "gooing" -> "going" (T5 Context or Spelling)
    # "grate" -> "well" (T5 Context)
    # "mistaks" -> "mistakes" (Spelling Fallback)
    
    response = client.post(
        "/api/check-grammar",
        json={"text": "I hope your day is gooing grate. This text has many mistaks."}
    )
    assert response.status_code == 200
    data = response.json()
    errors = data.get("errors", [])
    assert len(errors) > 0
    
    suggestions = [e['suggestion'].lower() for e in errors]
    messages = [e['message'].lower() for e in errors]
    
    # Check T5 context fix
    assert any("going" in s for s in suggestions)
    assert any("well" in s or "great" in s for s in suggestions)
    
    # Check Spelling Fallback (LanguageTool/TextBlob)
    # "mistaks" should be caught even if T5 ignores it (or if T5 fixes it, great)
    assert any("mistake" in s for s in suggestions) or any("mistake" in m for m in messages)

def test_summarize_lsa():
    text = (
        "Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by humans or animals. "
        "Leading AI textbooks define the field as the study of 'intelligent agents': any system that perceives its environment and takes actions that maximize its chance of achieving its goals. "
        "Some popular accounts use the term 'artificial intelligence' to describe machines that mimic 'cognitive' functions that humans associate with the human mind, such as 'learning' and 'problem solving'. "
        "AI applications include advanced web search engines, recommendation systems, understanding human speech, self-driving cars, automated decision-making and competing at the highest level in strategic game systems."
    )
    response = client.post(
        "/api/summarize",
        json={"text": text}
    )
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    # Summary should be shorter than original
    assert len(data["summary"]) < len(text)
    assert len(data["summary"]) > 0

def test_synonyms_nltk():
    response = client.post(
        "/api/synonyms",
        json={"text": "", "word": "happy"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "synonyms" in data
    syns = data["synonyms"]
    # Check for common synonyms of 'happy' from WordNet
    assert any(w in syns for w in ["glad", "joyful", "felicitous", "content"])
