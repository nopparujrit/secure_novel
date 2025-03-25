
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface ChapterListProps {
  chapters: number[];
}

const ChapterList = ({ chapters }: ChapterListProps) => {
  const navigate = useNavigate();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  const handleChapterClick = (chapter: number) => {
    navigate(`/content/${chapter}`);
  };

  return (
    <motion.div 
      className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {chapters.map((chapter) => (
        <motion.div
          key={chapter}
          variants={item}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleChapterClick(chapter)}
          className="bg-background rounded-lg border border-border/60 p-4 cursor-pointer hover:border-border transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-block bg-primary/10 text-primary text-xs font-medium rounded-full px-2 py-0.5 mb-2">
                Chapter
              </span>
              <h3 className="text-lg font-medium">{chapter}</h3>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ChapterList;
