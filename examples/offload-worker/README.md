# Highlight code in a Web Worker

From the repository root, install dependencies, build the workspace packages used by this example, and start Vite.

```sh
pnpm install
pnpm exec turbo run build --filter='example-offload-worker^...'
pnpm --filter example-offload-worker dev
```

Open the URL printed by Vite and click **Highlight**. The page sends TypeScript source to the worker and renders the HTML returned by Shiki.

- Vite recognizes `new Worker(new URL('./shiki-worker.mts', import.meta.url), { type: 'module' })` and bundles the worker as a separate entry.
- The worker creates one highlighter promise and reuses it, including when several requests arrive during initialization. It loads only the TypeScript grammar and the GitHub Dark theme. The JavaScript engine keeps WebAssembly out of this bundle. Choose Oniguruma if you need its broader grammar compatibility.
- The page assigns each request an ID. The worker echoes the ID with its HTML or error, so the page can settle the corresponding promise and remove it from the pending map.
- The example's `tsconfig.json` includes TypeScript's `WebWorker` library, so the worker can type `self` as `DedicatedWorkerGlobalScope`. Run `pnpm --filter example-offload-worker typecheck` to check the example.

In Node.js, use `node:worker_threads` and `parentPort` to send and receive messages with the same request/response pattern.
