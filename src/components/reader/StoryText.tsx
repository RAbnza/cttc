import { motion } from "framer-motion";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";

import type { WordLocation, WordRect } from "../../types/reading";
import { cn } from "../../utils/cn";

type StoryTextProps = {
  lines: string[];
  currentWord?: WordLocation;
  onLayout?: (rects: WordRect[]) => void;
};

export const StoryText = ({ lines, currentWord, onLayout }: StoryTextProps) => {
  const wordRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const wordItems = useMemo(() => {
    let wordIndex = 0;
    return lines.map((line, lineIndex) =>
      line.split(" ").map((term) => ({ term, lineIndex, wordIndex: wordIndex++ }))
    );
  }, [lines]);

  const emitLayout = () => {
    if (!onLayout) return;
    const rects: WordRect[] = [];
    wordItems.flat().forEach((item) => {
      const node = wordRefs.current[item.wordIndex];
      if (!node) return;
      rects.push({ ...item, rect: node.getBoundingClientRect() });
    });
    onLayout(rects);
  };

  useLayoutEffect(() => {
    emitLayout();
  }, [onLayout, wordItems]);

  useEffect(() => {
    if (!onLayout) return;
    const handle = () => emitLayout();
    window.addEventListener("resize", handle);
    window.addEventListener("scroll", handle, true);
    return () => {
      window.removeEventListener("resize", handle);
      window.removeEventListener("scroll", handle, true);
    };
  }, [onLayout, wordItems]);

  return (
    <div className="space-y-5 text-xl leading-[2.35rem] text-ink-700 md:text-2xl md:leading-[2.65rem]">
      {wordItems.map((lineWords, lineIndex) => {
        return (
          <p key={lineIndex} className="flex flex-wrap gap-x-2 gap-y-2 md:gap-x-2.5 md:gap-y-2.5">
            {lineWords.map((word) => {
              const isActive =
                currentWord?.lineIndex === lineIndex &&
                currentWord?.wordIndex === word.wordIndex;

              return (
                <motion.span
                  key={`${lineIndex}-${word.wordIndex}`}
                  className={cn(
                    "rounded-full px-3 py-1.5 transition md:px-3.5 md:py-2",
                    isActive
                      ? "bg-ink-900 text-white shadow-soft"
                      : "hover:bg-white/80"
                  )}
                  ref={(node) => {
                    wordRefs.current[word.wordIndex] = node;
                  }}
                  animate={{ scale: isActive ? 1.08 : 1 }}
                >
                  {word.term}
                </motion.span>
              );
            })}
          </p>
        );
      })}
    </div>
  );
};
