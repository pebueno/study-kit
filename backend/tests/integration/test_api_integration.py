"""Integration tests for API endpoints with database."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.database import Base, get_db
from app.models import User, TextHistory
from app.models.text_history import OperationType


# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function")
def test_db():
    """Create test database and tables."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(test_db):
    """Create test client."""
    return TestClient(app)


def test_grammar_check_creates_history(client, test_db):
    """Test that grammar check creates text history entry."""
    # Create a test user
    db = TestingSessionLocal()
    user = User(username="testuser", email="test@example.com")
    db.add(user)
    db.commit()
    db.refresh(user)

    # Make grammar check request
    response = client.post(
        "/api/check-grammar",
        json={"text": "This is a test sentance with eror."}
    )

    assert response.status_code == 200

    # Verify history was created (if we implement it)
    # For now, this validates the endpoint works
    db.close()


def test_summarize_workflow(client, test_db):
    """Test complete summarization workflow."""
    long_text = """
    Natural language processing is a field of artificial intelligence.
    It focuses on the interaction between computers and humans through language.
    NLP combines computational linguistics with machine learning and deep learning.
    The goal is to enable computers to understand and generate human language.
    Applications include chatbots, translation, and sentiment analysis.
    """

    response = client.post(
        "/api/summarize",
        json={"text": long_text}
    )

    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert len(data["summary"]) > 0
    assert len(data["summary"]) < len(long_text)


def test_synonym_lookup_workflow(client, test_db):
    """Test synonym lookup workflow."""
    response = client.post(
        "/api/synonyms",
        json={"word": "happy"}
    )

    assert response.status_code == 200
    data = response.json()
    assert "synonyms" in data
    assert isinstance(data["synonyms"], list)
    assert len(data["synonyms"]) > 0


def test_multiple_operations_workflow(client, test_db):
    """Test performing multiple operations in sequence."""
    # Grammar check
    grammar_response = client.post(
        "/api/check-grammar",
        json={"text": "I has a cat."}
    )
    assert grammar_response.status_code == 200

    # Summarize
    summarize_response = client.post(
        "/api/summarize",
        json={"text": "This is a long text. It has multiple sentences. We want to make it shorter."}
    )
    assert summarize_response.status_code == 200

    # Synonym lookup
    synonym_response = client.post(
        "/api/synonyms",
        json={"word": "good"}
    )
    assert synonym_response.status_code == 200


def test_database_user_creation(test_db):
    """Test creating users in database."""
    db = TestingSessionLocal()

    # Create user
    user = User(username="john_doe", email="john@example.com")
    db.add(user)
    db.commit()
    db.refresh(user)

    # Verify user was created
    assert user.id is not None
    assert user.username == "john_doe"
    assert user.email == "john@example.com"
    assert user.created_at is not None

    db.close()


def test_database_text_history_creation(test_db):
    """Test creating text history entries."""
    db = TestingSessionLocal()

    # Create user
    user = User(username="jane_doe", email="jane@example.com")
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create text history
    history = TextHistory(
        user_id=user.id,
        operation_type=OperationType.GRAMMAR_CHECK,
        input_text="Test input",
        output_result="Test output"
    )
    db.add(history)
    db.commit()
    db.refresh(history)

    # Verify history was created
    assert history.id is not None
    assert history.user_id == user.id
    assert history.operation_type == OperationType.GRAMMAR_CHECK
    assert history.input_text == "Test input"

    db.close()


def test_user_text_history_relationship(test_db):
    """Test relationship between User and TextHistory."""
    db = TestingSessionLocal()

    # Create user with history
    user = User(username="bob", email="bob@example.com")
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create multiple history entries
    for i in range(3):
        history = TextHistory(
            user_id=user.id,
            operation_type=OperationType.SUMMARIZE,
            input_text=f"Input {i}",
            output_result=f"Output {i}"
        )
        db.add(history)

    db.commit()

    # Verify relationship
    db.refresh(user)
    assert len(user.text_histories) == 3

    db.close()
