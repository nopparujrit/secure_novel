import { useEffect, useRef } from "react";
import { obfuscateForDisplay, generateObfuscationCSS } from "@/utils/encryption";
import { initCopyProtection, startDOMObserver } from "@/utils/copyProtection";

interface ProtectedContentProps {
  content: string;
  fontSize?: number;
}

const ProtectedContent = ({ content, fontSize = 18 }: ProtectedContentProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initCopyProtection();
    startDOMObserver();
    
    const style = document.createElement("style");
    style.innerHTML = generateObfuscationCSS();
    document.head.appendChild(style);
    
    if (contentRef.current) {
      contentRef.current.innerHTML = obfuscateForDisplay(content);
      contentRef.current.style.fontSize = `${fontSize}px`;
    }
    
    return () => {
      document.head.removeChild(style);
    };
  }, [content, fontSize]);

  return (
    <div 
      ref={contentRef}
      className="novel-content relative p-6 md:p-10 bg-card/50 rounded-lg shadow-sm max-w-3xl mx-auto leading-relaxed whitespace-pre-line"
      style={{ fontSize: `${fontSize}px` }}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Content will be rendered via innerHTML for obfuscation */}
    </div>
  );
};

export default ProtectedContent;
