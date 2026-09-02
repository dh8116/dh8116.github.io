"use client";

import { useEffect, useRef, useState } from "react";

export default function SkillPills({ skills }: { skills: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="mt-8 flex flex-wrap gap-3">
      {skills.map((skill, i) => (
        <span
          key={skill}
          style={{ transitionDelay: visible ? `${i * 70}ms` : "0ms" }}
          className={`cursor-default rounded-full border border-white/10 bg-card px-4 py-2 text-sm text-zinc-300 transition-all duration-500 ease-out hover:-translate-y-1 hover:border-brand-blue/60 hover:text-white hover:shadow-lg hover:shadow-brand-blue/20 motion-reduce:transition-none motion-reduce:transform-none ${
            visible
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-3 scale-95 opacity-0"
          }`}
        >
          {skill}
        </span>
      ))}
    </div>
  );
}
