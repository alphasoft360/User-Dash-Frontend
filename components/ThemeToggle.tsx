"use client"

import * as React from "react"
import { flushSync } from "react-dom"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle({ className = "" }: { className?: string }) {
    const { theme, setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <Button variant="ghost" size="icon" className={`rounded-xl ${className}`} disabled><span className="w-5 h-5" /></Button>
    }

    const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
        const isDark = resolvedTheme === "dark";
        const newTheme = isDark ? "light" : "dark";

        if (!document.startViewTransition) {
            setTheme(newTheme);
            return;
        }

        const x = e.clientX;
        const y = e.clientY;
        const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        document.documentElement.style.setProperty("--x", `${x}px`);
        document.documentElement.style.setProperty("--y", `${y}px`);

        const style = document.createElement("style");
        style.innerHTML = "* { transition: none !important; }";
        document.head.appendChild(style);

        const transition = document.startViewTransition(() => {
            setTheme(newTheme);
        });

        transition.ready.then(() => {
            const clipPath = [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${endRadius}px at ${x}px ${y}px)`,
            ];

            const animation = document.documentElement.animate(
                {
                    clipPath: isDark ? [...clipPath].reverse() : clipPath,
                },
                {
                    duration: 1200,
                    easing: "cubic-bezier(0.76, 0, 0.24, 1)",
                    pseudoElement: isDark
                        ? "::view-transition-old(root)"
                        : "::view-transition-new(root)",
                }
            );

            animation.onfinish = () => {
                document.head.removeChild(style);
            };
        }).catch(() => {
            document.head.removeChild(style);
        });
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className={`theme-toggle-btn relative group hover:bg-gray-200 dark:hover:bg-white/5 hover:scale-110 active:scale-95 rounded-xl transition-all duration-300 ${className}`}
            onClick={handleToggle}
            aria-label="Toggle theme"
        >
            <Sun className="h-6 w-6 text-gray-700 dark:text-gray-300 transition-all duration-500 ease-out scale-100 rotate-0 group-hover:rotate-[15deg] dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-6 w-6 text-gray-700 dark:text-gray-300 transition-all duration-500 ease-out scale-0 rotate-90 dark:scale-100 dark:rotate-0 dark:group-hover:-rotate-[15deg]" />
        </Button>
    )
}
