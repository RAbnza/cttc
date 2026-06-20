import { ChevronDown, Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "../../utils/cn";
import { Button } from "./Button";

type DownloadMenuOption = {
  label: string;
  onSelect: () => void;
};

type DownloadMenuProps = {
  options: DownloadMenuOption[];
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
};

export const DownloadMenu = ({
  options,
  disabled = false,
  className,
  buttonClassName
}: DownloadMenuProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "justify-between rounded-2xl border-ink-200 bg-white px-3.5 text-ink-700 shadow-sm hover:bg-ink-50 min-w-[8.75rem]",
          buttonClassName
        )}
      >
        <Download size={14} />
        Download
        <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
      </Button>

      {open && !disabled && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-2 min-w-[8.75rem] rounded-2xl border border-ink-200 bg-white p-1.5 shadow-lg"
        >
          {options.map((option) => (
            <button
              key={option.label}
              type="button"
              role="menuitem"
              className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm font-medium text-ink-700 transition hover:bg-ink-50"
              onClick={() => {
                option.onSelect();
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
