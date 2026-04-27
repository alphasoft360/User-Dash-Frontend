import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: DialogProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose}
      />
      
      {/* Dialog Content */}
      <div 
        className={cn(
          "relative z-50 w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl animate-in zoom-in-95 fade-in duration-200 overflow-hidden",
          className
        )}
      >
        <div className="flex flex-col p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {title && <h2 className="text-xl font-bold tracking-tight uppercase">{title}</h2>}
              {description && <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{description}</p>}
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="py-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
