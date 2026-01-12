from fastapi import APIRouter
from app.models.schemas import (
    GrammarCheckRequest, GrammarCheckResponse, GrammarError, GrammarErrorPosition,
    SummarizeRequest, SummarizeResponse,
    SynonymsRequest, SynonymsResponse
)
import language_tool_python
import random

router = APIRouter()
tool = language_tool_python.LanguageTool('en-US')

@router.post("/check-grammar", response_model=GrammarCheckResponse)
def check_grammar(request: GrammarCheckRequest):
    matches = tool.check(request.text)
    errors = []
    for match in matches:
        error_type = 'spelling' if match.ruleIssueType == 'misspelling' else 'grammar'
        errors.append(GrammarError(
            type=error_type,
            position=GrammarErrorPosition(
                start=match.offset,
                end=match.offset + match.errorLength
            ),
            suggestion=match.replacements[0] if match.replacements else "",
            message=match.message
        ))
    return GrammarCheckResponse(errors=errors)

@router.post("/summarize", response_model=SummarizeResponse)
def summarize(request: SummarizeRequest):
    # Simple heuristic summarization for now
    sentences = [s.strip() for s in request.text.split('.') if s.strip()]
    if len(sentences) <= 2:
        return SummarizeResponse(summary=request.text)
    
    # Take first and last sentence
    summary = f"{sentences[0]}. {sentences[-1]}."
    return SummarizeResponse(summary=summary)

@router.post("/synonyms", response_model=SynonymsResponse)
def get_synonyms(request: SynonymsRequest):
    # Basic mock synonyms for demonstration
    # In a real app, integrate NLTK wordnet or PyDictionary
    common_synonyms = {
        'good': ['excellent', 'great', 'superb', 'fine'],
        'bad': ['poor', 'terrible', 'awful', 'subpar'],
        'happy': ['joyful', 'content', 'cheerful', 'delighted'],
        'sad': ['unhappy', 'sorrowful', 'gloomy', 'miserable'],
        'big': ['large', 'huge', 'enormous', 'gigantic'],
        'small': ['tiny', 'minute', 'miniature', 'compact']
    }
    word = request.word.lower()
    return SynonymsResponse(synonyms=common_synonyms.get(word, []))
