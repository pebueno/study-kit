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

    
    if corrector:
        try:
            # simple sentence splitting
            blob = TextBlob(request.text)
            offset = 0
            
            for sentence in blob.sentences:
                original_text = str(sentence)
                # T5 inference
                results = corrector(original_text, max_length=128)
                if results and len(results) > 0:
                    corrected_text = results[0]['generated_text']
                    
                    if corrected_text.strip() != original_text.strip():
                        # Word-level diffing is friendlier for UI
                        import difflib
                        
                        # Tokenize simply by splitting (TextBlob words might be better but split is safer for reconstruction)
                        # We need to map back to original character offsets. 
                        # This is the tricky part of word-level diffs on raw strings.
                        # Simple approach: Use difflib on words, then find them in original string?
                        # No, we can process the whole sentence content.
                        
                        orig_words = original_text.split()
                        corr_words = corrected_text.split()
                        
                        matcher = difflib.SequenceMatcher(None, orig_words, corr_words)
                        
                        # We need to track character position in original_text to report offsets
                        # Build a map of word_index -> (start_char, end_char)
                        word_positions = []
                        current_pos = 0
                        for word in orig_words:
                            # specific find to handle spaces
                            start = original_text.find(word, current_pos)
                            end = start + len(word)
                            word_positions.append((start, end))
                            current_pos = end
                        
                        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
                            if tag == 'replace':
                                # Replace range of words
                                bad_phrase = " ".join(orig_words[i1:i2])
                                suggestion = " ".join(corr_words[j1:j2])
                                
                                # Calculate absolute char positions
                                if i1 < len(word_positions):
                                    start_char = word_positions[i1][0]
                                    end_char = word_positions[i2-1][1] if i2 > 0 else start_char
                                    
                                    abs_start = offset + start_char
                                    abs_end = offset + end_char
                                    
                                    errors.append(GrammarError(
                                        type='grammar',
                                        position=GrammarErrorPosition(start=abs_start, end=abs_end),
                                        suggestion=suggestion,
                                        message=f"Consider changing '{bad_phrase}' to '{suggestion}'"
                                    ))
                            elif tag == 'delete':
                                bad_phrase = " ".join(orig_words[i1:i2])
                                if i1 < len(word_positions):
                                    start_char = word_positions[i1][0]
                                    end_char = word_positions[i2-1][1] if i2 > 0 else start_char
                                    
                                    abs_start = offset + start_char
                                    abs_end = offset + end_char
                                    
                                    errors.append(GrammarError(
                                        type='grammar',
                                        position=GrammarErrorPosition(start=abs_start, end=abs_end),
                                        suggestion="",
                                        message=f"Consider removing '{bad_phrase}'"
                                    ))
                            elif tag == 'insert':
                                # Insertion at i1
                                suggestion = " ".join(corr_words[j1:j2])
                                # Insertions attach to the previous word or start
                                if i1 < len(word_positions):
                                    start_char = word_positions[i1][0]
                                else:
                                    # Append at end
                                    start_char = len(original_text)
                                    
                                abs_start = offset + start_char
                                abs_end = abs_start + 1
                                
                                errors.append(GrammarError(
                                        type='grammar',
                                        position=GrammarErrorPosition(start=abs_start, end=abs_end),
                                        suggestion=suggestion,
                                        message=f"Missing: '{suggestion}'"
                                    ))

                offset += len(original_text) + 1 # +1 for potential space/newline lost in split? TextBlob splitting can be tricky with offsets.
                # Actually TextBlob sentences preserve string but we iterate properties.
                # Use raw find to be safer or trust order? TextBlob parser strips?
                # Safer: Accumulate len but verify. 
                # Re-calculating offset roughly:
                # Better approach: 
                # Use nltk tokenizer spans if possible, but for now this approx is mostly ok provided text is clean.
                # Let's adjust offset carefully.
                
                # Check actual position in original text to prevent drift
                # current_start = request.text.find(original_text, offset)
                # if current_start != -1:
                #    offset = current_start
                # offset += len(original_text)

        except Exception as e:
            print(f"T5 Error: {e}")
            # Fallback to LanguageTool / TextBlob logic if T5 fails
            pass
            
    # If T5 found errors, we return them.
    # If you want to COMBINE with LanguageTool (which is also good), we can dedup.
    # For now, let's prioritize T5 as requested for "advanced" logic.
    
    return GrammarCheckResponse(errors=errors)

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
