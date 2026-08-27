const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é um especialista em SEO e crescimento no YouTube, focado em viralização e ranqueamento orgânico. Você conhece o algoritmo do YouTube em 2025, sabe como CTR, retenção, AVD e palavras-chave influenciam o ranqueamento.

Sua tarefa: a partir da DESCRIÇÃO de um vídeo do usuário, gerar um pacote completo de otimização.

REGRAS DE SAÍDA - retorne SEMPRE em JSON válido com esta estrutura EXATA:
{
  "titles": [
    { "title": "...", "reason": "por que esse título converte (CTR, curiosidade, gatilho)" }
  ],
  "description": "Descrição completa otimizada (mínimo 200 palavras), com:\\n- 2 primeiras linhas matadoras (aparecem antes do 'mostrar mais')\\n- palavras-chave naturais espalhadas\\n- timestamps placeholders [00:00] se fizer sentido\\n- chamada para inscrição\\n- 3-5 hashtags no final",
  "tags": ["tag1", "tag2", "..."],
  "strategies": [
    { "title": "Nome curto da estratégia", "description": "explicação prática e acionável" }
  ],
  "thumbnail_ideas": ["3 ideias de thumbnail descritas em 1 linha cada"]
}

REGRAS DE QUALIDADE:
1. Gere EXATAMENTE 5 opções de título, todos com até 60 caracteres, usando técnicas como: números, contraste, curiosidade aberta, palavras-poder (chocante, revelado, ninguém te conta, proibido), brackets [] e parênteses (), sem clickbait enganoso.
2. Tags: 15 a 25 tags, misturando palavras-chave amplas (curtas) e long-tail (3-5 palavras), todas em minúsculas, sem hashtag.
3. Estratégias: 5 a 7 ações práticas e específicas (não genéricas tipo "engaje com o público"). Inclua sugestões sobre: thumbnail, primeiros 30s, retenção, comunidade, playlists, cards/end screens, horário de publicação, série/sequência.
4. Tudo em PORTUGUÊS BRASILEIRO.
5. JSON puro, sem markdown, sem comentários, sem texto fora do objeto.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { description, niche } = await req.json();
    if (!description?.trim()) {
      return new Response(JSON.stringify({ error: "Descrição obrigatória" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const userPrompt = `DESCRIÇÃO DO VÍDEO: ${description}
NICHO: ${niche ?? "Geral"}

Gere o pacote completo de otimização em JSON conforme as regras.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Aguarde um momento." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos da Lovable AI esgotados." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no gateway de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("Resposta vazia da IA");

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Resposta da IA não é JSON válido");
      parsed = JSON.parse(match[0]);
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("optimize-video error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
