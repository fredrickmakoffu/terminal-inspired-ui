"use client";

import React, { useEffect, useRef, useState } from "react";

type AnimatedNumberProps = {
  value: number;
  duration?: number; // ms
  decimals?: number;
  className?: string;
  format?: (v: number) => string;
};

const easeOutQuad = (t: number) => t * (2 - t);

export default function AnimatedNumber({
  value,
  duration = 800,
  decimals = 0,
  className,
  format,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState<number>(value);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef<number>(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // animate from fromRef.current to value
    const start = performance.now();
    startRef.current = start;
    const from = fromRef.current;
    const delta = value - from;

    const step = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current;
      const t = Math.min(1, elapsed / duration);
      const eased = easeOutQuad(t);
      const current = from + delta * eased;
      setDisplay(Number(current.toFixed(decimals)));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = value;
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration, decimals]);

  const defaultFormat = (v: number) => {
    if (decimals === 0) {
      return new Intl.NumberFormat().format(Math.round(v));
    }
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(v);
  };

  return (
    <span className={className}>
      {format ? format(display) : defaultFormat(display)}
    </span>
  );
}
