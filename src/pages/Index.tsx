
import { useState, useEffect } from "react";
import { getAllChapters, getNovelMetadata, NovelMetadata } from "@/services/novelService";
import ChapterList from "@/components/ChapterList";
import { toast } from "sonner";
import Header from "@/components/Header";
import { motion } from "framer-motion";

const Index = () => {
  const [chapters, setChapters] = useState<number[]>([]);
  const [metadata, setMetadata] = useState<NovelMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch metadata
        const novelMetadata = await getNovelMetadata();
        setMetadata(novelMetadata);
        
        // Fetch chapters
        const allChapters = await getAllChapters();
        setChapters(allChapters.map(c => c.chapter));
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load novel data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header metadata={metadata} />
      
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <motion.div 
          className="max-w-3xl mx-auto mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-4xl font-semibold tracking-tight mb-3">
            {metadata?.title || "Secure Novel Reader"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A novel reading platform with enhanced security, preventing unauthorized copying of content while providing a beautiful reading experience.
          </p>
        </motion.div>
        
        <motion.div 
          className="mb-8 text-center sm:text-left"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-2xl font-medium mb-4">Chapters</h2>
        </motion.div>
        
        {loading ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, index) => (
              <div 
                key={index} 
                className="bg-background rounded-lg border border-border/60 p-4 animate-pulse h-24"
              ></div>
            ))}
          </div>
        ) : (
          <ChapterList chapters={chapters} />
        )}
      </main>
    </div>
  );
};

export default Index;
