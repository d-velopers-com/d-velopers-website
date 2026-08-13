# 🏗️ Guía de Arquitectura PRO - D-velopers Website

## Objetivo

Transformar el proyecto en una arquitectura profesional con código limpio, componentes reutilizables, responsabilidades definidas y las mejores prácticas de Next.js 15.

---

## 1. Nueva Estructura de Carpetas (Feature-First)

```
src/
├── app/                           # Next.js App Router
│   ├── (public)/                  # Grupo de rutas públicas
│   │   ├── page.tsx               # Home (solo orchestration)
│   │   ├── login/page.tsx
│   │   └── users/[handler]/page.tsx
│   ├── (protected)/               # Rutas autenticadas
│   │   ├── dashboard/page.tsx
│   │   └── layout.tsx             # AuthGuard wrapper
│   ├── api/                       # Route Handlers
│   │   ├── auth/
│   │   ├── users/
│   │   └── trpc/[trpc]/route.ts   # (opcional) tRPC
│   ├── layout.tsx
│   ├── error.tsx
│   ├── loading.tsx
│   └── not-found.tsx
│
├── features/                      # 🆕 Módulos por dominio
│   ├── users/
│   │   ├── components/
│   │   │   ├── UserCard.tsx
│   │   │   ├── UserGrid.tsx
│   │   │   ├── UserProfile.tsx
│   │   │   ├── UserAvatar.tsx
│   │   │   └── index.ts           # Barrel export
│   │   ├── hooks/
│   │   │   ├── useUsers.ts
│   │   │   ├── useUserProfile.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── user.repository.ts # CRUD Prisma
│   │   │   ├── user.service.ts    # Lógica de negocio
│   │   │   └── index.ts
│   │   ├── schemas/
│   │   │   └── user.schema.ts     # Zod validations
│   │   ├── types/
│   │   │   └── user.types.ts
│   │   └── index.ts               # Public API del feature
│   │
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginButton.tsx
│   │   │   ├── AuthGuard.tsx
│   │   │   └── SessionProvider.tsx
│   │   ├── hooks/
│   │   │   ├── useSession.ts
│   │   │   └── useAuth.ts
│   │   ├── services/
│   │   │   ├── discord-oauth.ts
│   │   │   └── session.ts
│   │   └── index.ts
│   │
│   └── search/
│       ├── components/
│       │   ├── SearchInput.tsx
│       │   ├── FilterPanel.tsx
│       │   ├── FilterChip.tsx
│       │   └── MobileFilters.tsx
│       ├── hooks/
│       │   ├── useSearchFilters.ts
│       │   └── useDebounce.ts
│       └── index.ts
│
├── shared/                        # 🆕 Código compartido
│   ├── components/
│   │   ├── ui/                    # Design System primitives
│   │   │   ├── Button/
│   │   │   ├── Card/
│   │   │   ├── Input/
│   │   │   ├── Skeleton/
│   │   │   └── index.ts
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Container.tsx
│   │   └── feedback/
│   │       ├── EmptyState.tsx
│   │       ├── ErrorState.tsx
│   │       └── LoadingState.tsx
│   ├── hooks/
│   │   ├── useMediaQuery.ts
│   │   └── useLocalStorage.ts
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── utils.ts
│   │   └── cn.ts                  # className utility
│   ├── types/
│   │   └── common.types.ts
│   └── constants/
│       ├── countries.ts
│       └── availability.ts
│
├── config/
│   ├── site.ts
│   ├── fonts.ts
│   └── navigation.ts
│
├── styles/
│   ├── globals.css
│   └── tokens.css                 # Design tokens CSS vars
│
└── locales/
    ├── en.json
    └── es.json
```

---

## 2. Design System Tokens

```css
/* styles/tokens.css */
:root {
  /* Spacing Scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;

  /* Typography Scale */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;

  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;

  /* Z-Index Scale */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal: 300;
  --z-toast: 400;
}
```

---

## 3. Componentes Reutilizables

### 3.1 UserCard Refactorizado

```tsx
// features/users/components/UserCard.tsx
import { memo } from "react";
import Link from "next/link";
import { Card, CardBody } from "@heroui/card";
import { UserAvatar } from "./UserAvatar";
import { TagList } from "./TagList";
import type { PublicUser } from "../types";

interface UserCardProps {
  user: PublicUser;
}

export const UserCard = memo(function UserCard({ user }: UserCardProps) {
  const profileUrl = `/users/${user.handler}`;

  return (
    <Card className="group hover:scale-[1.02] transition-transform">
      <CardBody className="p-0">
        <Link href={profileUrl} className="block p-4">
          <div className="flex items-start gap-3">
            <UserAvatar
              src={user.avatar}
              discordId={user.discordId}
              discriminator={user.discriminator}
              country={user.country}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">
                {user.name || user.username}
              </h3>
              <p className="text-sm text-default-500 truncate">{user.title}</p>
              {user.yoe && user.yoe > 0 && (
                <p className="text-xs text-default-400">
                  {user.yoe}+ años de experiencia
                </p>
              )}
            </div>
          </div>
          <TagList tags={user.tags} maxVisible={3} className="mt-3" />
        </Link>
      </CardBody>
    </Card>
  );
});
```

### 3.2 Custom Hook para Filtros

```typescript
// features/search/hooks/useSearchFilters.ts
import { useState, useCallback, useMemo, useRef } from "react";
import { useDebounce } from "./useDebounce";
import type { SearchFilters } from "../types";

const INITIAL_FILTERS: SearchFilters = {
  searchQuery: "",
  availability: null,
  english: "",
  country: "",
};

export function useSearchFilters(
  onFiltersChange: (filters: SearchFilters) => void,
) {
  const [filters, setFilters] = useState<SearchFilters>(INITIAL_FILTERS);
  const [searchInput, setSearchInput] = useState("");

  // Debounce only the search query
  const debouncedSearch = useDebounce(searchInput, 500);

  // Update parent when debounced search changes
  useEffect(() => {
    onFiltersChange({ ...filters, searchQuery: debouncedSearch });
  }, [debouncedSearch, filters, onFiltersChange]);

  const updateFilter = useCallback(
    <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
      if (key === "searchQuery") {
        setSearchInput(value as string);
      } else {
        setFilters((prev) => {
          const next = { ...prev, [key]: value };
          onFiltersChange({ ...next, searchQuery: debouncedSearch });
          return next;
        });
      }
    },
    [debouncedSearch, onFiltersChange],
  );

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setSearchInput("");
    onFiltersChange(INITIAL_FILTERS);
  }, [onFiltersChange]);

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      searchInput || filters.availability || filters.english || filters.country,
    );
  }, [searchInput, filters]);

  return {
    filters: { ...filters, searchQuery: searchInput },
    updateFilter,
    clearFilters,
    hasActiveFilters,
  };
}
```

### 3.3 Hook useDebounce

```typescript
// shared/hooks/useDebounce.ts
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

---

## 4. Validación con Zod

```typescript
// features/users/schemas/user.schema.ts
import { z } from "zod";

export const userProfileSchema = z.object({
  name: z.string().max(100).optional().nullable(),
  title: z.string().max(200).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  country: z.string().length(2).optional().nullable(),
  englishLevel: z
    .enum(["A1", "A2", "B1", "B2", "C1", "C2", "NATIVE"])
    .optional()
    .nullable(),
  tags: z.array(z.string().max(50)).max(10).default([]),
  availability: z
    .array(
      z.enum([
        "FREELANCE",
        "PART_TIME",
        "FULL_TIME",
        "CONSULTING",
        "NOT_AVAILABLE",
      ]),
    )
    .default([]),
  yoe: z.number().int().min(0).max(50).optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  contactLinks: z.array(z.string().url()).max(5).default([]),
  link: z.string().url().optional().nullable(),
  isPublic: z.boolean().default(false),
});

export const searchFiltersSchema = z.object({
  searchQuery: z.string().max(200).default(""),
  english: z.string().optional(),
  availability: z
    .enum([
      "FREELANCE",
      "PART_TIME",
      "FULL_TIME",
      "CONSULTING",
      "NOT_AVAILABLE",
    ])
    .optional()
    .nullable(),
  country: z.string().length(2).optional(),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type SearchFiltersInput = z.infer<typeof searchFiltersSchema>;
```

---

## 5. Service Layer Pattern

```typescript
// features/users/services/user.repository.ts
import { prisma } from "@/shared/lib/prisma";
import type { Prisma } from "@prisma/client";

const USER_SELECT = {
  id: true,
  discordId: true,
  username: true,
  handler: true,
  avatar: true,
  name: true,
  title: true,
  country: true,
  tags: true,
  yoe: true,
  isPublic: true,
  // ... resto de campos
} as const;

export const userRepository = {
  findByDiscordId: (discordId: string) =>
    prisma.user.findUnique({
      where: { discordId },
      select: USER_SELECT,
    }),

  findByHandler: (handler: string) =>
    prisma.user.findUnique({
      where: { handler },
      select: USER_SELECT,
    }),

  findPublic: (filters?: SearchFiltersInput) => {
    const where: Prisma.UserWhereInput = { isPublic: true };

    if (filters?.country) where.country = filters.country;
    if (filters?.english) where.englishLevel = filters.english;
    if (filters?.availability) {
      where.availability = { has: filters.availability };
    }
    if (filters?.searchQuery) {
      where.OR = [
        { name: { contains: filters.searchQuery, mode: "insensitive" } },
        { title: { contains: filters.searchQuery, mode: "insensitive" } },
        { tags: { hasSome: [filters.searchQuery] } },
      ];
    }

    return prisma.user.findMany({
      where,
      select: USER_SELECT,
      orderBy: { createdAt: "desc" },
    });
  },

  update: (discordId: string, data: Prisma.UserUpdateInput) =>
    prisma.user.update({
      where: { discordId },
      data,
    }),
};
```

---

## 6. React Query (TanStack Query)

```typescript
// features/users/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SearchFilters, PublicUser } from "../types";

const USERS_KEY = ["users"] as const;

async function fetchPublicUsers(filters: SearchFilters): Promise<PublicUser[]> {
  const params = new URLSearchParams();
  if (filters.searchQuery) params.set("q", filters.searchQuery);
  if (filters.country) params.set("country", filters.country);
  if (filters.english) params.set("english", filters.english);
  if (filters.availability) params.set("availability", filters.availability);

  const res = await fetch(`/api/users/public?${params}`);
  if (!res.ok) throw new Error("Failed to fetch users");
  const data = await res.json();
  return data.users;
}

export function usePublicUsers(filters: SearchFilters) {
  return useQuery({
    queryKey: [...USERS_KEY, "public", filters],
    queryFn: () => fetchPublicUsers(filters),
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60_000, // 5 minutes
  });
}

export function useUserProfile(handler: string) {
  return useQuery({
    queryKey: [...USERS_KEY, "profile", handler],
    queryFn: async () => {
      const res = await fetch(`/api/users/${handler}`);
      if (!res.ok) throw new Error("User not found");
      return res.json();
    },
    enabled: Boolean(handler),
  });
}
```

---

## 7. Server Components vs Client Components

```tsx
// app/(public)/page.tsx - Server Component (orquestación)
import { Suspense } from "react";
import { UsersSection } from "@/features/users";
import { HeroSection } from "./components/HeroSection";
import { UsersSkeleton } from "@/features/users";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <Suspense fallback={<UsersSkeleton count={6} />}>
        <UsersSection />
      </Suspense>
    </main>
  );
}

// features/users/components/UsersSection.tsx - Client Component
("use client");

import { usePublicUsers } from "../hooks/useUsers";
import { useSearchFilters } from "@/features/search";
import { UserGrid } from "./UserGrid";
import { SearchPanel } from "@/features/search";

export function UsersSection() {
  const { filters, updateFilter, clearFilters } = useSearchFilters();
  const { data: users, isLoading, error } = usePublicUsers(filters);

  return (
    <section className="container mx-auto px-4 py-8">
      <SearchPanel
        filters={filters}
        onFilterChange={updateFilter}
        onClear={clearFilters}
      />
      <UserGrid users={users} isLoading={isLoading} error={error} />
    </section>
  );
}
```

---

## 8. Error Handling Pattern

```tsx
// shared/components/feedback/ErrorBoundary.tsx
"use client";

import { Component, ReactNode } from "react";
import { ErrorState } from "./ErrorState";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <ErrorState
            message="Algo salió mal"
            onRetry={() => this.setState({ hasError: false })}
          />
        )
      );
    }
    return this.props.children;
  }
}

// app/error.tsx - Next.js Error Boundary
("use client");

import { useEffect } from "react";
import { Button } from "@heroui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-2xl font-bold">¡Algo salió mal!</h2>
      <p className="text-default-500">{error.message}</p>
      <Button color="primary" onPress={reset}>
        Intentar de nuevo
      </Button>
    </div>
  );
}
```

---

## 9. API Routes con Validación

```typescript
// app/api/users/public/route.ts
import { NextRequest, NextResponse } from "next/server";
import { searchFiltersSchema } from "@/features/users/schemas";
import { userRepository } from "@/features/users/services";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Validar con Zod
    const filters = searchFiltersSchema.parse({
      searchQuery: searchParams.get("q") ?? "",
      english: searchParams.get("english") ?? undefined,
      availability: searchParams.get("availability") ?? undefined,
      country: searchParams.get("country") ?? undefined,
    });

    const users = await userRepository.findPublic(filters);

    return NextResponse.json(
      { users },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid parameters", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

---

## 10. Testing Guidelines

### Estructura de Tests

```
__tests__/
├── features/
│   ├── users/
│   │   ├── components/
│   │   │   └── UserCard.test.tsx
│   │   ├── hooks/
│   │   │   └── useUsers.test.ts
│   │   └── services/
│   │       └── user.repository.test.ts
│   └── search/
│       └── hooks/
│           └── useSearchFilters.test.ts
├── shared/
│   └── hooks/
│       └── useDebounce.test.ts
└── e2e/
    └── home.spec.ts
```

### Ejemplo de Test

```typescript
// __tests__/features/users/components/UserCard.test.tsx
import { render, screen } from '@testing-library/react';
import { UserCard } from '@/features/users/components/UserCard';
import { mockUser } from '@/__mocks__/user';

describe('UserCard', () => {
  it('renders user name and title', () => {
    render(<UserCard user={mockUser} />);

    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    expect(screen.getByText(mockUser.title)).toBeInTheDocument();
  });

  it('shows username when name is not provided', () => {
    render(<UserCard user={{ ...mockUser, name: null }} />);

    expect(screen.getByText(mockUser.username)).toBeInTheDocument();
  });

  it('displays country flag when country is set', () => {
    render(<UserCard user={{ ...mockUser, country: 'MX' }} />);

    expect(screen.getByAltText('Mexico')).toBeInTheDocument();
  });
});
```

---

## 11. Performance Optimizations

### Configuración Next.js 15

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["@heroui/react", "framer-motion"],
  },
  images: {
    remotePatterns: [
      { hostname: "cdn.discordapp.com" },
      { hostname: "flagcdn.com" },
    ],
  },
  logging: {
    fetches: { fullUrl: true },
  },
};

module.exports = nextConfig;
```

### Lazy Loading Components

```tsx
// Lazy load heavy components
import dynamic from "next/dynamic";

const FilterPanel = dynamic(
  () => import("@/features/search").then((mod) => mod.FilterPanel),
  {
    loading: () => <Skeleton className="h-12 w-full" />,
    ssr: false,
  },
);
```

---

## 12. Dependencias Recomendadas

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.x",
    "zod": "^3.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x"
  },
  "devDependencies": {
    "@tanstack/eslint-plugin-query": "^5.x",
    "husky": "^9.x",
    "lint-staged": "^15.x",
    "@commitlint/cli": "^19.x"
  }
}
```

---

## Verificación

### Comandos de Verificación

```bash
# Lint
pnpm lint

# Type check
pnpm tsc --noEmit

# Tests
pnpm test

# Build verification
pnpm build
```

### Testing Manual

1. Verificar que la página home carga correctamente
2. Probar filtros de búsqueda
3. Verificar que los perfiles de usuario cargan
4. Probar responsividad en móvil

---

## 13. Migración a Next.js 16

### Por qué Next.js 16

Next.js 16 incluye soporte nativo para **MCP (Model Context Protocol)**, lo que permite integración directa con herramientas AI para:

- Debugging en tiempo real
- Inspección de rutas y componentes
- Diagnóstico de errores
- Información de build

### Comando de Migración

```bash
# Codemod oficial (requiere git limpio)
npx @next/codemod@latest upgrade latest

# O manualmente
pnpm add next@16 react@19 react-dom@19
```

### Cambios Principales en Next.js 16

#### APIs Async (Breaking Changes)

```typescript
// Antes (Next.js 15)
export default function Page({ params }: { params: { id: string } }) {
  const id = params.id;
}

// Después (Next.js 16)
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
}
```

#### Headers y Cookies

```typescript
// Antes
import { cookies, headers } from "next/headers";
const cookieStore = cookies();
const headersList = headers();

// Después
import { cookies, headers } from "next/headers";
const cookieStore = await cookies();
const headersList = await headers();
```

### MCP Integration (Built-in)

Next.js 16+ expone automáticamente un endpoint MCP en `/_next/mcp` cuando el dev server está corriendo. No requiere configuración adicional.

```typescript
// Verificar MCP disponible
// Navegar a http://localhost:3000/_next/mcp
```

### Verificación Post-Migración

1. Ejecutar `pnpm build` para verificar errores de compilación
2. Revisar uso de `params`, `searchParams`, `cookies()`, `headers()`
3. Verificar que MCP endpoint responde en dev mode

---

> [!IMPORTANT]
> Este documento es una guía de referencia. La implementación debe hacerse de forma incremental, migrando feature por feature para evitar breaking changes.
