import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div 
        className="scroll-progress-bar" 
        style={{ width: `${scrollProgress}%` }} 
        aria-hidden="true"
      />
      <button
        onClick={scrollToTop}
        className={`scroll-to-top-btn ${showScrollTop ? "visible" : ""}`}
        aria-label="Scroll to top of page"
        title="Scroll to top"
      >
        <ArrowUp size={20} />
      </button>
    </>
  );
}
