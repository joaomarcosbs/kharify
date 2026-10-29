"use client";

import { useEffect, useState } from "react";
import { useLoadingStore } from "@/stores/loading-store";
import { Loader2, Sparkles } from "lucide-react";

export function GlobalLoadingOverlay() {
  const [mounted, setMounted] = useState(false);
  const { isLoading, loadingText } = useLoadingStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoading) return null;

  return (
    <>
      {/* Top viewport slim progress line */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 animate-pulse" />

      {/* Glassmorphic Backdrop overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/60 backdrop-blur-sm transition-all duration-300 animate-in fade-in-0">
        <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-800/50 shadow-2xl backdrop-blur-md max-w-xs w-full text-center">
          <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-emerald-500 animate-pulse" />
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-semibold tracking-wide text-foreground">
              Kharify
            </h4>
            <p className="text-xs text-muted-foreground animate-pulse">
              {loadingText || "Processando solicitação..."}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
