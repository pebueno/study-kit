import { GrammarError, CheckResult, ErrorType } from '@/types/grammar';

// Mock error patterns for demonstration
const spellingErrors: Record<string, string> = {
  'teh': 'the',
  'thier': 'their',
  'recieve': 'receive',
  'seperate': 'separate',
  'occured': 'occurred',
  'untill': 'until',
  'definately': 'definitely',
  'accomodate': 'accommodate',
  'occassion': 'occasion',
  'neccessary': 'necessary',
  'sentense': 'sentence',
  'mistale': 'mistake',
};

const grammarPatterns: Array<{
  pattern: RegExp;
  message: string;
  suggestion: string;
}> = [
  {
    pattern: /\btheir are\b/gi,
    message: '"Their" should be "There" when indicating existence',
    suggestion: 'There are',
  },
  {
    pattern: /\bthat needs to be fix\b/gi,
    message: 'Verb form should be "fixed" (past participle)',
    suggestion: 'that needs to be fixed',
  },
  {
    pattern: /\bmany mistake\b/gi,
    message: 'Use plural form "mistakes" after "many"',
    suggestion: 'many mistakes',
  },
  {
    pattern: /\byour welcome\b/gi,
    message: '"Your" should be "You\'re" (you are)',
    suggestion: "You're welcome",
  },
  {
    pattern: /\bits a\b/gi,
    message: 'Consider if "it\'s" (it is) is intended',
    suggestion: "it's a",
  },
];

const stylePatterns: Array<{
  pattern: RegExp;
  message: string;
  suggestion: string;
}> = [
  {
    pattern: /\bvery\s+\w+\b/gi,
    message: 'Consider using a stronger word instead of "very + adjective"',
    suggestion: 'Use a more precise word',
  },
  {
    pattern: /\breally\s+\w+\b/gi,
    message: '"Really" can often be removed for stronger writing',
    suggestion: 'Consider removing "really"',
  },
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function checkGrammar(text: string): Promise<CheckResult> {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      const errors: GrammarError[] = [];
      const words = text.toLowerCase().split(/\s+/);
      
      // Check spelling errors
      let searchIndex = 0;
      words.forEach((word) => {
        const cleanWord = word.replace(/[^a-z]/g, '');
        if (spellingErrors[cleanWord]) {
          const wordIndex = text.toLowerCase().indexOf(cleanWord, searchIndex);
          if (wordIndex !== -1) {
            errors.push({
              id: generateId(),
              type: 'spelling',
              word: cleanWord,
              startIndex: wordIndex,
              endIndex: wordIndex + cleanWord.length,
              suggestion: spellingErrors[cleanWord],
              message: `"${cleanWord}" appears to be misspelled`,
            });
            searchIndex = wordIndex + cleanWord.length;
          }
        }
      });

      // Check grammar patterns
      grammarPatterns.forEach(({ pattern, message, suggestion }) => {
        let match;
        const regex = new RegExp(pattern.source, pattern.flags);
        while ((match = regex.exec(text)) !== null) {
          errors.push({
            id: generateId(),
            type: 'grammar',
            word: match[0],
            startIndex: match.index,
            endIndex: match.index + match[0].length,
            suggestion,
            message,
          });
        }
      });

      // Check style patterns (less priority)
      stylePatterns.forEach(({ pattern, message, suggestion }) => {
        let match;
        const regex = new RegExp(pattern.source, pattern.flags);
        while ((match = regex.exec(text)) !== null) {
          // Avoid duplicate detection
          const alreadyFound = errors.some(
            (e) => e.startIndex === match!.index && e.endIndex === match!.index + match![0].length
          );
          if (!alreadyFound) {
            errors.push({
              id: generateId(),
              type: 'style',
              word: match[0],
              startIndex: match.index,
              endIndex: match.index + match[0].length,
              suggestion,
              message,
            });
          }
        }
      });

      // Sort errors by position
      errors.sort((a, b) => a.startIndex - b.startIndex);

      const stats = {
        wordCount: text.trim() ? text.trim().split(/\s+/).length : 0,
        charCount: text.length,
        spellingErrors: errors.filter((e) => e.type === 'spelling').length,
        grammarErrors: errors.filter((e) => e.type === 'grammar').length,
        styleErrors: errors.filter((e) => e.type === 'style').length,
      };

      resolve({
        originalText: text,
        errors,
        stats,
      });
    }, 1500);
  });
}

export function getTextStats(text: string) {
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sentenceCount = text.split(/[.!?]+/).filter((s) => s.trim()).length;
  
  return { charCount, wordCount, sentenceCount };
}

export const EXAMPLE_TEXT = `Their are many mistake in this sentense that needs to be fix. I recieved a very good grade on my essay untill the teacher found the errors. Its a really important document that I definately need to finish.`;
