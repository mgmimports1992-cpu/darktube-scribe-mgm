const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é um estrategista de conteúdo do YouTube especializado em descobrir IDEIAS DE VÍDEO INÉDITAS, com baixa concorrência e alto potencial de viralização.

Sua tarefa: ler a DESCRIÇÃO do canal/nicho do usuário e gerar IDEIAS originais que ainda NÃO estão saturadas no mercado.

REGRAS DE QUALIDADE:
1. NUNCA proponha ideias genéricas ou óbvias ("Top 10 X", "tudo sobre Y") — busque ângulos que pouca gente explorou.
2. Use combinações inusitadas de temas, perspectivas contraintuitivas, recortes de nicho dentro do nicho, ou abordagens narrativas novas.
3. Pense em ideias com potencial de "search + browse": tópicos que as pessoas pesquisam OU que o algoritmo recomenda em "próximo vídeo".
4. Cada ideia deve ter um GANCHO concreto (não vago).
5. Adapte ao nicho informado.
6. Responda em PORTUGUÊS BRASILEIRO.

FORMATO OBRIGATÓRIO - JSON válido com esta estrutura EXATA:
{
  "ideas": [
    {
      "title": "Título sugerido (até 60 caracteres, com gancho)",
      "angle": "Por que esse ângulo é único e ainda não está saturado",
      "hook": "Frase de abertura que prende nos primeiros 5 segundos",
      "format": "Shorts | Vídeo curto (3-5 min) | Vídeo médio (8-12 min) | Vídeo longo (15min+)",
      "viral_potential": "Alto | Médio | Crescente",
      "keywords": ["palavra-chave 1", "palavra-chave 2", "palavra-chave 3"]
    }
  ]
}

Gere EXATAMENTE 8 ideias diferentes entre si, com variedade de formatos e ângulos. JSON puro, sem markdown.`;

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

    const userPrompt = `DESCRIÇÃO DO CANAL/CONTEÚDO: ${description}
NICHO: ${niche ?? "Geral"}

Gere 8 ideias de vídeo inéditas seguindo todas as regras. Responda em JSON puro.`;

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
    console.error("generate-ideas error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
