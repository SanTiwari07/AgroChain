import React from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Moon, Sun, Globe } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useLanguage, Language } from './LanguageProvider';

interface HeaderProps {
  showLanguageSelector?: boolean;
  showThemeToggle?: boolean;
}

export function Header({ showLanguageSelector = true, showThemeToggle = true }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="absolute top-0 left-0 right-0 z-20 p-3 md:p-4 flex justify-between items-center">
      <div className="hidden md:flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg overflow-hidden">
          <img 
            src="/KrishiSetu_logo.svg" 
            alt="KrishiSetu Logo" 
            className="w-full h-full object-contain"
            onError={(e) => {
              // Fallback to the original K if logo image is not found
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center"><span class="text-white font-bold text-sm">K</span></div>';
              }
            }}
          />
        </div>
        <h1 className="hidden md:block text-xl font-bold text-foreground">{t('KrishiSetu')}</h1>
      </div>
      
      <div className="flex items-center gap-1 sm:gap-2 ml-auto">
        {showLanguageSelector && (
          <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
            <SelectTrigger className="bg-card/80 backdrop-blur-sm border-border/50 rounded-md w-10 h-10 p-0 justify-center sm:w-24 sm:h-10 sm:px-3" hideChevron>
              <Globe className="w-5 h-5" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="en">EN</SelectItem>
              <SelectItem value="hi">हि</SelectItem>
              <SelectItem value="or">ଓ</SelectItem>
            </SelectContent>
          </Select>
        )}
        
        {showThemeToggle && (
          <Button
            aria-label="Toggle theme"
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="bg-card/80 backdrop-blur-sm border-border/50"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>
        )}
      </div>
    </header>
  );
}