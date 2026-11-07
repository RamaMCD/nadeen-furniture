"use client";

import * as React from "react";
import { Barcode, Hash, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarcodeScanner } from "./barcode-scanner";
import { cn } from "@/lib/utils";

export type SearchMode = "barcode" | "code";

interface LookupSearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  className?: string;
}

const TABS: { mode: SearchMode; label: string; icon: React.ElementType; placeholder: string }[] = [
  {
    mode: "barcode",
    label: "Barcode",
    icon: Barcode,
    placeholder: "Type or paste a barcode…",
  },
  {
    mode: "code",
    label: "Product Code",
    icon: Hash,
    placeholder: "e.g. BRG000001",
  },
];

/**
 * Large dual-tab search bar for the Product Lookup page.
 *
 * - Tab 1: Barcode input — triggers on Enter or after 600ms debounce
 * - Tab 2: Product Code input — same UX
 * - Camera button — opens BarcodeScanner; auto-triggers search on scan
 *
 * Physical Bluetooth scanners work automatically because they emulate keyboard
 * input and press Enter after the barcode, which triggers the search.
 */
export function LookupSearchBar({
  onSearch,
  isLoading,
  className,
}: LookupSearchBarProps) {
  const [activeTab, setActiveTab] = React.useState<SearchMode>("barcode");
  const [values, setValues] = React.useState<Record<SearchMode, string>>({
    barcode: "",
    code: "",
  });
  const inputRef = React.useRef<HTMLInputElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when switching tabs
  React.useEffect(() => {
    inputRef.current?.focus();
  }, [activeTab]);

  const currentValue = values[activeTab];

  const triggerSearch = React.useCallback(
    (val: string) => {
      const trimmed = val.trim();
      if (!trimmed) return;
      onSearch(trimmed);
    },
    [onSearch]
  );

  const handleChange = (val: string) => {
    setValues((prev) => ({ ...prev, [activeTab]: val }));

    // Debounced auto-search (500ms)
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (val.trim()) triggerSearch(val);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      triggerSearch(currentValue);
    }
  };

  const handleClear = () => {
    setValues((prev) => ({ ...prev, [activeTab]: "" }));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    inputRef.current?.focus();
  };

  const handleManualSearch = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    triggerSearch(currentValue);
  };

  // Camera scan handler: switch to barcode tab, fill value, trigger search
  const handleCameraScan = (barcode: string) => {
    setActiveTab("barcode");
    setValues((prev) => ({ ...prev, barcode }));
    onSearch(barcode.trim());
  };

  // Cleanup debounce on unmount
  React.useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Tab switcher */}
      <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/50 p-1">
        {TABS.map(({ mode, label, icon: Icon }) => (
          <button
            key={mode}
            type="button"
            onClick={() => setActiveTab(mode)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150",
              activeTab === mode
                ? "bg-card text-primary shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {/* Search input + camera button row */}
      <div className="flex gap-3">
        {/* Large search input */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            id={`lookup-input-${activeTab}`}
            type="text"
            value={currentValue}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={TABS.find((t) => t.mode === activeTab)?.placeholder}
            disabled={isLoading}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className={cn(
              "flex h-14 w-full rounded-xl border-2 border-input bg-card text-base shadow-soft",
              "pl-11 pr-12 font-mono tracking-wide",
              "placeholder:text-muted-foreground placeholder:font-sans placeholder:tracking-normal",
              "transition-all duration-150",
              "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          />
          {currentValue && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear input"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search button */}
        <Button
          type="button"
          size="lg"
          onClick={handleManualSearch}
          disabled={isLoading || !currentValue.trim()}
          className="h-14 px-6 rounded-xl shrink-0"
        >
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>

      {/* Camera scanner button */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="flex justify-center">
        <BarcodeScanner onScan={handleCameraScan} disabled={isLoading} />
      </div>
    </div>
  );
}
