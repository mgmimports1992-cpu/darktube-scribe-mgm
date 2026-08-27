const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DURATION_HINT: Record<string, string> = {
  "1min": "Roteiro de ~1 minuto (150-180 palavras). Ultra direto.",
  "2min": "Roteiro de ~2 minutos (300-350 palavras).",
  "3min": "Roteiro de ~3 minutos (450-520 palavras).",
  "4min": "Roteiro de ~4 minutos (600-680 palavras).",
  "5min": "Roteiro de ~5 minutos (750-850 palavras).",
  "6min": "Roteiro de ~6 minutos (900-1000 palavras).",
  "7min": "Roteiro de ~7 minutos (1050-1150 palavras).",
  "8min": "Roteiro de ~8 minutos (1200-1300 palavras).",
  "9min": "Roteiro de ~9 minutos (1350-1450 palavras).",
  "10min": "Roteiro de ~10 minutos (1500-1700 palavras).",
};

const INTENT_HINT: Record<string, string> = {
  vendas:
    "OBJETIVO PRIMÁRIO: VENDER. Use copy de resposta direta: quebra de objeções, prova social, escassez, urgência, promessa de transformação, CTA claro para clicar/comprar. Estruture como uma VSL curta.",
  engajamento:
    "OBJETIVO PRIMÁRIO: ENGAJAMENTO (comentários). Provoque opinião polêmica, faça perguntas divisivas, deixe loops abertos, incentive o espectador a comentar seu lado. CTA orientado a comentar.",
  seguidores:
    "OBJETIVO PRIMÁRIO: GANHAR SEGUIDORES. Prometa uma SÉRIE/continuação, mostre autoridade única no nicho, entregue insight raro que só quem seguir vai acessar de novo. CTA orientado a seguir/inscrever para não perder a parte 2.",
  compartilhamentos:
    "OBJETIVO PRIMÁRIO: COMPARTILHAMENTOS. Crie moeda social: fato chocante, dado 'que ninguém sabia', gatilho de indignação/orgulho/identidade. O espectador precisa QUERER que amigos vejam. CTA orientado a compartilhar com alguém específico.",
  curtidas:
    "OBJETIVO PRIMÁRIO: CURTIDAS. Valide o espectador, entregue payoff rápido, humor/aha-moment, conteúdo altamente concordável. CTA orientado a curtir se concordou.",
};

const SYSTEM_HOOKS = `Você é um COPYWRITER DE ELITE especializado em vídeo curto viral, escola Alex Hormozi + Ogilvy + Russell Brunson. Sua missão é criar GANCHOS de abertura (primeiros 5-10 segundos) com poder de RETENÇÃO EXTREMO e conversão alinhada ao objetivo.

Regras dos ganchos:
- Cada gancho tem NO MÁXIMO 2 frases curtas (até 25 palavras).
- Deve parar o scroll: choque, curiosidade, contradição, promessa específica, número inusitado ou revelação.
- Zero clichê. Zero "você sabia que...". Zero "hoje eu vou te contar...".
- Cada um deve usar um ÂNGULO diferente entre si (ex.: revelação, contra-intuitivo, história pessoal, dado bombástico).
- Português brasileiro, texto puro, sem markdown, sem aspas.

Formato de saída OBRIGATÓRIO — devolva SOMENTE um JSON válido, sem comentários:
{"hooks":[{"angle":"nome curto do ângulo","text":"o gancho"},{"angle":"...","text":"..."},{"angle":"...","text":"..."}]}`;

const SYSTEM_FULL = `Você é um COPYWRITER DE ELITE de vídeos virais e roteirista de canais de alta retenção do YouTube. Escreve copy EXTREMAMENTE CONVERSIVA, alinhada 100% ao OBJETIVO do vídeo (vendas, engajamento, seguidores, compartilhamentos ou curtidas).

REGRAS:
1. Divida o roteiro EXATAMENTE nestas seções (títulos entre colchetes maiúsculos, nesta ordem):
   [GANCHO] - Use EXATAMENTE o gancho fornecido pelo usuário, sem alterar.
   [VINHETA] - 1 linha curta de transição para a abertura.
   [INTRODUÇÃO] - Ancora o tema, cria loops abertos, promete o payoff. Reforça o OBJETIVO do vídeo.
   [DESENVOLVIMENTO] - Conteúdo principal em blocos numerados ou tópicos. Storytelling cinematográfico, pausas com "...", camadas de curiosidade encadeadas para retenção. Cada bloco reforça sutilmente o objetivo (vender / engajar / etc.).
   [CALL TO ACTION] - CTA cirúrgico e específico ao OBJETIVO informado. Nada genérico.

2. Copy conversiva: use gatilhos (prova, escassez, autoridade, identidade, reciprocidade) quando apropriados ao objetivo. Frases curtas. Ritmo. Verbos fortes.
3. Texto NARRADO em off. NÃO escreva direções técnicas como "(música)". Apenas o que será falado.
4. Português brasileiro, texto puro, SEM markdown, SEM asteriscos.
5. Adapte ao TOM DE VOZ e ao NICHO. Respeite a DURAÇÃO.`;

async function callGateway(messages: unknown[], apiKey: string) {
  return fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages }),
  });
}

function gatewayErr(status: number) {
  if (status === 429) return { code: 429, msg: "Muitas requisições. Aguarde e tente novamente." };
  if (status === 402) return { code: 402, msg: "Créditos da Lovable AI esgotados." };
  return { code: 500, msg: "Erro no gateway de IA" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { mode = "hooks", theme, niche, tone, duration, intent, hook } = body;

    if (!theme?.trim()) {
      return new Response(JSON.stringify({ error: "Tema obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const intentHint = INTENT_HINT[intent as string] ?? INTENT_HINT.engajamento;

    if (mode === "hooks") {
      const userPrompt = `Gere 3 ganchos de abertura para um vídeo.

TEMA: ${theme}
NICHO: ${niche}
TOM: ${tone}
${intentHint}

Devolva SOMENTE o JSON no formato exigido.`;

      const r = await callGateway(
        [
          { role: "system", content: SYSTEM_HOOKS },
          { role: "user", content: userPrompt },
        ],
        LOVABLE_API_KEY
      );
      if (!r.ok) {
        const e = gatewayErr(r.status);
        return new Response(JSON.stringify({ error: e.msg }), {
          status: e.code,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const data = await r.json();
      const raw = data?.choices?.[0]?.message?.content ?? "";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      let hooks: Array<{ angle: string; text: string }> = [];
      try {
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
        hooks = Array.isArray(parsed?.hooks) ? parsed.hooks.slice(0, 3) : [];
      } catch {
        hooks = [];
      }
      if (hooks.length === 0) {
        return new Response(JSON.stringify({ error: "Não foi possível gerar ganchos." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ hooks }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // mode === "full"
    if (!hook?.trim()) {
      return new Response(JSON.stringify({ error: "Gancho escolhido é obrigatório." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = `Crie o roteiro completo usando OBRIGATORIAMENTE o gancho abaixo, sem reescrevê-lo.

TEMA: ${theme}
NICHO: ${niche}
TOM DE VOZ: ${tone}
DURAÇÃO: ${DURATION_HINT[duration] ?? duration}
${intentHint}

GANCHO ESCOLHIDO (colar exatamente na seção [GANCHO]):
${hook}

Comece direto pelo [GANCHO]. Sem comentários antes ou depois.`;

    const r = await callGateway(
      [
        { role: "system", content: SYSTEM_FULL },
        { role: "user", content: userPrompt },
      ],
      LOVABLE_API_KEY
    );
    if (!r.ok) {
      const e = gatewayErr(r.status);
      return new Response(JSON.stringify({ error: e.msg }), {
        status: e.code,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("Resposta vazia da IA");

    return new Response(JSON.stringify({ script: content.trim() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-script error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
