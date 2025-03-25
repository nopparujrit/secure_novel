
import { Link } from "react-router-dom";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { NovelMetadata } from "@/services/novelService";
import { useTheme } from "@/context/ThemeContext";
import { Toggle } from "@/components/ui/toggle";

interface HeaderProps {
  metadata: NovelMetadata | null;
  currentChapter?: number;
  showBack?: boolean;
}

const Header = ({ metadata, currentChapter, showBack = false }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="w-full py-6 px-4 md:px-8 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-10">
      <div className="container max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <Link 
              to="/" 
              className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-secondary"
              aria-label="Back to Home"
            >
              <ArrowLeft size={20} />
            </Link>
          )}
          <div>
            <h1 className="text-xl font-medium tracking-tight">
              {metadata?.title || "Secure Novel Reader"}
            </h1>
            {metadata && (
              <p className="text-sm text-muted-foreground">
                by {metadata.author}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Toggle 
              variant="outline" 
              aria-label="Toggle theme"
              className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
              pressed={theme === "dark"}
              onPressedChange={toggleTheme}
            >
              {theme === "light" ? <Sun size={18} /> : <Moon size={18} />}
            </Toggle>
          {currentChapter && (
            <div className="rounded-full bg-primary/5 px-3 py-1 text-sm font-medium">
              Chapter {currentChapter}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
