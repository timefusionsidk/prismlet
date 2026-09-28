# Prismlet — in-browser AI image generator
Runtime: Transformers.js (`@huggingface/transformers`) on WebGPU, in a Web Worker (`worker.ts`).
Model: `onnx-community/Janus-Pro-1B-ONNX` (ONNX port of `deepseek-ai/Janus-Pro-1B`), fixed 384×384, no seed/size controls.
**Licence — verify before launch:** the ONNX repo is tagged MIT on Hugging Face, but DeepSeek states code is MIT while *model use is subject to the DeepSeek Model/License Agreement* (royalty-free, commercial use allowed, use-based restrictions in Attachment A must be passed to users — see Terms). Read the current text: https://github.com/deepseek-ai/Janus/blob/main/LICENSE-MODEL
Weights: fetched by the visitor's browser directly from huggingface.co (CORS-enabled), cached by Transformers.js in the Cache API. Size ≈ 1–2 GB (confirm from the live progress bar; unverified). Hugging Face bandwidth/rate limits apply; to self-host, set `env.remoteHost` in the worker and serve with CORS.
Setup: `npm i && npm run dev`; `npm run build`; deploy as a Vite project on Vercel (the build output is `dist`). `vercel.json` includes the SPA fallback required for direct visits to `/privacy`, `/terms`, and `/contact`.

Ads are disabled unless both `VITE_ADSENSE_PUBLISHER` and `VITE_ADSENSE_SLOT` are configured. Before enabling ads, replace the publisher ID in `public/ads.txt` and update the production URL in `index.html`, `public/robots.txt`, and `public/sitemap.xml` if you connect a custom domain.
