import { supabase } from "@/integrations/supabase/client";

export interface HookOption {
  angle: string;
  text: string;
}

interface BaseParams {
  theme: string;
  niche: string;
  tone: string;
  intent: string;
}

export async function generateHooks(params: BaseParams): Promise<HookOption[]> {
  const { data, error } = await supabase.functions.invoke("generate-script", {
    body: { mode: "hooks", ...params },
  });
  if (error) {
    const msg = (error as { context?: { error?: string } })?.context?.error;
    throw new Error(msg ?? error.message ?? "Erro ao gerar ganchos");
  }
  if (data?.error) throw new Error(data.error);
  if (!Array.isArray(data?.hooks)) throw new Error("Resposta vazia da IA");
  return data.hooks;
}

export async function generateScript(
  params: BaseParams & { duration: string; hook: string }
): Promise<string> {
  const { data, error } = await supabase.functions.invoke("generate-script", {
    body: { mode: "full", ...params },
  });
  if (error) {
    const msg = (error as { context?: { error?: string } })?.context?.error;
    throw new Error(msg ?? error.message ?? "Erro ao gerar roteiro");
  }
  if (data?.error) throw new Error(data.error);
  if (!data?.script) throw new Error("Resposta vazia da IA");
  return data.script;
}
