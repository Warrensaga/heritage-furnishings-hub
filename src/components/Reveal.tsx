import { useEffect, useRef, useState, type ReactNode, type ElementType } from "react";

type Variant = "fade-up" | "fade" | "scale" | "slide-left" | "slide-right";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  variant?: Variant;
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
  className?: string;
}

const initialFor: Record<Variant, string> = {
  "fade-up": "opacity-0 translate-y-8",
  fade: "opacity-0",
  scale: "opacity-0 scale-95",
  "slide-left": "opacity-0 -translate-x-8",
  "slide-right": "opacity-0 translate-x-8",
};

export function Reveal({
  children,
  as: Tag = "div",
  variant = "fade-up",
  delay = 0,
  duration = 700,
  threshold = 0.15,
  once = true,
  className = "",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            if (once) io.disconnect();
          } else if (!once) {
            setShown(false);
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);

  return (
    <Tag
      ref={ref as never}
      style={{ transitionDuration: `${duration}ms`, transitionDelay: `${delay}ms` }}
      className={`transition-all ease-out will-change-transform ${shown ? "opacity-100 translate-x-0 translate-y-0 scale-100" : initialFor[variant]} ${className}`}
    >
      {children}
    </Tag>
  );
}
