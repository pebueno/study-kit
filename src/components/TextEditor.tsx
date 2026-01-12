import { useState, useCallback, useEffect } from 'react';
import {
  Trash2,
  Sparkles,
  Copy,
  Download,
  Loader2,
  ArrowRight,
  Languages,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { Statistics } from './Statistics';
import { getTextStats, EXAMPLE_TEXT } from '@/lib/grammarChecker';
import { TextStats } from '@/types/grammar';

const STORAGE_KEY = 'studykit-last-text';

type Language = 'en' | 'pt';
type Mode = 'grammar' | 'summarize' | 'synonym';

export function TextEditor() {
  const [text, setText] = useState('');
  const [resultText, setResultText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [mode, setMode] = useState<Mode>('grammar');
  const [synonymWord, setSynonymWord] = useState('');
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

  const handleProcess = useCallback(async () => {
    if (!text.trim()) {
      toast({
        title: mode === 'grammar' ? 'No text to check' : mode === 'summarize' ? 'No text to summarize' : 'No text to process',
        description: 'Please enter some text before processing.',
        variant: 'destructive',
      });
      return;
    }

    if (mode === 'synonym' && !synonymWord.trim()) {
      toast({
        title: 'No word specified',
        description: 'Please enter a word to replace with synonyms.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      let result = '';

      if (mode === 'grammar') {
        // Mock grammar fixing - simulate corrections
        result = text
          .replace(/\btheir\b/gi, 'there')
          .replace(/\bteh\b/gi, 'the')
          .replace(/\brecieve\b/gi, 'receive')
          .replace(/\bsentense\b/gi, 'sentence')
          .replace(/\bneeds to be fix\b/gi, 'needs to be fixed')
          .replace(/\bmistake\b/gi, 'mistakes')
          .replace(/\bdefinately\b/gi, 'definitely')
          .replace(/\boccured\b/gi, 'occurred')
          .replace(/\bseperately\b/gi, 'separately')
          .replace(/\buntil\b/gi, 'until');
        
        toast({
          title: language === 'en' ? 'Grammar checked!' : 'Gramática verificada!',
          description: language === 'en' ? 'Your text has been corrected.' : 'Seu texto foi corrigido.',
        });
      } else if (mode === 'summarize') {
        // Mock summarization
        const sentences = text.split(/[.!?]+/).filter(s => s.trim());
        if (sentences.length <= 2) {
          result = text;
        } else {
          // Take first and last meaningful sentences as a simple summary
          result = sentences.slice(0, Math.ceil(sentences.length / 3)).join('. ').trim() + '.';
        }
        
        toast({
          title: language === 'en' ? 'Text summarized!' : 'Texto resumido!',
          description: language === 'en' ? 'Your summary is ready.' : 'Seu resumo está pronto.',
        });
      } else if (mode === 'synonym') {
        // Mock synonym replacement
        const synonyms: Record<string, string[]> = {
          good: ['excellent', 'great', 'wonderful', 'superb'],
          bad: ['poor', 'terrible', 'awful', 'dreadful'],
          happy: ['joyful', 'delighted', 'pleased', 'content'],
          sad: ['unhappy', 'sorrowful', 'melancholy', 'downcast'],
          big: ['large', 'huge', 'enormous', 'massive'],
          small: ['tiny', 'little', 'miniature', 'compact'],
          fast: ['quick', 'rapid', 'swift', 'speedy'],
          slow: ['gradual', 'leisurely', 'unhurried', 'sluggish'],
          important: ['crucial', 'essential', 'vital', 'significant'],
          many: ['numerous', 'several', 'various', 'countless'],
        };

        const wordLower = synonymWord.toLowerCase();
        const synonymList = synonyms[wordLower];
        
        if (synonymList) {
          const randomSynonym = synonymList[Math.floor(Math.random() * synonymList.length)];
          const regex = new RegExp(`\\b${synonymWord}\\b`, 'gi');
          result = text.replace(regex, randomSynonym);
          
          toast({
            title: language === 'en' ? 'Synonyms replaced!' : 'Sinônimos substituídos!',
            description: language === 'en' 
              ? `Replaced "${synonymWord}" with "${randomSynonym}".`
              : `Substituído "${synonymWord}" por "${randomSynonym}".`,
          });
        } else {
          result = text;
          toast({
            title: language === 'en' ? 'No synonyms found' : 'Nenhum sinônimo encontrado',
            description: language === 'en' 
              ? `Could not find synonyms for "${synonymWord}".`
              : `Não foi possível encontrar sinônimos para "${synonymWord}".`,
            variant: 'destructive',
          });
        }
      }

      setResultText(result);
    } catch (error) {
      toast({
        title: 'Error processing text',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [text, mode, synonymWord, language]);

  const handleClear = useCallback(() => {
    setText('');
    setResultText('');
    setSynonymWord('');
    localStorage.removeItem(STORAGE_KEY);
    toast({
      title: language === 'en' ? 'Text cleared' : 'Texto limpo',
      description: language === 'en' ? 'Your text has been cleared.' : 'Seu texto foi limpo.',
    });
  }, [language]);

  const handleLoadExample = useCallback(() => {
    setText(EXAMPLE_TEXT);
    setResultText('');
    toast({
      title: language === 'en' ? 'Example loaded' : 'Exemplo carregado',
      description: language === 'en' ? 'Click the button below to process.' : 'Clique no botão abaixo para processar.',
    });
  }, [language]);

  const handleCopyResult = useCallback(async () => {
    if (!resultText) return;
    try {
      await navigator.clipboard.writeText(resultText);
      toast({
        title: language === 'en' ? 'Copied!' : 'Copiado!',
        description: language === 'en' ? 'Result copied to clipboard.' : 'Resultado copiado.',
      });
    } catch (error) {
      toast({
        title: language === 'en' ? 'Copy failed' : 'Falha ao copiar',
        description: language === 'en' ? 'Could not copy text to clipboard.' : 'Não foi possível copiar o texto.',
        variant: 'destructive',
      });
    }
  }, [resultText, language]);

  const handleExport = useCallback(() => {
    if (!resultText) return;
    const blob = new Blob([resultText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'studykit-result.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: language === 'en' ? 'Exported!' : 'Exportado!',
      description: language === 'en' ? 'Your text has been downloaded.' : 'Seu texto foi baixado.',
    });
  }, [resultText, language]);

  const getButtonLabel = () => {
    if (isProcessing) {
      return language === 'en' ? 'Processing...' : 'Processando...';
    }
    switch (mode) {
      case 'grammar':
        return language === 'en' ? 'Fix Grammar' : 'Corrigir Gramática';
      case 'summarize':
        return language === 'en' ? 'Summarize' : 'Resumir';
      case 'synonym':
        return language === 'en' ? 'Replace Synonyms' : 'Substituir Sinônimos';
    }
  };

  return (
    <div className="container py-4 md:py-8 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-6 md:mb-8">
        <h1 className="font-display text-2xl md:text-4xl font-bold mb-2 md:mb-3">
          <span className="gradient-text">
            {language === 'en' ? 'Grammar & Writing Tools' : 'Ferramentas de Escrita'}
          </span>
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto px-4">
          {language === 'en' 
            ? 'Improve your writing with grammar correction, summarization, and synonym replacement.'
            : 'Melhore sua escrita com correção gramatical, resumo e substituição de sinônimos.'}
        </p>
      </div>

      {/* Language Selector */}
      <div className="flex justify-center mb-4 md:mb-6">
        <div className="flex items-center gap-2 p-1 bg-muted rounded-full">
          <button
            onClick={() => setLanguage('en')}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-full transition-all text-sm md:text-base ${
              language === 'en' 
                ? 'bg-background shadow-sm' 
                : 'hover:bg-background/50'
            }`}
            aria-label="English"
          >
            <span className="text-lg md:text-xl">🇺🇸</span>
            <span className="hidden sm:inline">English</span>
          </button>
          <button
            onClick={() => setLanguage('pt')}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-full transition-all text-sm md:text-base ${
              language === 'pt' 
                ? 'bg-background shadow-sm' 
                : 'hover:bg-background/50'
            }`}
            aria-label="Português"
          >
            <span className="text-lg md:text-xl">🇧🇷</span>
            <span className="hidden sm:inline">Português</span>
          </button>
        </div>
      </div>

      {/* Mode Tabs */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="mb-4 md:mb-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="grammar" className="gap-1 md:gap-2 text-xs md:text-sm">
            <Languages className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">{language === 'en' ? 'Fix Grammar' : 'Gramática'}</span>
            <span className="sm:hidden">Fix</span>
          </TabsTrigger>
          <TabsTrigger value="summarize" className="gap-1 md:gap-2 text-xs md:text-sm">
            <FileText className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">{language === 'en' ? 'Summarize' : 'Resumir'}</span>
            <span className="sm:hidden">Sum</span>
          </TabsTrigger>
          <TabsTrigger value="synonym" className="gap-1 md:gap-2 text-xs md:text-sm">
            <RefreshCw className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">{language === 'en' ? 'Synonyms' : 'Sinônimos'}</span>
            <span className="sm:hidden">Syn</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Synonym Input (only for synonym mode) */}
      {mode === 'synonym' && (
        <div className="max-w-md mx-auto mb-4 md:mb-6 px-4 md:px-0">
          <label className="block text-sm font-medium mb-2 text-center">
            {language === 'en' ? 'Word to replace:' : 'Palavra para substituir:'}
          </label>
          <Input
            value={synonymWord}
            onChange={(e) => setSynonymWord(e.target.value)}
            placeholder={language === 'en' ? 'Enter a word (e.g., good, happy, big)' : 'Digite uma palavra (ex: bom, feliz, grande)'}
            className="text-center"
          />
        </div>
      )}

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 px-2 md:px-0">
        {/* Input Section */}
        <Card className="shadow-soft">
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h2 className="font-display font-semibold text-sm md:text-base">
                {language === 'en' ? 'Input Text' : 'Texto de Entrada'}
              </h2>
              <div className="flex items-center gap-1 md:gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLoadExample}
                      className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3"
                    >
                      <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="hidden sm:inline">{language === 'en' ? 'Example' : 'Exemplo'}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{language === 'en' ? 'Load sample text' : 'Carregar texto de exemplo'}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClear}
                      disabled={!text}
                      className="px-2 md:px-3"
                    >
                      <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{language === 'en' ? 'Clear text' : 'Limpar texto'}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                language === 'en'
                  ? 'Paste or type your text here...'
                  : 'Cole ou digite seu texto aqui...'
              }
              className="min-h-[200px] md:min-h-[280px] resize-y text-sm md:text-base leading-relaxed"
              aria-label={language === 'en' ? 'Text input' : 'Entrada de texto'}
            />

            <div className="mt-3 md:mt-4">
              <Statistics stats={stats} />
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="shadow-soft">
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h2 className="font-display font-semibold text-sm md:text-base">
                {language === 'en' ? 'Result' : 'Resultado'}
              </h2>
              {resultText && (
                <div className="flex items-center gap-1 md:gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyResult}
                        className="px-2 md:px-3"
                      >
                        <Copy className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{language === 'en' ? 'Copy result' : 'Copiar resultado'}</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleExport}
                        className="px-2 md:px-3"
                      >
                        <Download className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{language === 'en' ? 'Download as .txt' : 'Baixar como .txt'}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>

            <div
              className="min-h-[200px] md:min-h-[280px] p-3 md:p-4 bg-muted/30 rounded-lg border border-input text-sm md:text-base leading-relaxed whitespace-pre-wrap overflow-y-auto"
              role="textbox"
              aria-readonly="true"
              aria-label={language === 'en' ? 'Result text' : 'Texto resultado'}
            >
              {resultText || (
                <span className="text-muted-foreground">
                  {language === 'en'
                    ? 'Your processed text will appear here...'
                    : 'Seu texto processado aparecerá aqui...'}
                </span>
              )}
            </div>

            {resultText && (
              <div className="mt-3 md:mt-4">
                <Statistics stats={getTextStats(resultText)} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Button */}
      <div className="flex justify-center mt-4 md:mt-6 px-4 md:px-0">
        <Button
          onClick={handleProcess}
          disabled={isProcessing || !text.trim()}
          className="gradient-bg gap-2 md:gap-3 px-6 md:px-8 py-4 md:py-6 text-base md:text-lg w-full sm:w-auto"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
              {getButtonLabel()}
            </>
          ) : (
            <>
              {getButtonLabel()}
              <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
