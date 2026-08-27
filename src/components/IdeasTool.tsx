import { useState } from "react";
import { Sparkles, Loader2, Copy, Lightbulb, Flame, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateIdeas, type VideoIdea } from "@/lib/youtube-tools";

export function IdeasTool() {
  const [description, setDescription] = useState("");
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<VideoIdea[] | null>(null);

  async function handleRun() {
    if (!description.trim()) {
      toast.error("Descreva sobre o que é seu canal.");
      return;
    }
    setLoading(true);
    try {
      const r = await generateIdeas({ description, niche });
      setIdeas(r.ideas);
      toast.success(`${r.ideas.length} ideias geradas!`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  async function copyIdea(idea: VideoIdea) {
    const text = `Título: ${idea.title}\nGancho: ${idea.hook}\nÂngulo: ${idea.angle}\nFormato: ${idea.format}\nPalavras-chave: ${idea.keywords.join(", ")}`;
    await navigator.clipboard.writeText(text);
    toast.success("Ideia copiada");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <section className="space-y-5 rounded-xl border border-border bg-card/40 p-6 lg:sticky lg:top-24 lg:self-start">
        <div>
          <h2 className="font-display text-lg text-foreground">Gerar ideias</h2>
          <p className="text-xs text-muted-foreground">
            Descreva seu canal e receba ideias inéditas com baixa concorrência para ranquear
            rápido.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ideas-desc">Sobre o que é seu canal/conteúdo</Label>
          <Textarea
            id="ideas-desc"
            placeholder="Ex.: Canal dark sobre histórias reais de crimes não resolvidos no Brasil, com narração cinematográfica e foco em casos antigos..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ideas-niche">Nicho (opcional)</Label>
          <Input
            id="ideas-niche"
            placeholder="Ex.: True Crime, Mistério..."
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
          />
        </div>

        <Button
          onClick={handleRun}
          disabled={loading}
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-primary-glow font-semibold text-primary-foreground shadow-[0_0_30px_-8px_var(--primary)]"
        >
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Buscando ideias...</>
          ) : (
            <><Lightbulb className="mr-2 h-4 w-4" /> Gerar Ideias</>
          )}
        </Button>
      </section>

      <section className="rounded-xl border border-border bg-card/30 p-4 sm:p-6">
        {!ideas ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {ideas.map((idea, i) => (
              <article
                key={i}
                className="group flex flex-col rounded-xl border border-border bg-card/60 p-5 transition-all hover:border-primary/50 hover:shadow-[0_0_30px_-15px_var(--primary)]"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="font-display text-xs uppercase tracking-[0.2em] text-primary">
                    Ideia {i + 1}
                  </span>
                  <PotentialBadge level={idea.viral_potential} />
                </div>

                <h3 className="font-display text-base leading-tight text-foreground">
                  {idea.title}
                </h3>

                <div className="mt-3 space-y-3 text-sm">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Gancho
                    </p>
                    <p className="mt-1 text-foreground/90 italic">"{idea.hook}"</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Por que funciona
                    </p>
                    <p className="mt-1 text-foreground/80">{idea.angle}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {idea.keywords.map((k, j) => (
                    <span
                      key={j}
                      className="rounded-md border border-border bg-background/40 px-2 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {k}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {idea.format}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyIdea(idea)}
                    className="h-7 px-2 text-xs"
                  >
                    <Copy className="mr-1.5 h-3 w-3" /> Copiar
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function PotentialBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    Alto: "bg-primary/15 text-primary border-primary/40",
    Médio: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    Crescente: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  };
  const cls = map[level] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${cls}`}
    >
      <Flame className="h-2.5 w-2.5" /> {level}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center px-4 text-center sm:min-h-[400px]">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/5 sm:h-20 sm:w-20">
        <Lightbulb className="h-7 w-7 text-primary sm:h-8 sm:w-8" />
      </div>
      <h3 className="font-display text-lg text-foreground sm:text-xl">
        Descubra ideias inéditas
      </h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        A IA analisa seu nicho e devolve ângulos pouco explorados, com gancho, formato e
        palavras-chave para você ranquear rápido.
      </p>
    </div>
  );
}
