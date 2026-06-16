# RECORDERYS Web

Web app para registrar compras importantes, guardar tickets, controlar devoluciones y garantías, y buscar artículos desde un dashboard privado.

## Stack Propuesto

- Next.js App Router
- Supabase Auth: Google, Apple y email/password
- Supabase PostgreSQL con Row Level Security
- Supabase Storage para fotos y tickets
- IA/OCR server-side en una fase posterior

## Puesta en Marcha

1. Crea un proyecto en Supabase.
2. Ejecuta `supabase/migrations/0001_initial_schema.sql` en el SQL editor.
3. Ejecuta `supabase/seed/categories.sql` para cargar categorías comunes.
4. Copia `.env.example` a `.env.local` y rellena las claves públicas de Supabase.
5. Instala dependencias y arranca:

```bash
npm install
npm run dev
```

## Alcance Inicial

- Landing pública
- Login con Google, Apple y email/password
- Dashboard privado
- Mosaico de artículos
- Buscador y filtros por categoría
- Esquema SQL preparado para IA de clasificación
