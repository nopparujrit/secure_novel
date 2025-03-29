import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChapter, getAllChapters, getNovelMetadata, NovelMetadata, Chapter } from "@/services/novelService";
import NovelReader from "@/components/NovelReader";
import Header from "@/components/Header";
import { toast } from "sonner";
import { motion } from "framer-motion";

const Content = () => {
  const { chapter: chapterParam } = useParams<{ chapter: string }>();
  const navigate = useNavigate();
  
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [allChapters, setAllChapters] = useState<number[]>([]);
  const [metadata, setMetadata] = useState<NovelMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const chapterNumber = parseInt(chapterParam || "1");
        
        if (isNaN(chapterNumber)) {
          toast.error("Invalid chapter number");
          navigate("/");
          return;
        }
        
        const novelMetadata = await getNovelMetadata();
        setMetadata(novelMetadata);
        
        const chapters = await getAllChapters();
        const chapterNumbers = chapters.map(c => c.chapter);
        setAllChapters(chapterNumbers);
        
        if (!chapterNumbers.includes(chapterNumber)) {
          toast.error("Chapter not found");
          navigate("/");
          return;
        }
        
        const chapterData = await getChapter(chapterNumber);
        setChapter(chapterData);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching chapter:", error);
        toast.error("Failed to load chapter");
        setLoading(false);
      }
    };

    fetchData();
  }, [chapterParam, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        metadata={metadata} 
        currentChapter={chapter?.chapter} 
        showBack={true} 
      />
      
      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <motion.div 
            className="w-full max-w-4xl mx-auto py-8 space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-64 h-10 bg-muted/50 rounded-lg animate-pulse"></div>
            <div className="w-full h-[500px] bg-muted/30 rounded-lg animate-pulse"></div>
          </motion.div>
        ) : chapter ? (
          <NovelReader chapter={chapter} allChapters={allChapters} />
        ) : (
          <div className="text-center py-16">
            <h2 className="text-xl font-medium">Chapter not found</h2>
            <button 
              onClick={() => navigate("/")}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Return to Home
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Content;
