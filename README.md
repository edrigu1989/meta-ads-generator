# Meta Ads Generator

Generador de contenido para anuncios de Meta Ads usando múltiples AI providers (Claude, OpenAI, Gemini).

## Features

- 🤖 Múltiples proveedores de AI (Anthropic Claude, OpenAI, Google Gemini)
- 📝 Generación de hooks, bodies y CTAs optimizados
- 🎯 Análisis de contexto para campañas publicitarias
- 🔄 Sistema de iteración de contenido
- 🎨 UI moderna con Tailwind CSS
- 🌙 Soporte para tema claro/oscuro

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI SDKs:** @anthropic-ai/sdk, openai, @google/generative-ai
- **Forms:** React Hook Form + Zod
- **UI Components:** Lucide React, Sonner (toasts)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env` and add your API keys:

```bash
cp .env.example .env
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

### AI Providers (Required)

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

- **Anthropic API Key**: For Claude AI models - Get it from [Anthropic Console](https://console.anthropic.com/)
- **OpenAI API Key**: For GPT-4 models - Get it from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Google AI API Key**: For Gemini models - Get it from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Research APIs (Optional)

These APIs enhance ad generation with real-time research capabilities:

```env
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
SERP_API_KEY=your_serp_api_key_here
JINA_API_KEY=your_jina_api_key_here
```

- **Firecrawl API**: Web scraping and content extraction for analyzing competitor ads and landing pages
  - Get it from [Firecrawl](https://www.firecrawl.dev/)
  - Use case: Extract content from URLs to understand market positioning

- **SERP API**: Search engine results for researching trending topics and keywords
  - Get it from [SerpAPI](https://serpapi.com/)
  - Use case: Analyze top-performing ads and search trends in your niche

- **Jina AI API**: Content reading and processing for analyzing documents and web pages
  - Get it from [Jina AI](https://jina.ai/)
  - Use case: Parse and understand competitor marketing materials

### Cache (Optional)

For improved performance and reduced API costs:

```env
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token_here
```

- **Upstash Redis**: Serverless Redis for caching API responses
  - Get it from [Upstash Console](https://console.upstash.com/)
  - Use case: Cache generated ads and research results to avoid redundant API calls

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

The easiest way to deploy is using Vercel:

1. Push your code to GitHub
2. Import your repository on Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── api/         # API routes
│   ├── dashboard/   # Dashboard page
│   └── settings/    # Settings page
├── components/       # React components
│   ├── ui/          # UI components
│   ├── forms/       # Form components
│   ├── ads/         # Ad-related components
│   └── settings/    # Settings components
├── lib/             # Utilities and libraries
│   ├── ai/          # AI provider integrations
│   │   └── providers/
│   ├── utils/       # Utility functions
│   └── prompts/     # AI prompts
└── types/           # TypeScript type definitions
```

## License

MIT
