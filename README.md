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

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
```

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
