import nltk
from textblob import TextBlob

def init_nlp():
    """Download necessary NLP data."""
    try:
        nltk.download('punkt', quiet=True)
        nltk.download('wordnet', quiet=True)
        nltk.download('omw-1.4', quiet=True) # Open Multilingual Wordnet
        nltk.download('averaged_perceptron_tagger', quiet=True)
        nltk.download('punkt_tab', quiet=True)
        
        # Testing TextBlob to trigger any lazy loads if needed
        TextBlob("Init").correct()
        print("NLP data initialized successfully.")
    except Exception as e:
        print(f"Error initializing NLP data: {e}")
