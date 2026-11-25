# Catalog

Source of truth for products. `npm run catalog:sync` pushes it to Shopify;
`npm run catalog:lint` reports what the live store is still missing.

```
catalog/
  products.csv          one row per product (committed)
  alt.csv               alt text, one row per photo (committed)
  images/<handle>/      photos, 01.jpg 02.jpg … (gitignored, stays on this machine)
```

## products.csv

| column | required | notes |
|---|---|---|
| `handle` | yes | URL slug: `lowercase-words-with-dashes`. Never change it after launch. Must not match an old archived seed/test product — the sync refuses those (see below). |
| `title` | yes | |
| `description` | yes | Plain text. A blank line starts a new paragraph. Quote it if it has commas or line breaks. |
| `price` | yes | e.g. `65` or `65.00`. Every size shares it. |
| `weight_oz` | yes | Packed shipping weight in ounces (box + padding). Checkout shipping rates use it. |
| `inventory` | yes* | Stock when the product/size is **first created**. One number for all sizes or one per size: `2\|1\|0`. *Blank = 1 for `one_of_one`. Later re-runs never change stock (sales do). |
| `sizes` | no | `S\|M\|L`. Blank = no size picker. |
| `collections` | no | Collection handles: `tie-dye\|leather`. Must already exist in Shopify. |
| `entry_no` | no | Journal number, whole number, unique across the catalog. |
| `maker`, `gathered`, `technique` | no | Shown on the product page. |
| `edition` | yes | `one_of_one` or `small_run`. |
| `vendor` | no | Defaults to `Wildenflower`. |

Example row:

```csv
handle,title,description,price,weight_oz,inventory,sizes,collections,entry_no,maker,gathered,technique,edition,vendor
spiral-hoodie,Spiral Hoodie,"Hand-dyed spiral hoodie.

Heavyweight organic cotton.",65,18.5,2|1|0,S|M|L,tie-dye,12,James,"June 2026, Alexandria KY",Spiral fold,small_run,
```

## alt.csv + images

At least **3 photos** per product, every one with alt text (describe what's in
the photo for someone who can't see it). The first photo by file name is the
main one.

```csv
handle,file,alt
spiral-hoodie,01.jpg,"Spiral hoodie, front, rainbow swirl centered on the chest"
spiral-hoodie,02.jpg,Back of the spiral hoodie
spiral-hoodie,03.jpg,Close-up of the dye bleeding between folds
```

## Running it

```sh
set -a; . ~/.config/wildenflower-admin.env; set +a
npm run catalog:sync                                   # dry run: shows what would change
npm run catalog:sync -- --only spiral-hoodie           # just one product
npm run catalog:sync -- --apply --confirm-store <store>.myshopify.com
npm run catalog:sync -- --apply --activate --confirm-store <store>.myshopify.com
```

- Dry run is the default and only reads the store.
- New products are created as **DRAFT** unless `--activate`.
- Safe to re-run: unchanged products are skipped, photos are matched by content
  (renaming a file does not re-upload it).
- It **never deletes**. Removing a size, collection or photo from the CSV/folder
  leaves it on Shopify and the dry run says so — remove it in Shopify admin.
- Products in Shopify but not in the CSV are left alone.

## Handles already taken by old archived products

The store still holds archived seed/test products (`spiral-tie-dye-hoodie`,
`rainbow-swirl-tee`, `ceramic-vase`, …). If a CSV handle matches one of them,
the sync **refuses** that row instead of quietly updating the old product (which
would keep its fake photos, old sizes and collections). Pick a different handle,
or — only if you really want to reuse that old product — add
`--adopt <handle>` (comma-separate several).
