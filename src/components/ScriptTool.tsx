import { useEffect, useState } from "react";
import { Sparkles, Copy, Save, Loader2, Settings2, History, Wand2, ArrowLeft } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { generateHooks, generateScript, type HookOption } from "@/lib/openai";
import { ScriptDisplay } from "@/components/ScriptDisplay";
import { HistoryList, type SavedScript } from "@/components/HistoryList";

const NICHES = ["Curiosidades", "Terror/Mistério", "Finanças", "Top 10", "História", "Marketing", "Educação", "Outro"];
const TONES = ["Dramático", "Educativo", "Dinâmico/Rápido", "Assustador", "Persuasivo"];

const INTENTS = [
  { value: "vendas", label: "Vendas", desc: "Copy de resposta direta, VSL curta, CTA para comprar" },
  { value: "engajamento", label: "Engajamento", desc: "Provoca comentários e debate" },
  { value: "seguidores", label: "Seguidores", desc: "Cria séries, promete continuação, gera autoridade" },
  { value: "compartilhamentos", label: "Compartilhamentos", desc: "Moeda social, fatos chocantes" },
  { value: "curtidas", label: "Curtidas", desc: "Validação, humor, payoff rápido" },
];

const DURATIONS = Array.from({ length: 10 }, (_, i) => {
  const n = i + 1;
  return { value: `${n}min`, label: `${n} ${n === 1 ? "minuto" : "minutos"}` };
});

interface Props {
  email: string;
}

export function ScriptTool({ email }: Props) {
  const [theme, setTheme] = useState("");
  const [niche, setNiche] = useState("Curiosidades");
  const [tone, setTone] = useState("Dramático");
  const [intent, setIntent] = useState("vendas");
  const [duration, setDuration] = useState("5min");

  const [step, setStep] = useState<"idle" | "hooks" | "script">("idle");
  const [loading, setLoading] = useState(false);
  const [hooks, setHooks] = useState<HookOption[]>([]);
  const [chosenHook, setChosenHook] = useState<string>("");
  const [script, setScript] = useState("");

  const [history, setHistory] = useState<SavedScript[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);

  async function loadHistory() {
    setHistoryLoading(true);
    const { data, error } = await supabase
      .from("scripts")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false });
    if (error) toast.error("Erro ao carregar histórico");
    else setHistory((data ?? []) as SavedScript[]);
    setHistoryLoading(false);
  }

  useEffect(() => {
    if (email) loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  async function handleGenerateHooks() {
    if (!theme.trim()) {
      toast.error("Informe o tema do vídeo.");
      return;
    }
    setLoading(true);
    setScript("");
    setChosenHook("");
    setSelectedId(null);
    try {
      const result = await generateHooks({ theme, niche, tone, intent });
      setHooks(result);
      setStep("hooks");
      toast.success("3 ganchos prontos — escolha o melhor!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao gerar ganchos");
    } finally {
      setLoading(false);
    }
  }

  async function handlePickHook(hook: HookOption) {
    setChosenHook(hook.text);
    setLoading(true);
    try {
      const result = await generateScript({
        theme,
        niche,
        tone,
        intent,
        duration,
        hook: hook.text,
      });
      setScript(result);
      setStep("script");
      toast.success("Roteiro gerado!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao gerar roteiro");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!script) return;
    const { data, error } = await supabase
      .from("scripts")
      .insert({
        title: theme || "Roteiro sem título",
        content: script,
        niche,
        tone,
        duration,
        intent,
        email,
      })
      .select()
      .single();
    if (error) {
      toast.error("Erro ao salvar");
    } else {
      toast.success("Roteiro salvo no seu preset");
      if (data) setHistory((prev) => [data as SavedScript, ...prev]);
    }
  }

  async function handleCopy() {
    if (!script) return;
    await navigator.clipboard.writeText(script);
    toast.success("Copiado!");
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("scripts").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir");
    } else {
      setHistory((prev) => prev.filter((s) => s.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
        setScript("");
        setStep("idle");
      }
      toast.success("Excluído");
    }
  }

  function handleSelect(s: SavedScript) {
    setSelectedId(s.id);
    setScript(s.content);
    setTheme(s.title);
    if (s.niche) setNiche(s.niche);
    if (s.tone) setTone(s.tone);
    if (s.duration) setDuration(s.duration);
    setStep("script");
  }

  const configForm = (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-lg text-foreground">Configurações</h2>
        <p className="text-xs text-muted-foreground">Copy conversiva alinhada ao seu objetivo</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="theme">Tema principal do vídeo</Label>
        <Input
          id="theme"
          placeholder="Ex.: Como parei de perder dinheiro na bolsa"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Intuito do vídeo</Label>
        <Select value={intent} onValueChange={setIntent}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {INTENTS.map((i) => (
              <SelectItem key={i.value} value={i.value}>
                <div className="flex flex-col">
                  <span className="font-medium">{i.label}</span>
                  <span className="text-xs text-muted-foreground">{i.desc}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Nicho</Label>
          <Select value={niche} onValueChange={setNiche}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {NICHES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tom</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Duração</Label>
        <Select value={duration} onValueChange={setDuration}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {DURATIONS.map((d) => (
              <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleGenerateHooks}
        disabled={loading}
        size="lg"
        className="w-full bg-gradient-to-r from-primary to-primary-glow font-semibold text-primary-foreground shadow-[0_0_30px_-8px_var(--primary)] hover:opacity-95"
      >
        {loading && step === "idle" ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando ganchos...</>
        ) : (
          <><Wand2 className="mr-2 h-4 w-4" /> Gerar 3 ganchos</>
        )}
      </Button>
    </div>
  );

  const centerContent = () => {
    if (step === "hooks") {
      return (
        <>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg text-foreground sm:text-xl">Escolha o gancho</h2>
              <p className="text-xs text-muted-foreground">Clique no que mais para o scroll</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setStep("idle")}>
              <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Voltar
            </Button>
          </div>
          <div className="space-y-3">
            {hooks.map((h, i) => (
              <button
                key={i}
                disabled={loading}
                onClick={() => handlePickHook(h)}
                className="group w-full rounded-xl border border-border bg-card/60 p-4 text-left transition-all hover:border-primary hover:bg-primary/5 disabled:opacity-50"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-primary">
                    Opção {i + 1} · {h.angle}
                  </span>
                  {loading && chosenHook === h.text && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  )}
                </div>
                <p className="text-sm leading-relaxed text-foreground/90 sm:text-base">{h.text}</p>
              </button>
            ))}
          </div>
        </>
      );
    }

    if (step === "script" && script) {
      return (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-display text-lg text-foreground sm:text-xl">
                {theme || "Seu roteiro"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {INTENTS.find((i) => i.value === intent)?.label} · {niche} · {tone} ·{" "}
                {DURATIONS.find((d) => d.value === duration)?.label}
              </p>
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1 sm:flex-initial">
                <Copy className="mr-2 h-3.5 w-3.5" /> Copiar
              </Button>
              <Button size="sm" onClick={handleSave} className="flex-1 bg-primary text-primary-foreground sm:flex-initial">
                <Save className="mr-2 h-3.5 w-3.5" /> Salvar
              </Button>
            </div>
          </div>
          <ScriptDisplay script={script} />
        </>
      );
    }

    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center px-4 text-center sm:min-h-[400px]">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/5 sm:h-20 sm:w-20">
          <Sparkles className="h-7 w-7 text-primary sm:h-8 sm:w-8" />
        </div>
        <h3 className="font-display text-lg text-foreground sm:text-xl">Pronto para converter?</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Preencha o tema, escolha o <strong className="text-primary">intuito</strong> do vídeo e a IA
          vai gerar <strong className="text-primary">3 ganchos</strong> para você escolher o melhor.
          Depois, o roteiro completo é escrito em copy conversiva alinhada ao seu objetivo.
        </p>
      </div>
    );
  };

  return (
    <div>
      {/* Mobile actions */}
      <div className="mb-4 flex items-center gap-2 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              <Settings2 className="mr-2 h-4 w-4" /> Configurações
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="font-display">Configurações</SheetTitle>
            </SheetHeader>
            <div className="mt-4">{configForm}</div>
          </SheetContent>
        </Sheet>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              <History className="mr-2 h-4 w-4" /> Preset
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[88vw] max-w-sm overflow-y-auto p-4">
            <SheetHeader>
              <SheetTitle className="font-display">Meu Preset</SheetTitle>
            </SheetHeader>
            <div className="mt-4 h-[calc(100vh-100px)]">
              <HistoryList
                items={history}
                selectedId={selectedId}
                onSelect={handleSelect}
                onDelete={handleDelete}
                loading={historyLoading}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr_280px] xl:grid-cols-[360px_1fr_300px]">
        <section className="hidden rounded-xl border border-border bg-card/40 p-6 lg:block">
          {configForm}
        </section>

        <section className="rounded-xl border border-border bg-card/30 p-4 sm:p-6">
          {centerContent()}
        </section>

        <aside className="hidden lg:block lg:max-h-[calc(100vh-220px)]">
          <HistoryList
            items={history}
            selectedId={selectedId}
            onSelect={handleSelect}
            onDelete={handleDelete}
            loading={historyLoading}
          />
        </aside>
      </div>
    </div>
  );
}
