import { BookOpen, Sparkles, Layers, Info, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  comingSoon?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Grammar Checker', icon: <BookOpen className="h-4 w-4" />, active: true },
  { label: 'Flashcards', icon: <Layers className="h-4 w-4" />, comingSoon: true },
  { label: 'Study Tools', icon: <Sparkles className="h-4 w-4" />, comingSoon: true },
  { label: 'About', icon: <Info className="h-4 w-4" /> },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="gradient-bg rounded-lg p-2">
            <BookOpen className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold gradient-text">StudyKit</span>
            <span className="hidden sm:block text-xs text-muted-foreground -mt-1">
              Your Complete Study Toolkit
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {navItems.map((item) => (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <Button
                  variant={item.active ? 'default' : 'ghost'}
                  size="sm"
                  className={`gap-2 ${item.comingSoon ? 'opacity-50 cursor-not-allowed' : ''} ${
                    item.active ? 'gradient-bg' : ''
                  }`}
                  disabled={item.comingSoon}
                  aria-current={item.active ? 'page' : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.comingSoon && (
                    <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                      Soon
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              {item.comingSoon && (
                <TooltipContent>
                  <p>Coming soon!</p>
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav
          id="mobile-menu"
          className="md:hidden border-t border-border/40 animate-slide-up"
          aria-label="Mobile navigation"
        >
          <div className="container py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant={item.active ? 'default' : 'ghost'}
                className={`justify-start gap-2 ${item.comingSoon ? 'opacity-50' : ''} ${
                  item.active ? 'gradient-bg' : ''
                }`}
                disabled={item.comingSoon}
                aria-current={item.active ? 'page' : undefined}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.comingSoon && (
                  <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full ml-auto">
                    Soon
                  </span>
                )}
              </Button>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
