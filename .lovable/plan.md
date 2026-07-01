## Product Variations System

Extend the existing product management (not rebuild) to support unlimited variations per product with per-variation pricing, images, SKU, stock, dimensions, weight, and delivery time.

### Database (migration)

Three new tables in `public`, all with GRANT + RLS + admin-write / public-read policies matching existing `products`:

**`variation_types`** — global catalog of attribute types
- `name` (text, unique) e.g. "Size", "Wood Finish", "Color"
- `slug` (text, unique)
- `display_order` (int)

Seeded with the 10 default types from the request.

**`variation_values`** — allowed values per type (reusable across products)
- `variation_type_id` → variation_types
- `value` (text) e.g. "6 Seater", "Walnut"
- `slug`, `display_order`
- `swatch_hex` (nullable, for color swatches)
- unique(variation_type_id, slug)

**`product_variations`** — the actual purchasable variant of a product
- `product_id` → products (cascade)
- `sku` (text, unique)
- `price` (int, KES)
- `original_price` (int, nullable)
- `stock_status` ('in_stock' | 'out_of_stock' | 'made_to_order' | 'low_stock')
- `delivery_days` (int, nullable) — e.g. 2 or 14
- `weight_kg` (numeric, nullable)
- `dimensions` (jsonb: `{length,width,height,unit}`)
- `description` (text, nullable — overrides product description when set)
- `image_urls` (text[])
- `attributes` (jsonb: `{ "Size": "6 Seater", "Wood Finish": "Walnut", ... }`) — flat map for fast lookup and unique combo enforcement
- `is_default` (bool) — one per product, used as initial selection
- `display_order` (int)
- unique(product_id, sku)

Attribute-combo uniqueness enforced with a partial unique index on `(product_id, attributes)`.

Indexes on `product_id`, `sku`, and GIN on `attributes` for scale (1000+ products).

Policies mirror existing tables: public SELECT, admin (via `is_admin()`) INSERT/UPDATE/DELETE. Cart items reference variation id when present (nothing to migrate in DB — cart is client state).

### Backend queries (`src/lib/db.ts`)

Add:
- `fetchVariationTypes()`, `fetchVariationValues(typeId?)`
- `fetchProductVariations(productId)`
- Admin mutations via existing `supabase` client (RLS handles auth).

Types exported for reuse.

### Admin dashboard

**New route** `src/routes/admin.variations.tsx` — manages variation types + values catalog (create/edit/delete/reorder, add values, set swatch colors for Color type).

**Extend** `src/routes/admin.products.tsx` product editor modal:
- New "Variations" tab in the modal
- Table of existing variations with columns: attributes summary, SKU, price, stock, delivery, actions (edit, duplicate, delete)
- "Add Variation" opens a sub-form with:
  - Multi-select attribute pickers (choose type → value from catalog; can add new value inline)
  - SKU, price, original price, stock_status, delivery_days, weight_kg, dimensions, description override, image URLs (comma-separated, same pattern as product images), is_default toggle
- **Bulk edit**: checkbox rows + toolbar to apply price delta, stock_status, or delivery_days to selected variations
- **Duplicate**: clones variation with suffix on SKU

Add link to admin sidebar for the new Variations catalog route (with `noindex` meta like other admin pages).

### Frontend product page (`src/routes/shop.$slug.tsx`)

- Loader also fetches variations for the product (parallel to product fetch).
- If variations exist:
  - Render an attribute selector per variation type present, showing available values as buttons/swatches (Color renders swatches from `swatch_hex`).
  - Track selected attributes in state; resolve to a matching variation.
  - Unavailable combos are disabled (grayed out) based on which variations exist.
  - Display switches with a smooth fade transition (Tailwind `transition-opacity duration-300` on image + price block) to update:
    - Main image + thumbnail gallery
    - Price (and original_price strikethrough)
    - SKU (shown below price)
    - Availability badge (adds "Low Stock" variant style)
    - Delivery estimate line ("Ships in 2 days" / "Made to order — 14 days")
    - Description (variation description overrides product description when set)
  - Add-to-cart and WhatsApp enquiry use the selected variation's price, image, SKU, and name suffix (e.g. "Dining Table — 6 Seater, Walnut").
- If no variations exist, page behavior is unchanged.

**Cart** (`src/lib/cart.tsx`): extend cart item shape with optional `variationId`, `variationLabel`, and use variation price/image. Backwards-compatible with existing items.

### SEO — structured data

In `shop.$slug.tsx` `head()`, when variations exist emit `ProductGroup` schema with `hasVariant` array of `Product` entries (name, sku, image, offers with price/availability/priceCurrency KES) instead of the single Product schema. Falls back to current single-Product schema otherwise.

### Scale considerations

- GIN index on `attributes` jsonb for combo lookups.
- Variations fetched only on product detail page, not in list queries.
- Value catalog reused across products (no duplication).
- Client resolves selection in memory from the small per-product variation list (typically < 50).

### Files to create
- `src/routes/admin.variations.tsx`
- Migration for the 3 tables + seed data + policies

### Files to edit
- `src/lib/db.ts` — types + fetchers
- `src/lib/cart.tsx` — variation-aware cart items
- `src/routes/admin.products.tsx` — variations tab in editor
- `src/routes/admin.tsx` — nav link to variations catalog
- `src/routes/shop.$slug.tsx` — selector UI, dynamic updates, ProductGroup schema
- `src/components/ProductCard.tsx` — show "from KSh X" when variations exist (min price)

### Out of scope (flag for follow-up)
- Image upload UI (keeping current comma-separated URL pattern to match existing admin).
- Per-variation inventory counts beyond the four stock states.

Ready to implement — shall I proceed?