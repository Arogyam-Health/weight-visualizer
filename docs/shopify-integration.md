# Future Shopify integration

This phase intentionally does not add Liquid or theme code. The later integration should load a small JavaScript module or app block on the product page and call the deployed Next.js API over HTTPS. The backend should allow only configured storefront origins through `ALLOWED_STOREFRONT_ORIGINS` and use a server-verifiable session/token exchange for Shopify customer identity. Shopify must never send a trusted plain-text `userId`.

The module will poll the authenticated job endpoint and render the result in the product-page component. There will be no public result page. Supabase service-role credentials, Cloudinary secrets, and storage signing secrets remain server-only.
