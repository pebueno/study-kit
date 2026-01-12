from pydantic import BaseModel
from typing import List, Optional

class GrammarCheckRequest(BaseModel):
    text: str

class GrammarErrorPosition(BaseModel):
    start: int
    end: int

class GrammarError(BaseModel):
    type: str # spelling, grammar, style
    position: GrammarErrorPosition
    suggestion: str
    message: str

class GrammarCheckResponse(BaseModel):
    errors: List[GrammarError]

class SummarizeRequest(BaseModel):
    text: str

class SummarizeResponse(BaseModel):
    summary: str

class SynonymsRequest(BaseModel):
    text: Optional[str] = None
    word: str

class SynonymsResponse(BaseModel):
    synonyms: List[str]
