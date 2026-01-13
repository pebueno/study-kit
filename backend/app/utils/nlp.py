import nltk
from textblob import TextBlob
import logging
import os

# Lazy loading imports (only import when needed)
grammar_corrector = None
_use_t5_model = os.getenv("USE_T5_MODEL", "false").lower() == "true"

def init_nlp():
    """Download necessary NLP data (lightweight - no heavy models)."""
    print("Initializing NLP data...")
    try:
        # NLTK - only essential data
        nltk.download('punkt', quiet=True)
        nltk.download('wordnet', quiet=True)
        nltk.download('omw-1.4', quiet=True)
        nltk.download('punkt_tab', quiet=True)

        # TextBlob warm-up (lightweight)
        TextBlob("test").correct()

        print("NLP data initialized successfully (lightweight mode).")
        if _use_t5_model:
            print("T5 model will be loaded on first grammar check request.")
        else:
            print("T5 model disabled (using LanguageTool + TextBlob only).")
    except Exception as e:
        print(f"Error initializing NLP data: {e}")
        logging.error(f"NLP Init Error: {e}")

    return grammar_corrector


# Lightweight Gemini Client
class GeminiCorrector:
    def __init__(self, api_key):
        self.api_key = api_key
        # Using gemini-1.5-flash for speed/cost (free tier)
        self.url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        
    def __call__(self, text, **kwargs):
        """Mimics the Transformers pipeline interface."""
        import httpx
        import json
        
        prompt = (
            "Correct the grammar and spelling of the following text. "
            "Return ONLY the corrected text. Maintain the original meaning and tone.\n\n"
            f"Text: {text}"
        )
        
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        
        try:
            # Short timeout to avoid hanging
            response = httpx.post(self.url, json=payload, timeout=5.0)
            if response.status_code == 200:
                data = response.json()
                if "candidates" in data and data["candidates"]:
                    corrected_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    return [{'generated_text': corrected_text.strip()}]
            else:
                print(f"Gemini API Error: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"Gemini Call Failed: {e}")
            
        # Fallback: return original text effectively (no change) or empty list
        # Returning empty list means "no correction found" (or failure)
        return []

def get_grammar_corrector():
    """Get the best available corrector (Gemini > T5 > None)."""
    global grammar_corrector
    
    # 1. Check for Gemini Key
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        if not isinstance(grammar_corrector, GeminiCorrector):
            print("Initializing Gemini Grammar Corrector...")
            grammar_corrector = GeminiCorrector(api_key)
        return grammar_corrector

    # 2. Check for T5
    if not _use_t5_model:
        return None

    # Lazy load T5 on first request
    if grammar_corrector is None:
        try:
            print("Loading T5 Grammar Model (first request)...")
            from transformers import pipeline, T5ForConditionalGeneration, T5Tokenizer
            import torch

            model_name = "vennify/t5-base-grammar-correction"
            tokenizer = T5Tokenizer.from_pretrained(model_name)
            model = T5ForConditionalGeneration.from_pretrained(model_name)

            # Quantize for lower memory
            quantized_model = torch.quantization.quantize_dynamic(
                model, {torch.nn.Linear}, dtype=torch.qint8
            )

            grammar_corrector = pipeline(
                "text2text-generation",
                model=quantized_model,
                tokenizer=tokenizer
            )
            print("T5 model loaded successfully.")
        except Exception as e:
            print(f"Failed to load T5 model: {e}")
            logging.error(f"T5 Model Load Error: {e}")
            # Continue without T5 - will use LanguageTool
            return None

    return grammar_corrector
