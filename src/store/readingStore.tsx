import { createContext, useContext, type ReactNode } from "react";

import { useReadingSession } from "../hooks/useReadingSession";

type ReadingContextValue = ReturnType<typeof useReadingSession>;

const ReadingContext = createContext<ReadingContextValue | undefined>(undefined);

export const ReadingProvider = ({ children }: { children: ReactNode }) => {
  const value = useReadingSession();
  return <ReadingContext.Provider value={value}>{children}</ReadingContext.Provider>;
};

export const useReadingContext = () => {
  const context = useContext(ReadingContext);
  if (!context) {
    throw new Error("useReadingContext must be used within ReadingProvider");
  }
  return context;
};
