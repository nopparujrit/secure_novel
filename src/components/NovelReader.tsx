import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChapterSelector from "./ChapterSelector";
import ProtectedContent from "./ProtectedContent";
import { Chapter, getAdjacentChapters } from "@/services/novelService";
import { motion } from "framer-motion";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface NovelReaderProps {
  chapter: Chapter;
  allChapters: number[];
}

const NovelReader = ({ chapter, allChapters }: NovelReaderProps) => {
  const navigate = useNavigate();
  const [adjacentChapters, setAdjacentChapters] = useState<{ prev: number | null; next: number | null }>({
    prev: null,
    next: null,
  });
  const [fontSize, setFontSize] = useState<number>(() => {
    const savedFontSize = localStorage.getItem('novel-font-size');
    return savedFontSize ? parseInt(savedFontSize) : 18; 
  });
  useEffect(() => {
    const fetchAdjacentChapters = async () => {
      const adjacent = await getAdjacentChapters(chapter.chapter);
      setAdjacentChapters(adjacent);
    };

    fetchAdjacentChapters();
  }, [chapter.chapter]);

  useEffect(() => {
    localStorage.setItem('novel-font-size', fontSize.toString());
  }, [fontSize]);

  const handleNextChapter = () => {
    if (adjacentChapters.next) {
      navigate(`/content/${adjacentChapters.next}`);
    }
  };

  const handlePrevChapter = () => {
    if (adjacentChapters.prev) {
      navigate(`/content/${adjacentChapters.prev}`);
    }
  };

  const increaseFontSize = () => {
    if (fontSize < 32) { 
      setFontSize(prev => prev + 2);
    }
  };

  const decreaseFontSize = () => {
    if (fontSize > 12) { 
      setFontSize(prev => prev - 2);
    }
  };

  return (
    <motion.div 
      className="w-full max-w-4xl mx-auto py-8 space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-0">
        <ChapterSelector chapters={allChapters} currentChapter={chapter.chapter} />
        
        <div className="flex items-center gap-2 self-center md:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevChapter}
            disabled={!adjacentChapters.prev}
            className="min-w-[100px]"
          >
            <ArrowLeft size={16} className="mr-2" />
            Previous
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextChapter}
            disabled={!adjacentChapters.next}
            className="min-w-[100px]"
          >
            Next
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>

      <div className="flex justify-center items-center gap-2">
        <ToggleGroup type="single" variant="outline" className="border rounded-md">
          <ToggleGroupItem value="decrease" onClick={decreaseFontSize} className="text-base">
            A-
          </ToggleGroupItem>
          <ToggleGroupItem value="increase" onClick={increaseFontSize} className="text-base">
            A+
          </ToggleGroupItem>
        </ToggleGroup>
        <span className="text-xs text-muted-foreground ml-2">Font Size: {fontSize}px</span>
      </div>

      <ProtectedContent content={chapter.content} fontSize={fontSize} />

      <div className="flex justify-center gap-4 pt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevChapter}
          disabled={!adjacentChapters.prev}
          className="min-w-[120px]"
        >
          <ArrowLeft size={16} className="mr-2" />
          Previous
        </Button>
        
        
        <Button
          variant="default"
          size="sm"
          onClick={handleNextChapter}
          disabled={!adjacentChapters.next}
          className="min-w-[120px]"
        >
          Next
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </motion.div>
  );
};

export default NovelReader;
