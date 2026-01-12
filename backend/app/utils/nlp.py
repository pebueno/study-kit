import nltk
from textblob import TextBlob
from transformers import pipeline, T5ForConditionalGeneration, T5Tokenizer
import logging
import torch

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
        print("Loading T5 Grammar Model (this may take a moment)...")
        model_name = "vennify/t5-base-grammar-correction"
        
        # Load tokenizer and model separately to enable quantization
        tokenizer = T5Tokenizer.from_pretrained(model_name)
        model = T5ForConditionalGeneration.from_pretrained(model_name)
        
        # Apply Dynamic Quantization (Linear layers -> int8)
        # This reduces size and speeds up CPU inference significantly
        print("Optimizing model with dynamic quantization...")
        quantized_model = torch.quantization.quantize_dynamic(
            model, {torch.nn.Linear}, dtype=torch.qint8
        )
        
        grammar_corrector = pipeline(
            "text2text-generation",
            model=quantized_model,
            tokenizer=tokenizer
        )
        print("NLP data and models initialized successfully.")
    except Exception as e:
        print(f"Error initializing NLP data: {e}")
        logging.error(f"NLP Init Error: {e}")

def get_grammar_corrector():
    return grammar_corrector
