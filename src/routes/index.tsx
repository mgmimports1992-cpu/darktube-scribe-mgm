import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Skull, FileText, Search, Lightbulb } from "lucide-react";
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
    ],
  }),
});

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
    <div className="min-h-screen">
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
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
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
    </div>
  );
}
