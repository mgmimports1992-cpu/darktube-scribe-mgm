import { supabase } from "@/integrations/supabase/client";

export interface OptimizeResult {
  titles: { title: string; reason: string }[];
  description: string;
  tags: string[];
  strategies: { title: string; description: string }[];
  thumbnail_ideas: string[];
}

export interface VideoIdea {
  title: string;
  angle: string;
  hook: string;
  format: string;
  viral_potential: string;
  keywords: string[];
}

export interface IdeasResult {
  ideas: VideoIdea[];
}

function extractError(error: unknown, fallback: string): string {
  const msg = (error as { context?: { error?: string } })?.context?.error;
  return msg ?? (error as Error)?.message ?? fallback;
}

export async function optimizeVideo(params: {
  description: string;
  niche?: string;
}): Promise<OptimizeResult> {
  const { data, error } = await supabase.functions.invoke("optimize-video", {
    body: params,
  });
  if (error) throw new Error(extractError(error, "Erro ao otimizar vídeo"));
  if (data?.error) throw new Error(data.error);
  if (!data?.titles) throw new Error("Resposta inválida da IA");
  return data as OptimizeResult;
}

export async function generateIdeas(params: {
  description: string;
  niche?: string;
}): Promise<IdeasResult> {
  const { data, error } = await supabase.functions.invoke("generate-ideas", {
    body: params,
  });
  if (error) throw new Error(extractError(error, "Erro ao gerar ideias"));
  if (data?.error) throw new Error(data.error);
  if (!data?.ideas) throw new Error("Resposta inválida da IA");
  return data as IdeasResult;
}
