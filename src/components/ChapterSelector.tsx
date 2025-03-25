
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface ChapterSelectorProps {
  chapters: number[];
  currentChapter: number;
}

const ChapterSelector = ({ chapters, currentChapter }: ChapterSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".chapter-selector")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChapterSelect = (chapter: number) => {
    setIsOpen(false);
    if (chapter !== currentChapter) {
      toast(`Navigating to Chapter ${chapter}`);
      navigate(`/content/${chapter}`);
    }
  };

  return (
    <div className="chapter-selector relative z-30 w-full md:w-64">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-left bg-background border border-border/60 rounded-lg shadow-sm hover:border-border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>Chapter {currentChapter}</span>
        <ChevronDown
          size={18}
          className={`transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute mt-1 w-full max-h-60 overflow-auto bg-background border border-border/60 rounded-lg shadow-lg py-1 z-40"
            role="listbox"
          >
            {chapters.map((chapter) => (
              <li
                key={chapter}
                className={`px-4 py-2 cursor-pointer ${
                  chapter === currentChapter
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-primary/5"
                }`}
                role="option"
                aria-selected={chapter === currentChapter}
                onClick={() => handleChapterSelect(chapter)}
              >
                Chapter {chapter}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChapterSelector;
