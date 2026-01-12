export type ErrorType = 'spelling' | 'grammar' | 'style';

export interface GrammarError {
  id: string;
  type: ErrorType;
  word: string;
  startIndex: number;
  endIndex: number;
  suggestion: string;
  message: string;
}

export interface CheckResult {
  originalText: string;
  errors: GrammarError[];
  stats: {
    wordCount: number;
    charCount: number;
    spellingErrors: number;
    grammarErrors: number;
    styleErrors: number;
  };
}

export interface TextStats {
  wordCount: number;
  charCount: number;
  sentenceCount: number;
}
