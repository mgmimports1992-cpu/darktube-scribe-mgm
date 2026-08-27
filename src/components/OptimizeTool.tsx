import { useState } from "react";
import { Sparkles, Loader2, Copy, Tag, Lightbulb, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { optimizeVideo, type OptimizeResult } from "@/lib/youtube-tools";

export function OptimizeTool() {
  const [description, setDescription] = useState("");
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizeResult | null>(null);

  async function handleRun() {
    if (!description.trim()) {
      toast.error("Descreva sobre o que é o vídeo.");
      return;
    }
    setLoading(true);
    try {
      const r = await optimizeVideo({ description, niche });
      setResult(r);
      toast.success("Otimização gerada!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  async function copy(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <section className="space-y-5 rounded-xl border border-border bg-card/40 p-6 lg:sticky lg:top-24 lg:self-start">
        <div>
          <h2 className="font-display text-lg text-foreground">Otimizar vídeo</h2>
          <p className="text-xs text-muted-foreground">
            Cole a descrição do vídeo e receba título, descrição, tags e estratégias de
            ranqueamento.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="opt-desc">Sobre o que é o vídeo</Label>
          <Textarea
            id="opt-desc"
            placeholder="Ex.: Um vídeo contando 5 mistérios não resolvidos do oceano profundo, focando em criaturas estranhas filmadas por submarinos..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="opt-niche">Nicho (opcional)</Label>
          <Input
            id="opt-niche"
            placeholder="Ex.: Mistérios, Curiosidades..."
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
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Otimizando...</>
          ) : (
            <><Sparkles className="mr-2 h-4 w-4" /> Gerar Otimização</>
          )}
        </Button>
      </section>

      <section className="rounded-xl border border-border bg-card/30 p-4 sm:p-6">
        {!result ? (
          <EmptyState />
        ) : (
          <div className="space-y-8">
            {/* Titles */}
            <Block icon={<Sparkles className="h-4 w-4" />} title="Títulos virais">
              <div className="space-y-3">
                {result.titles.map((t, i) => (
                  <article
                    key={i}
                    className="rounded-lg border border-border bg-card/60 p-4 transition-colors hover:border-primary/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-display text-base text-foreground">{t.title}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => copy(t.title, "Título")}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{t.reason}</p>
                  </article>
                ))}
              </div>
            </Block>

            {/* Description */}
            <Block icon={<Lightbulb className="h-4 w-4" />} title="Descrição otimizada">
              <div className="rounded-lg border border-border bg-card/60 p-4">
                <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground/90">
                  {result.description}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => copy(result.description, "Descrição")}
                >
                  <Copy className="mr-2 h-3.5 w-3.5" /> Copiar descrição
                </Button>
              </div>
            </Block>

            {/* Tags */}
            <Block icon={<Tag className="h-4 w-4" />} title={`Tags (${result.tags.length})`}>
              <div className="rounded-lg border border-border bg-card/60 p-4">
                <div className="flex flex-wrap gap-2">
                  {result.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs text-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => copy(result.tags.join(", "), "Tags")}
                >
                  <Copy className="mr-2 h-3.5 w-3.5" /> Copiar todas
                </Button>
              </div>
            </Block>

            {/* Strategies */}
            <Block icon={<Sparkles className="h-4 w-4" />} title="Estratégias de ranqueamento">
              <div className="grid gap-3 sm:grid-cols-2">
                {result.strategies.map((s, i) => (
                  <article
                    key={i}
                    className="rounded-lg border border-border bg-card/60 p-4"
                  >
                    <h4 className="font-display text-sm uppercase tracking-wider text-primary">
                      {s.title}
                    </h4>
                    <p className="mt-2 text-sm text-foreground/90">{s.description}</p>
                  </article>
                ))}
              </div>
            </Block>

            {/* Thumbnails */}
            {result.thumbnail_ideas?.length > 0 && (
              <Block icon={<ImageIcon className="h-4 w-4" />} title="Ideias de thumbnail">
                <ul className="space-y-2">
                  {result.thumbnail_ideas.map((idea, i) => (
                    <li
                      key={i}
                      className="rounded-lg border border-border bg-card/60 p-3 text-sm text-foreground/90"
                    >
                      <span className="mr-2 font-display text-primary">{i + 1}.</span>
                      {idea}
                    </li>
                  ))}
                </ul>
              </Block>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function Block({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </span>
        <h3 className="font-display text-sm uppercase tracking-[0.2em] text-foreground">
          {title}
        </h3>
      </header>
      {children}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center px-4 text-center sm:min-h-[400px]">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/5 sm:h-20 sm:w-20">
        <Sparkles className="h-7 w-7 text-primary sm:h-8 sm:w-8" />
      </div>
      <h3 className="font-display text-lg text-foreground sm:text-xl">
        Otimize seu vídeo para o algoritmo
      </h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Descreva o conteúdo do vídeo e a IA gera os melhores títulos, uma descrição
        completa, tags e um plano de ranqueamento.
      </p>
    </div>
  );
}
