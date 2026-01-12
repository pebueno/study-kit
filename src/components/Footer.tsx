import { BookOpen, Github, Linkedin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-card/50">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="gradient-bg rounded-lg p-2">
                <BookOpen className="h-4 w-4 text-primary-foreground" aria-hidden="true" />
              </div>
              <span className="font-display text-lg font-bold gradient-text">StudyKit</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your complete study toolkit for better writing, learning, and academic success.
            </p>
          </div>

          {/* Tools */}
          <div>
            <h3 className="font-display font-semibold mb-4">Tools</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Grammar Checker
                </a>
              </li>
              <li>
                <span className="opacity-50">Flashcards (Coming Soon)</span>
              </li>
              <li>
                <span className="opacity-50">Study Timer (Coming Soon)</span>
              </li>
              <li>
                <span className="opacity-50">Note Organizer (Coming Soon)</span>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-display font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="opacity-50">About Us</span>
              </li>
              <li>
                <span className="opacity-50">Privacy Policy</span>
              </li>
              <li>
                <span className="opacity-50">Terms of Service</span>
              </li>
              <li>
                <a href="mailto:pedroivobu@gmail.com" className="hover:text-foreground transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} StudyKit. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/pebueno"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/pebuenos/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
