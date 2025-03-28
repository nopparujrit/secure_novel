
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Content from "./pages/Content";
import NotFound from "./pages/NotFound";
import { toast } from "sonner";
import { useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const devToolsDetector = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      
      if (widthThreshold || heightThreshold) {
        document.body.innerHTML = "";
        toast.error("For security reasons, developer tools are not allowed.");
        return true;
      }
      return false;
    };

    const disableRightClick = (e: MouseEvent) => {
      e.preventDefault();
      toast("Right-click is disabled for content protection.", {
        duration: 2000,
      });
    };

    window.addEventListener("resize", devToolsDetector);
    document.addEventListener("contextmenu", disableRightClick);

    return () => {
      window.removeEventListener("resize", devToolsDetector);
      document.removeEventListener("contextmenu", disableRightClick);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" closeButton />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/content/:chapter" element={<Content />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
