import { useState, useCallback, useEffect } from 'react';
import {
  Search,
  Trash2,
  Sparkles,
  Copy,
  Download,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { Statistics } from './Statistics';
import { ResultsPanel } from './ResultsPanel';
import { HighlightedText } from './HighlightedText';
import { checkGrammar, getTextStats, EXAMPLE_TEXT } from '@/lib/grammarChecker';
import { CheckResult, GrammarError, TextStats } from '@/types/grammar';

const STORAGE_KEY = 'studykit-last-text';

export function TextEditor() {
  const [text, setText] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [highlightedError, setHighlightedError] = useState<GrammarError | null>(null);
  const [stats, setStats] = useState<TextStats>({ wordCount: 0, charCount: 0, sentenceCount: 0 });

  // Load saved text on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setText(saved);
    }
  }, []);

  // Update stats on text change
  useEffect(() => {
    setStats(getTextStats(text));
  }, [text]);

  // Save text to localStorage
  useEffect(() => {
    if (text) {
      localStorage.setItem(STORAGE_KEY, text);
    }
  }, [text]);

  const handleCheck = useCallback(async () => {
    if (!text.trim()) {
      toast({
        title: 'No text to check',
        description: 'Please enter some text before checking.',
        variant: 'destructive',
      });
      return;
    }

    setIsChecking(true);
    setHighlightedError(null);

    try {
      const checkResult = await checkGrammar(text);
      setResult(checkResult);
      toast({
        title: 'Check complete!',
        description: `Found ${checkResult.errors.length} issue${checkResult.errors.length !== 1 ? 's' : ''}.`,
      });
    } catch (error) {
      toast({
        title: 'Error checking text',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  }, [text]);

  const handleClear = useCallback(() => {
    setText('');
    setResult(null);
    setHighlightedError(null);
    localStorage.removeItem(STORAGE_KEY);
    toast({
      title: 'Text cleared',
      description: 'Your text has been cleared.',
    });
  }, []);

  const handleLoadExample = useCallback(() => {
    setText(EXAMPLE_TEXT);
    setResult(null);
    setHighlightedError(null);
    toast({
      title: 'Example loaded',
      description: 'Click "Check Grammar" to see the errors.',
    });
  }, []);

  const handleCopyText = useCallback(async () => {
    const textToCopy = result ? text : text;
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: 'Copied!',
        description: 'Text copied to clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Could not copy text to clipboard.',
        variant: 'destructive',
      });
    }
  }, [text, result]);

  const handleExport = useCallback(() => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'studykit-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Exported!',
      description: 'Your text has been downloaded.',
    });
  }, [text]);

  const handleFixError = useCallback((error: GrammarError) => {
    const newText =
      text.slice(0, error.startIndex) +
      error.suggestion +
      text.slice(error.endIndex);
    setText(newText);

    // Update result to remove the fixed error
    if (result) {
      const updatedErrors = result.errors.filter((e) => e.id !== error.id);
      setResult({
        ...result,
        errors: updatedErrors,
        stats: {
          ...result.stats,
          spellingErrors: updatedErrors.filter((e) => e.type === 'spelling').length,
          grammarErrors: updatedErrors.filter((e) => e.type === 'grammar').length,
          styleErrors: updatedErrors.filter((e) => e.type === 'style').length,
        },
      });
    }

    setHighlightedError(null);
    toast({
      title: 'Fixed!',
      description: `Replaced "${error.word}" with "${error.suggestion}".`,
    });
  }, [text, result]);

  const handleHighlightError = useCallback((error: GrammarError) => {
    setHighlightedError(error);
  }, []);

  return (
    <div className="container py-8 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
          <span className="gradient-text">Grammar & Spelling Checker</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Improve your writing with instant grammar, spelling, and style suggestions.
          Perfect for essays, reports, and everyday writing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Section */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="shadow-soft">
            <CardContent className="p-6">
              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleCheck}
                        disabled={isChecking || !text.trim()}
                        className="gradient-bg gap-2"
                      >
                        {isChecking ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Checking...
                          </>
                        ) : (
                          <>
                            <Search className="h-4 w-4" />
                            Check Grammar
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Analyze your text for errors</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="secondary"
                        onClick={handleClear}
                        disabled={!text}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Clear</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clear all text</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={handleLoadExample}
                        className="gap-2"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span className="hidden sm:inline">Try Example</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Load sample text with errors</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopyText}
                        disabled={!text}
                        aria-label="Copy text"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy to clipboard</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleExport}
                        disabled={!text}
                        aria-label="Export text"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download as .txt file</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Text Display with Highlights (when results exist) */}
              {result && result.errors.length > 0 ? (
                <div
                  className="min-h-[280px] max-h-[400px] overflow-y-auto p-4 bg-muted/30 rounded-lg border border-input mb-4 text-base leading-relaxed whitespace-pre-wrap"
                  role="textbox"
                  aria-label="Text with highlighted errors"
                >
                  <HighlightedText
                    text={text}
                    errors={result.errors}
                    highlightedError={highlightedError}
                    onErrorClick={handleHighlightError}
                  />
                </div>
              ) : (
                <Textarea
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setResult(null);
                  }}
                  placeholder="Paste or type your text here to check for grammar and spelling errors..."
                  className="min-h-[280px] resize-y text-base leading-relaxed"
                  aria-label="Text input for grammar checking"
                />
              )}

              {/* Statistics */}
              <div className="flex items-center justify-between">
                <Statistics stats={stats} />
                {result && result.errors.length === 0 && (
                  <span className="flex items-center gap-1 text-sm text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    No issues found!
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Empty State */}
          {!text && !result && (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <div className="gradient-bg w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">
                  Ready to improve your writing?
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Paste your text above or try our example to see how it works.
                </p>
                <Button variant="outline" onClick={handleLoadExample} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Load Example Text
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-1">
          <Card className="shadow-soft h-fit lg:sticky lg:top-24">
            {result ? (
              <ResultsPanel
                result={result}
                highlightedError={highlightedError}
                onFixError={handleFixError}
                onHighlightError={handleHighlightError}
              />
            ) : (
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-display font-semibold mb-2">No Results Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter some text and click "Check Grammar" to see your analysis results here.
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
