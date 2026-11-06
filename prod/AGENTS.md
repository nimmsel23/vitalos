# VitalOS product directory

`prod/` is tracked by the parent VitalOS meta-repository. It has no own `.git`,
`.gitmodules`, app checkouts, workspace definition or lockfile. Shared apps live
in the parent directory; source edits belong in their owning Dev repositories.
Product-shell work belongs here on `dev`; commit working stages with matching docs.
Firebase target is exclusively `vitalos-prod`; use only product build commands.
Never track `.product-config`, environment files, signing material or credentials.
Do not run inherited private deploy commands for this product.
See `docs/UNIFIED-PRODUCT.md` and `docs/MIGRATION-SOURCE.json`.
