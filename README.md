# Alongside

A modern e-commerce store management application built with Next.js, Supabase, and Leaflet.

## Features

- **User Authentication** - Email/password login and signup with Supabase Auth
- **Store Management** - Create, edit, and manage multiple stores
- **Product Management** - Create products and link them to stores
- **Interactive Maps** - View and select store locations on Leaflet maps
- **Dark/Light Theme** - Support for system theme preferences
- **Internationalization** - Portuguese (default) and English support

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Maps**: Leaflet, React-Leaflet, OpenStreetMap
- **UI Components**: shadcn/ui, Radix UI, Lucide React
- **Forms**: Zod validation

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/BlackTroller/Alongside-Technical-Pedro.git

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

### Environment Variables

Create a `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Start Supabase local
supabase start

# Run migrations
supabase db reset
```

## Wiki / Documentação

Para mais informações sobre o projeto, arquiteturas e diagramas, consulta a [Wiki](https://github.com/BlackTroller/Alongside-Technical-Pedro/wiki).

Inclui diagramas UML, diagramas de arquitetura, casos de uso, e muito mais.

## License

```
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── api/              # API routes
│   └── dashboard/        # Protected dashboard
├── components/           # React components
│   ├── stores/           # Store-related components
│   └── ui/               # UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── supabase/             # Database migrations
│   └── migrations/       # SQL migrations
└── types/                # TypeScript types
```

## Wiki / Documentação

Para mais informações sobre o projeto, arquiteturas e diagramas, consulta a [Wiki](https://github.com/BlackTroller/Alongside-Technical-Pedro/wiki).

Inclui diagramas UML, diagramas de arquitetura, casos de uso, e muito mais.

## License

MIT