import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Skull, FileText, Search, Lightbulb, Wand2, Zap, Target, TrendingUp } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScriptTool } from "@/components/ScriptTool";
import { OptimizeTool } from "@/components/OptimizeTool";
import { IdeasTool } from "@/components/IdeasTool";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Dark Script — Suite de IA para Canais Dark do YouTube" },
      {
        name: "description",
        content:
          "Gere roteiros virais com copy conversiva, 3 ganchos para escolher, otimize títulos/tags e descubra ideias inéditas para ranquear no YouTube.",
      },
      { property: "og:title", content: "Dark Script — Suite de IA para Canais Dark do YouTube" },
      {
        property: "og:description",
        content:
          "Gere roteiros virais com copy conversiva, 3 ganchos para escolher, otimize títulos/tags e descubra ideias inéditas para ranquear no YouTube.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const FEATURES = [
  {
    icon: Wand2,
    title: "Roteiros prontos",
    desc: "Ganchos, copy conversiva e estrutura completa em segundos.",
  },
  {
    icon: Target,
    title: "Alinhado ao objetivo",
    desc: "Vendas, engajamento, seguidores ou compartilhamentos — você escolhe.",
  },
  {
    icon: TrendingUp,
    title: "Feito para ranquear",
    desc: "Títulos, tags e ideias otimizadas para o algoritmo do YouTube.",
  },
];

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-background to-card/20 px-4 py-12 sm:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,oklch(0.58_0.22_25/0.12),transparent_60%)]" />
      <div className="relative mx-auto max-w-4xl text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary shadow-[0_0_20px_-8px_var(--primary)]">
          <Zap className="h-3.5 w-3.5" />
          IA para canais dark
        </div>
        <h2 className="font-display text-3xl leading-tight text-foreground sm:text-5xl">
          Roteiros que prendem, títulos que clica e ideias que viralizam
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          A ferramenta de IA pensada para quem cria conteúdo dark no YouTube. Gere roteiros com copy
          conversiva, otimize seus vídeos e nunca mais fique sem ideia.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card/40 p-5 text-left transition-colors hover:border-primary/30 hover:bg-card/60"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-4 w-4" />
              </div>
              <h3 className="font-display text-sm text-foreground">{f.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/20 px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Skull className="h-4 w-4 text-primary" />
          <span className="font-display text-foreground">DARK SCRIPT</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Feito para canais dark</span>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Dark Script. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}

function Index() {
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    let id = localStorage.getItem("ds_guest_id");
    if (!id) {
      id = `guest-${crypto.randomUUID()}`;
      localStorage.setItem("ds_guest_id", id);
    }
    setEmail(id);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Toaster theme="dark" position="top-center" />

      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow shadow-[0_0_20px_-5px_var(--primary)] sm:h-10 sm:w-10">
              <Skull className="h-4 w-4 text-primary-foreground sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-display text-base tracking-wider text-foreground sm:text-xl">
                DARK SCRIPT
              </h1>
              <p className="hidden text-[11px] uppercase tracking-[0.25em] text-muted-foreground sm:block">
                Copy conversiva · IA
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
            <a href="#ferramentas" className="transition-colors hover:text-foreground">
              Ferramentas
            </a>
            <a href="#preset" className="transition-colors hover:text-foreground">
              Preset
            </a>
          </nav>
        </div>
      </header>

      <Hero />

      <main id="ferramentas" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {email ? (
          <Tabs defaultValue="script" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-3 bg-card/40 p-1 sm:w-auto sm:inline-grid">
              <TabsTrigger value="script" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Roteiro</span>
              </TabsTrigger>
              <TabsTrigger value="optimize" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Otimizar</span>
              </TabsTrigger>
              <TabsTrigger value="ideas" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Lightbulb className="h-4 w-4" />
                <span className="hidden sm:inline">Ideias</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="script" className="mt-0">
              <ScriptTool email={email} />
            </TabsContent>
            <TabsContent value="optimize" className="mt-0">
              <OptimizeTool />
            </TabsContent>
            <TabsContent value="ideas" className="mt-0">
              <IdeasTool />
            </TabsContent>
          </Tabs>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
