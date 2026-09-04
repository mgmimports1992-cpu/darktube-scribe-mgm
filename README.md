# Remix of Ferramenta de estrutura de video

Aja como um desenvolvedor Full-Stack Sênior, especialista em React, Vite, Tailwind CSS, Supabase e integração com a API da OpenAI. 

Seu objetivo é criar um "Gerador de Roteiros para Canais Dark do YouTube". 

IMPORTANTE: A aplicação não deve ter sistema de autenticação (login/senha) nem página de criação de conta. O acesso deve ser direto e aberto.

### 1. Estrutura da Interface (UI/UX)

Crie uma interface moderna, escura (dark mode nativo para combinar com o tema "canal dark") e responsiva. A tela deve ser dividida em duas seções principais:

- Coluna da Esquerda (Configurações do Roteiro): Um formulário limpo com os seguintes campos:

  - Tema principal do vídeo (Input de texto).

  - Nicho (Select: Curiosidades, Terror/Mistério, Finanças, Top 10, História, Outro).

  - Tom de Voz (Select: Dramático, Educativo, Dinâmico/Rápido, Assustador).

  - Duração Estimada (Select: Curto/Shorts, 5 minutos, 10 minutos).

  - Botão principal e chamativo: "Gerar Roteiro com IA". Mostre um estado de "Carregando..." enquanto a API responde.

- Coluna da Direita (Visualização e Histórico): 

  - Uma área de texto grande (Rich Text ou Markdown) exibindo o roteiro gerado, dividido claramente em: [GANCHO], [VINHETA], [INTRODUÇÃO], [DESENVOLVIMENTO] e [CALL TO ACTION].

  - Botões de ação abaixo do roteiro: "Copiar para Área de Transferência" e "Salvar Roteiro".

  - Uma lista lateral ou aba secundária mostrando o "Histórico de Roteiros Salvos" puxados do Supabase.

### 2. Integração com a OpenAI

A geração do roteiro deve ser feita chamando a API da OpenAI (modelo gpt-4o-mini ou gpt-3.5-turbo para otimização de custos).

- Crie a função de chamada à API, construindo um System Prompt forte por trás dos panos, dizendo para a IA agir como um roteirista profissional de retenção máxima para YouTube.

- PASSO PARA O USUÁRIO: Antes de escrever o código de integração, pare e solicite ao usuário (eu) que adicione a chave da API da OpenAI no arquivo `.env` como `VITE_OPENAI_API_KEY`. Crie o código para consumir essa variável.

### 3. Integração com Supabase (Banco de Dados)

A aplicação deve salvar o histórico de roteiros criados em um banco de dados do Supabase. Como não há autenticação, salvaremos os dados de forma global por enquanto.

- Configure o cliente do Supabase usando as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

- PASSO PARA O USUÁRIO: No seu primeiro output, escreva o código SQL exato que eu preciso rodar lá no SQL Editor do painel do meu Supabase para criar a tabela necessária. 

  - A tabela deve se chamar `scripts` e ter as colunas: `id` (uuid primário), `title` (texto), `content` (texto longo), `niche` (texto), e `created_at` (timestamp).

  - Forneça também as instruções em SQL para desativar o RLS (Row Level Security) desta tabela `scripts`, já que não teremos sistema de usuários logados.

Por favor, comece me passando as instruções de configuração (variáveis de ambiente e SQL do Supabase) e, em seguida, construa a interface completa e funcional.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://darktube-scribe-mgm.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fa1677e8-73a5-4dc7-bb91-33892d11338f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
