import { GrammarError, CheckResult, ErrorType } from '@/types/grammar';

export async function checkGrammar(text: string): Promise<CheckResult> {
  try {
    const response = await fetch('/api/check-grammar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Map backend response to frontend format
    // Expected backend format: { errors: Array<{type, position: {start, end}, suggestion, message}> }
    const errors: GrammarError[] = (data.errors || []).map((err: any) => ({
      id: Math.random().toString(36).substring(2, 9),
      type: (err.type === 'spelling' || err.type === 'grammar' || err.type === 'style') ? err.type : 'grammar',
      word: text.slice(err.position.start, err.position.end),
      startIndex: err.position.start,
      endIndex: err.position.end,
      suggestion: err.suggestion,
      message: err.message || err.explanation || 'Issue detected',
    }));

    // Sort errors by position
    errors.sort((a, b) => a.startIndex - b.startIndex);

    const baseStats = getTextStats(text);
    const stats = {
      ...baseStats,
      spellingErrors: errors.filter((e) => e.type === 'spelling').length,
      grammarErrors: errors.filter((e) => e.type === 'grammar').length,
      styleErrors: errors.filter((e) => e.type === 'style').length,
    };

    return {
      originalText: text,
      errors,
      stats,
    };
  } catch (error) {
    console.error('Grammar check failed:', error);
    // Fallback or re-throw depending on desired behavior. 
    // For now, returning empty result with error logged, or we could handle it in UI.
    // Let's propagate a basic error structure so UI doesn't crash but shows 0 errors
    const baseStats = getTextStats(text);
    return {
      originalText: text,
      errors: [],
      stats: {
        ...baseStats,
        spellingErrors: 0,
        grammarErrors: 0,
        styleErrors: 0,
      },
    };
  }
}

export function getTextStats(text: string) {
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sentenceCount = text.split(/[.!?]+/).filter((s) => s.trim()).length;
  
  return { charCount, wordCount, sentenceCount };
}

export const EXAMPLE_TEXT = `Their are many mistake in this sentense that needs to be fix. I recieved a very good grade on my essay untill the teacher found the errors. Its a really important document that I definately need to finish.`;
