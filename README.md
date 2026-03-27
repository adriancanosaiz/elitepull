# ElitePull

Frontend premium para una tienda TCG construido con Next.js App Router, TypeScript, Supabase y un panel admin V1 para catálogo, media y autenticación.

## Estado actual

- Storefront público operativo:
  - home
  - catálogo
  - páginas por marca
  - páginas por categoría
  - PDP
  - carrito visual/local
- Supabase conectado para:
  - `products`
  - `categories`
  - `product_images`
  - `inventory`
  - `profiles`
- Admin V1 operativo para:
  - login SSR con Supabase Auth
  - protección de `/admin`
  - CRUD V1 de productos
  - uploader V1 de media
- Scripts operativos para:
  - importar catálogo
  - subir media a Storage

No está implementado todavía:

- checkout real
- pedidos
- pagos
- clientes/panel avanzado

## Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Supabase:
  - Postgres
  - Auth
  - Storage
- `@supabase/ssr` para sesión SSR
- Zod para validación
- Radix UI en componentes base concretos
- Lucide React para iconografía

## Requisitos

- Node.js `>= 22.18.0`
- Proyecto de Supabase configurado

## Variables de entorno

Archivo recomendado: `.env.local`

Variables mínimas:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=TU_SUPABASE_SERVICE_ROLE_KEY
```

Notas:

- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` alimentan el storefront SSR y el login/admin.
- `SUPABASE_SERVICE_ROLE_KEY` se usa en scripts y en el uploader admin de media.

## Scripts útiles

```bash
npm run dev
npx tsc --noEmit
npm run build
npm run lint
npm run catalog:media:upload
npm run catalog:media:upload:overwrite
npm run catalog:import
```

## Arquitectura técnica

### 1. Capa de presentación

- `app/` define rutas, layouts, páginas y server actions.
- `components/` contiene UI reusable:
  - `components/store/` para storefront
  - `components/admin/` para panel interno
  - `components/ui/` para primitives compartidos

### 2. Capa de acceso a datos

- `lib/repositories/store-repository.ts` es la entrada principal del storefront.
- `lib/admin/products.ts` encapsula el CRUD admin de productos.
- `lib/admin/product-media.ts` encapsula la subida de portada/galería y sincroniza Storage con BD.

### 3. Capa de adaptación

- `lib/adapters/` transforma datos de dominio o Supabase en contratos consumibles por UI.
- `lib/adapters/supabase-product-adapter.ts` convierte filas reales de Supabase a `Product`.

### 4. Capa de validación

- `lib/validators/` centraliza esquemas Zod para:
  - productos admin
  - contratos de storefront
  - import de catálogo

### 5. Capa de autenticación y autorización

- `lib/supabase/server.ts`, `browser.ts` y `middleware.ts` resuelven el setup SSR.
- `lib/auth/admin.ts` contiene:
  - lectura de sesión actual
  - lectura de `profiles`
  - guard de acceso admin/staff

### 6. Estrategia de fallback

- El storefront intenta usar Supabase real.
- Si faltan variables en desarrollo/build, el repositorio puede caer en mocks locales.
- Esa estrategia está concentrada en:
  - `lib/env.ts`
  - `lib/repositories/store-repository.ts`

## Flujos principales

### Flujo storefront

1. La ruta en `app/` pide datos al repositorio.
2. `lib/repositories/store-repository.ts` consulta Supabase.
3. Los adapters convierten filas SQL a contratos de UI.
4. Los componentes de `components/store/` renderizan la experiencia.

### Flujo admin de producto

1. `/admin/productos` y subrutas pasan por `app/admin/layout.tsx`.
2. `requireAdminAccess()` valida sesión y rol.
3. Las páginas admin cargan datos desde `lib/admin/products.ts`.
4. Los formularios envían a server actions en `app/admin/productos/actions.ts`.
5. Se revalidan rutas públicas y privadas tras mutaciones.

### Flujo media uploader

1. La edición de producto renderiza `ProductMediaUploader`.
2. Las actions de `app/admin/productos/media/actions.ts` delegan en `lib/admin/product-media.ts`.
3. `lib/admin/product-media.ts`:
   - valida producto
   - sube a `product-media`
   - actualiza `products.main_image_path`
   - regenera `product_images`

## Convenciones de media

Bucket:

- `product-media`

Rutas esperadas:

- portada: `products/{productId}/cover.{ext}`
- galería: `products/{productId}/gallery/01.{ext}`
- galería: `products/{productId}/gallery/02.{ext}`

Importante:

- La BD debe guardar la extensión real del archivo subido.
- Si el archivo existe como `.png`, la BD no debe apuntar a `.webp`.

## Mapa de rutas

### Storefront público

| Ruta | Archivo | Propósito |
| --- | --- | --- |
| `/` | `app/page.tsx` | Home del storefront |
| `/catalogo` | `app/catalogo/page.tsx` | Listing general |
| `/preventa` | `app/preventa/page.tsx` | Listing filtrado de preventa |
| `/marca/[brandSlug]` | `app/marca/[brandSlug]/page.tsx` | Landing/listing por marca |
| `/marca/[brandSlug]/[categorySlug]` | `app/marca/[brandSlug]/[categorySlug]/page.tsx` | Listing por marca y categoría |
| `/accesorios` | `app/accesorios/page.tsx` | Listing global de accesorios |
| `/accesorios/[categorySlug]` | `app/accesorios/[categorySlug]/page.tsx` | Categoría concreta de accesorios |
| `/producto/[slug]` | `app/producto/[slug]/page.tsx` | PDP |
| `/carrito` | `app/carrito/page.tsx` | Carrito visual/local |

### Auth y admin

| Ruta | Archivo | Propósito |
| --- | --- | --- |
| `/login` | `app/login/page.tsx` | Login SSR para cuentas internas |
| `/admin` | `app/admin/page.tsx` | Shell inicial del panel |
| `/admin/productos` | `app/admin/productos/page.tsx` | Listado CRUD V1 |
| `/admin/productos/nuevo` | `app/admin/productos/nuevo/page.tsx` | Alta de producto |
| `/admin/productos/[id]` | `app/admin/productos/[id]/page.tsx` | Edición + media uploader |

## Archivos raíz importantes

| Archivo | Para qué sirve | Importancia |
| --- | --- | --- |
| `package.json` | Dependencias y scripts operativos | Alta |
| `next.config.ts` | Config de Next e imágenes remotas de Supabase | Alta |
| `middleware.ts` | Hook global SSR para refresco de sesión | Alta |
| `tsconfig.json` | Config TypeScript | Alta |
| `tailwind.config.ts` | Config de utilidades y diseño | Media |
| `postcss.config.mjs` | Pipeline CSS/Tailwind | Media |
| `.env.local.example` | Plantilla de variables de entorno | Alta |
| `.gitignore` | Exclusión de archivos locales/generados | Alta |

## Guía por carpetas y archivos

### `app/`

| Archivo | Rol | Importancia |
| --- | --- | --- |
| `app/layout.tsx` | Root layout, monta `CartProvider` y `AppShell` | Alta |
| `app/globals.css` | Estilos globales | Alta |
| `app/page.tsx` | Home | Alta |
| `app/catalogo/page.tsx` | Listing general | Alta |
| `app/catalogo/loading.tsx` | Skeleton del catálogo | Media |
| `app/preventa/page.tsx` | Página de preventa | Alta |
| `app/preventa/loading.tsx` | Loading de preventa | Baja |
| `app/marca/[brandSlug]/page.tsx` | Listing por marca | Alta |
| `app/marca/[brandSlug]/loading.tsx` | Loading por marca | Baja |
| `app/marca/[brandSlug]/[categorySlug]/page.tsx` | Listing por marca/categoría | Alta |
| `app/marca/[brandSlug]/[categorySlug]/loading.tsx` | Loading de marca/categoría | Baja |
| `app/accesorios/page.tsx` | Listing general de accesorios | Alta |
| `app/accesorios/loading.tsx` | Loading de accesorios | Baja |
| `app/accesorios/[categorySlug]/page.tsx` | Listing por categoría de accesorios | Alta |
| `app/accesorios/[categorySlug]/loading.tsx` | Loading por categoría de accesorios | Baja |
| `app/producto/[slug]/page.tsx` | PDP | Alta |
| `app/producto/[slug]/loading.tsx` | Skeleton PDP | Media |
| `app/producto/[slug]/not-found.tsx` | Estado 404 del PDP | Media |
| `app/carrito/page.tsx` | Pantalla del carrito | Alta |
| `app/login/page.tsx` | Pantalla de login | Alta |
| `app/login/actions.ts` | Server actions de login/logout | Alta |
| `app/admin/layout.tsx` | Guard admin y shell protegido | Muy alta |
| `app/admin/page.tsx` | Dashboard placeholder admin | Media |
| `app/admin/productos/page.tsx` | Listado CRUD V1 de productos | Muy alta |
| `app/admin/productos/nuevo/page.tsx` | Alta de producto | Muy alta |
| `app/admin/productos/[id]/page.tsx` | Edición y media uploader | Muy alta |
| `app/admin/productos/actions.ts` | Server actions CRUD de productos | Muy alta |
| `app/admin/productos/media/actions.ts` | Server actions uploader V1 | Muy alta |

### `components/admin/`

| Archivo | Rol | Importancia |
| --- | --- | --- |
| `components/admin/admin-shell.tsx` | Layout visual del panel | Alta |
| `components/admin/admin-sidebar.tsx` | Navegación lateral admin | Media |
| `components/admin/products-table.tsx` | Tabla/lista del CRUD V1 | Alta |
| `components/admin/product-form.tsx` | Formulario reusable de producto | Muy alta |
| `components/admin/product-status-badge.tsx` | Badges de estado/stock | Media |
| `components/admin/product-media-uploader.tsx` | UI de subida de portada/galería | Muy alta |

### `components/store/`

| Archivo | Rol | Importancia |
| --- | --- | --- |
| `components/store/store-shell.tsx` | Shell principal del storefront | Alta |
| `components/store/header.tsx` | Cabecera global | Alta |
| `components/store/footer.tsx` | Pie del sitio | Media |
| `components/store/hero-banner.tsx` | Hero principal | Media |
| `components/store/listing-page.tsx` | Composición de listings | Alta |
| `components/store/listing-skeleton.tsx` | Skeleton de listings | Media |
| `components/store/filter-sidebar.tsx` | Filtros del listing | Alta |
| `components/store/sort-bar.tsx` | Ordenación | Media |
| `components/store/product-grid.tsx` | Grid de productos | Alta |
| `components/store/product-card-sealed.tsx` | Tarjeta visual para sellado | Alta |
| `components/store/product-card-single.tsx` | Tarjeta visual para singles | Alta |
| `components/store/product-gallery.tsx` | Galería del PDP | Alta |
| `components/store/product-info.tsx` | Info y CTA del PDP | Alta |
| `components/store/related-products.tsx` | Productos relacionados | Media |
| `components/store/cart-provider.tsx` | Estado cliente del carrito en `localStorage` | Muy alta |
| `components/store/cart-page-client.tsx` | UI del carrito | Alta |
| `components/store/store-media-image.tsx` | Wrapper con fallback para media remota | Alta |
| `components/store/breadcrumbs.tsx` | Breadcrumbs | Media |
| `components/store/search-bar.tsx` | Buscador global | Media |
| `components/store/mega-menu.tsx` | Menú grande de navegación | Media |
| `components/store/benefit-strip.tsx` | Franja de beneficios | Baja |
| `components/store/category-pill.tsx` | Píldoras de categoría | Baja |
| `components/store/brand-card.tsx` | Tarjetas de marca | Media |
| `components/store/brand-glyph.tsx` | Glyph/logo de marca | Media |
| `components/store/promo-banner.tsx` | Banner promocional | Baja |
| `components/store/site-logo.tsx` | Logo del sitio | Media |
| `components/store/empty-state.tsx` | Estados vacíos | Media |
| `components/store/product-detail-skeleton.tsx` | Skeleton PDP | Media |
| `components/store/product-not-found-state.tsx` | Estado 404 visual | Baja |
| `components/store/section-heading.tsx` | Heading reusable | Baja |

### `components/ui/`

| Archivo | Rol | Importancia |
| --- | --- | --- |
| `components/ui/button.tsx` | Botón base | Alta |
| `components/ui/input.tsx` | Input base | Alta |
| `components/ui/badge.tsx` | Badge base | Media |
| `components/ui/separator.tsx` | Separador base | Baja |
| `components/ui/sheet.tsx` | Drawer/sheet base | Media |

### `lib/`

| Archivo | Rol | Importancia |
| --- | --- | --- |
| `lib/env.ts` | Validación y estado del entorno | Muy alta |
| `lib/utils.ts` | Helpers genéricos de utilidad | Media |
| `lib/catalog.ts` | Helpers de colección/filtros sobre dominio | Alta |
| `lib/repositories/store-repository.ts` | Repositorio principal del storefront | Muy alta |
| `lib/auth/admin.ts` | Auth SSR y guard de roles admin/staff | Muy alta |
| `lib/admin/products.ts` | Data layer del CRUD admin | Muy alta |
| `lib/admin/product-media.ts` | Data layer del uploader V1 | Muy alta |
| `lib/supabase/client.ts` | Cliente público/storefront y fallback | Alta |
| `lib/supabase/browser.ts` | Cliente browser SSR-safe | Alta |
| `lib/supabase/server.ts` | Cliente server SSR con cookies | Muy alta |
| `lib/supabase/middleware.ts` | Refresh de sesión en middleware | Alta |
| `lib/supabase/config.ts` | Resolución de env pública de Supabase | Alta |
| `lib/supabase/storage.ts` | Helpers de bucket/path/URL pública | Muy alta |
| `lib/supabase/database.types.ts` | Tipado de BD | Muy alta |
| `lib/adapters/cart-adapter.ts` | Adaptación del carrito almacenado | Alta |
| `lib/adapters/collection-adapter.ts` | Adaptadores de colección | Media |
| `lib/adapters/product-adapter.ts` | Adaptación dominio/mock | Media |
| `lib/adapters/supabase-product-adapter.ts` | Adaptación de producto desde Supabase | Muy alta |
| `lib/adapters/index.ts` | Barrel de adapters | Baja |
| `lib/routes/collection-input.ts` | Entrada tipada de query params | Media |
| `lib/routes/query-params.ts` | Parseo y normalización de search params | Alta |
| `lib/routes/slugs.ts` | Convenciones de slugs | Media |
| `lib/routes/store-routes.ts` | Helpers de generación de rutas | Media |
| `lib/validators/admin-product.ts` | Schema Zod del CRUD admin | Muy alta |
| `lib/validators/catalog-import.ts` | Schema Zod del catálogo de import | Muy alta |
| `lib/validators/contracts.ts` | Validación de contratos UI | Alta |

### `data/`

| Archivo | Rol | Importancia |
| --- | --- | --- |
| `data/products.ts` | Mock products/fallback | Alta |
| `data/brands.ts` | Metadatos de marcas | Alta |
| `data/brand-media.ts` | Media decorativa por marca | Media |
| `data/brand-palettes.ts` | Paletas visuales por marca | Media |
| `data/banners.ts` | Datos de banners | Baja |
| `data/site.ts` | Config general del sitio | Media |

### `scripts/`

| Archivo | Rol | Importancia |
| --- | --- | --- |
| `scripts/import-catalog.ts` | Importa categorías, productos, inventario y galería a BD | Muy alta |
| `scripts/upload-product-media.ts` | Sube cover y galería a Storage | Muy alta |

### `supabase/`

| Archivo | Rol | Importancia |
| --- | --- | --- |
| `supabase/migrations/0001_initial_catalog.sql` | Esquema inicial de catálogo + storage bucket | Muy alta |
| `supabase/migrations/0002_auth_profiles.sql` | `profiles`, roles y RLS de auth/admin | Muy alta |
| `supabase/seeds/0001_initial_catalog.sql` | Seed inicial del catálogo | Alta |

### `types/`

| Archivo | Rol | Importancia |
| --- | --- | --- |
| `types/store.ts` | Tipos de dominio del storefront | Alta |
| `types/contracts.ts` | Tipos consumidos por UI y adapters | Alta |

### `public/`

| Ruta | Rol | Importancia |
| --- | --- | --- |
| `public/brands/` | Assets de marca reales del storefront | Alta |
| `public/mock/` | Fallbacks visuales y mocks de banners/productos | Alta |

## Base de datos actual

Tablas principales:

- `categories`
- `products`
- `product_images`
- `inventory`
- `profiles`

Decisiones importantes:

- `products.main_image_path` es la portada canónica.
- `product_images` guarda la galería adicional.
- `inventory` está separado para stock.
- `profiles.role` es la fuente de verdad para autorización V1.

## Autenticación y roles

Roles V1:

- `admin`
- `staff`
- `customer`

Reglas:

- `/admin` exige sesión.
- `customer` no entra al panel.
- La protección server-side vive en `lib/auth/admin.ts`.

## Operativa de catálogo y media

### Orden recomendado

1. preparar `catalog/catalog.json`
2. preparar media local
3. subir media
4. importar catálogo

### Comandos

```bash
npm run catalog:media:upload
npm run catalog:media:upload:overwrite
npm run catalog:import
```

## Carrito actual

El carrito actual:

- vive en `localStorage`
- usa `components/store/cart-provider.tsx`
- está pensado como V1 visual
- todavía no crea pedidos ni checkout real

## Decisiones de diseño del proyecto

- No se usa NextAuth.
- Se usa Supabase Auth con cookies SSR.
- El storefront no depende visualmente del admin.
- El admin muta datos mediante server actions.
- La media se resuelve desde Storage y cae a fallback visual si una URL remota falla.

## Checklist de arranque

1. Copiar `.env.local.example` a `.env.local`
2. Rellenar variables de Supabase
3. Ejecutar migraciones SQL en Supabase
4. Crear usuario interno
5. Promoverlo a `admin` o `staff` en `profiles`
6. Lanzar `npm run dev`
7. Probar `/login`, `/admin`, `/catalogo`, `/producto/[slug]`

## Checklist de validación

```bash
npx tsc --noEmit
npm run build
```

## Siguientes fases naturales

- checkout real
- pedidos
- Stripe
- emails transaccionales
- backoffice de pedidos
- clientes
