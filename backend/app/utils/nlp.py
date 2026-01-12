import nltk
from textblob import TextBlob
from transformers import pipeline
import logging

# Global model cache
grammar_corrector = None

def init_nlp():
    """Download necessary NLP data and load models."""
    global grammar_corrector
    print("Initializing NLP models...")
    try:
        # NLTK
        nltk.download('punkt', quiet=True)
        nltk.download('wordnet', quiet=True)
        nltk.download('omw-1.4', quiet=True) 
        nltk.download('averaged_perceptron_tagger', quiet=True)
        nltk.download('punkt_tab', quiet=True)
        
        # TextBlob warm-up
        TextBlob("Init").correct()
        
        # Load T5 Model for Grammar Correction
        # Using a smaller, fast model for CPU inference
        print("Loading T5 Grammar Model (this may take a moment)...")
        grammar_corrector = pipeline(
            "text2text-generation",
            model="vennify/t5-base-grammar-correction",
            tokenizer="vennify/t5-base-grammar-correction"
        )
        print("NLP data and models initialized successfully.")
    except Exception as e:
        print(f"Error initializing NLP data: {e}")
        logging.error(f"NLP Init Error: {e}")

def get_grammar_corrector():
    return grammar_corrector
