from fastapi import APIRouter
from app.models.schemas import (
    GrammarCheckRequest, GrammarCheckResponse, GrammarError, GrammarErrorPosition,
    SummarizeRequest, SummarizeResponse,
    SynonymsRequest, SynonymsResponse
)
import language_tool_python
from textblob import TextBlob
from nltk.corpus import wordnet
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words
import nltk
from app.utils.nlp import get_grammar_corrector

router = APIRouter()

# Initialize LanguageTool (keep remote server as primary)
try:
    tool = language_tool_python.LanguageTool('en-US', remote_server='https://api.languagetool.org/v2/')
except Exception as e:
    print(f"Warning: Could not initialize LanguageTool: {e}")
    tool = None

@router.post("/check-grammar", response_model=GrammarCheckResponse)
def check_grammar(request: GrammarCheckRequest):
    errors = []
    corrector = get_grammar_corrector()
    
    # 1. Run T5 Context-Aware Check
    t5_errors = []
    if corrector:
        try:
            blob = TextBlob(request.text)
            offset = 0
            for sentence in blob.sentences:
                original_text = str(sentence)
                results = corrector(original_text, max_length=128)
                if results and len(results) > 0:
                    corrected_text = results[0]['generated_text']
                    
                    if corrected_text.strip() != original_text.strip():
                        import difflib
                        
                        orig_words = original_text.split()
                        corr_words = corrected_text.split()
                        matcher = difflib.SequenceMatcher(None, orig_words, corr_words)
                        
                        # Map words to char positions
                        word_positions = []
                        current_pos = 0
                        for word in orig_words:
                            start = original_text.find(word, current_pos)
                            if start == -1: start = current_pos # Fallback
                            end = start + len(word)
                            word_positions.append((start, end))
                            current_pos = end
                        
                        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
                            if tag == 'replace':
                                bad_phrase = " ".join(orig_words[i1:i2])
                                suggestion = " ".join(corr_words[j1:j2])
                                if i1 < len(word_positions):
                                    start_char = word_positions[i1][0]
                                    end_char = word_positions[i2-1][1] if i2 > 0 else start_char
                                    t5_errors.append(GrammarError(
                                        type='grammar',
                                        position=GrammarErrorPosition(start=offset + start_char, end=offset + end_char),
                                        suggestion=suggestion,
                                        message=f"Consider changing '{bad_phrase}' to '{suggestion}'"
                                    ))
                            elif tag == 'delete':
                                bad_phrase = " ".join(orig_words[i1:i2])
                                if i1 < len(word_positions):
                                    start_char = word_positions[i1][0]
                                    end_char = word_positions[i2-1][1] if i2 > 0 else start_char
                                    t5_errors.append(GrammarError(
                                        type='grammar',
                                        position=GrammarErrorPosition(start=offset + start_char, end=offset + end_char),
                                        suggestion="",
                                        message=f"Consider removing '{bad_phrase}'"
                                    ))
                            elif tag == 'insert':
                                suggestion = " ".join(corr_words[j1:j2])
                                if i1 < len(word_positions):
                                    start_char = word_positions[i1][0]
                                else:
                                    start_char = len(original_text)
                                t5_errors.append(GrammarError(
                                        type='grammar',
                                        position=GrammarErrorPosition(start=offset + start_char, end=offset + start_char + 1),
                                        suggestion=suggestion,
                                        message=f"Missing: '{suggestion}'"
                                    ))

                # Simple offset update - robust enough for simple spacing
                offset += len(original_text) + (1 if offset + len(original_text) < len(request.text) else 0)

        except Exception as e:
            print(f"T5 Error: {e}")

    # 2. Run Spelling Check (LanguageTool or TextBlob)
    spelling_errors = []
    
    # Try LanguageTool first
    if tool:
        try:
            matches = tool.check(request.text)
            for match in matches:
                # We mainly want spelling from LT if T5 missed it, but LT finds grammar too.
                error_type = 'spelling' if match.ruleIssueType == 'misspelling' else 'grammar'
                spelling_errors.append(GrammarError(
                    type=error_type,
                    position=GrammarErrorPosition(start=match.offset, end=match.offset + match.errorLength),
                    suggestion=match.replacements[0] if match.replacements else "",
                    message=match.message
                ))
        except Exception:
            pass
            
    # Fallback/Augment with TextBlob for pure spelling if LT failed or empty?
    # For now, let's rely on LT if available. If not, TextBlob.
    if not spelling_errors and not tool:
        blob = TextBlob(request.text)
        offset = 0
        for word in blob.words:
            corrected = word.correct()
            if word != corrected and len(word) > 1:
                # Find position
                start = request.text.find(word, offset)
                if start != -1:
                    spelling_errors.append(GrammarError(
                        type='spelling',
                        position=GrammarErrorPosition(start=start, end=start+len(word)),
                        suggestion=str(corrected),
                        message=f"Possible spelling mistake: {word}"
                    ))
                    offset = start + len(word)

    # 3. Merge & Dedup
    # Priority: T5 errors > Spelling errors.
    # If a spelling error overlaps with a T5 error, assume T5 handled it (rewrote the phrase).
    
    final_errors = list(t5_errors)
    
    for s_err in spelling_errors:
        is_covered = False
        s_start = s_err.position.start
        s_end = s_err.position.end
        
        for t_err in t5_errors:
            t_start = t_err.position.start
            t_end = t_err.position.end
            
            # Check overlap
            if max(s_start, t_start) < min(s_end, t_end):
                is_covered = True
                break
        
        if not is_covered:
            final_errors.append(s_err)

    final_errors.sort(key=lambda x: x.position.start)
    return GrammarCheckResponse(errors=final_errors)

    return GrammarCheckResponse(errors=errors)

@router.post("/summarize", response_model=SummarizeResponse)
def summarize(request: SummarizeRequest):
    text = request.text
    if not text.strip():
        return SummarizeResponse(summary="")
        
    try:
        parser = PlaintextParser.from_string(text, Tokenizer("english"))
        stemmer = Stemmer("english")
        summarizer = LsaSummarizer(stemmer)
        summarizer.stop_words = get_stop_words("english")
        
        # Summarize to 20% of sentences or at least 3
        # Improve logic: count sentences first
        sentences = list(parser.document.sentences)
        sentence_count = len(sentences)
        
        if sentence_count <= 2:
            return SummarizeResponse(summary=text)
            
        count = max(2, int(sentence_count * 0.3))
        summary_sentences = summarizer(parser.document, count)
        
        summary = " ".join([str(s) for s in summary_sentences])
        return SummarizeResponse(summary=summary)
    except Exception as e:
        print(f"Summarization error: {e}")
        # Fallback
        return SummarizeResponse(summary=text)

@router.post("/synonyms", response_model=SynonymsResponse)
def get_synonyms(request: SynonymsRequest):
    word = request.word.lower()
    synonyms = set()
    
    try:
        # Use NLTK WordNet
        for syn in wordnet.synsets(word):
            for lemma in syn.lemmas():
                name = lemma.name().replace('_', ' ')
                if name.lower() != word:
                    synonyms.add(name)
    except Exception as e:
        print(f"WordNet error: {e}")

    # Fallback/Hardcoded list if NLTK empty (for common words not in wordnet?? usually everything is in wordnet)
    if not synonyms:
         common_synonyms = {
            'good': ['excellent', 'great', 'superb', 'fine'],
         }
         return SynonymsResponse(synonyms=common_synonyms.get(word, []))
         
    return SynonymsResponse(synonyms=list(synonyms))
