import { useCallback, useEffect, useState } from "react";

import { loadFromStorage, saveToStorage } from "../utils/storage";

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(() => loadFromStorage(key, initialValue));

  useEffect(() => {
    saveToStorage(key, value);
  }, [key, value]);

  const updateValue = useCallback((next: T) => {
    setValue(next);
  }, []);

  return [value, updateValue] as const;
};
