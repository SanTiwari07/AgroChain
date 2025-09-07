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
    <header className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">K</span>
        </div>
        <h1 className="text-xl font-bold text-foreground">{t('KrishiChain')}</h1>
      </div>
      
      <div className="flex items-center gap-2">
        {showLanguageSelector && (
          <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
            <SelectTrigger className="w-20 bg-card/80 border-border/50">
              <Globe className="w-4 h-4" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">EN</SelectItem>
              <SelectItem value="hi">हि</SelectItem>
              <SelectItem value="or">ଓ</SelectItem>
            </SelectContent>
          </Select>
        )}
        
        {showThemeToggle && (
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="bg-card/80 border-border/50"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>
        )}
      </div>
    </header>
  );
}