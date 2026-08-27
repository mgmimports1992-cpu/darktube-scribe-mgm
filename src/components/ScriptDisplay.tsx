import { useMemo } from "react";

interface Section {
  title: string;
  body: string;
}

function parseSections(text: string): Section[] {
  const regex = /\[([^\]]+)\]/g;
  const matches = [...text.matchAll(regex)];
  if (matches.length === 0) return [{ title: "ROTEIRO", body: text }];

  const sections: Section[] = [];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const start = (m.index ?? 0) + m[0].length;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? text.length) : text.length;
    sections.push({
      title: m[1].trim(),
      body: text.slice(start, end).trim(),
    });
  }
  return sections;
}

export function ScriptDisplay({ script }: { script: string }) {
  const sections = useMemo(() => parseSections(script), [script]);

  return (
    <div className="space-y-6">
      {sections.map((s, i) => (
        <article
          key={i}
          className="rounded-lg border border-border bg-card/60 p-5 transition-colors hover:border-primary/40"
        >
          <header className="mb-3 flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />
            <h3 className="font-display text-sm uppercase tracking-[0.2em] text-primary">
              {s.title}
            </h3>
          </header>
          <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">{s.body}</p>
        </article>
      ))}
    </div>
  );
}
