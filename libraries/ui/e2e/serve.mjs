/*
 * Fixture server for the browser tests.
 *
 * Builds the fixture pages with esbuild, twice: once for Node, to render each
 * fixture to HTML on the server, and once for the browser, to hydrate it. A
 * page is therefore what a real server-rendered site sends: the markup arrives
 * first, and the components take over after hydration. That is what lets a
 * test switch JavaScript off and see the server HTML alone.
 *
 * Usage: node e2e/serve.mjs   (PORT defaults to 4317)
 * Playwright starts it through `webServer` in playwright.config.ts.
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as esbuild from "esbuild";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const out = join(here, ".out");
const port = Number(process.env.PORT ?? 4317);

const shared = {
  bundle: true,
  format: "esm",
  jsx: "automatic",
  logLevel: "warning",
  absWorkingDir: root,
};

// Development React on both sides, so hydration mismatches and other React
// warnings reach the console, where the tests read them.
await esbuild.build({
  ...shared,
  entryPoints: [join(here, "harness/client.tsx")],
  platform: "browser",
  outfile: join(out, "client.js"),
  define: { "process.env.NODE_ENV": '"development"' },
  sourcemap: "inline",
});
await esbuild.build({
  ...shared,
  entryPoints: [join(here, "harness/server.tsx")],
  platform: "node",
  packages: "external",
  outfile: join(out, "server.mjs"),
});

const { render, fixtureNames } = await import(pathToFileURL(join(out, "server.mjs")).href);
const client = await readFile(join(out, "client.js"));
const tokens = await readFile(join(root, "src/tokens/tokens.css"));

const baseCss = `
  html { color-scheme: light dark; }
  body {
    margin: 0;
    background: var(--cu-color-bg);
    color: var(--cu-color-text);
    font: var(--cu-text-base)/var(--cu-leading) var(--cu-font-sans);
  }
  main { padding: var(--cu-space-4); }
  a { color: var(--cu-color-accent); }
`;

function page(name, html) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${name} fixture</title>
<link rel="stylesheet" href="/tokens.css">
<style>${baseCss}</style>
</head>
<body data-fixture="${name}">
<div id="root">${html}</div>
<script type="module" src="/client.js"></script>
</body>
</html>`;
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${port}`);
  const path = url.pathname;
  if (path === "/client.js") {
    res.writeHead(200, { "content-type": "text/javascript; charset=utf-8" });
    res.end(client);
    return;
  }
  if (path === "/tokens.css") {
    res.writeHead(200, { "content-type": "text/css; charset=utf-8" });
    res.end(tokens);
    return;
  }
  if (path === "/") {
    const links = fixtureNames.map((n) => `<li><a href="/${n}">${n}</a></li>`).join("");
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(page("index", `<main><h1>Fixtures</h1><ul>${links}</ul></main>`));
    return;
  }
  const name = path.slice(1);
  if (fixtureNames.includes(name)) {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(page(name, render(name)));
    return;
  }
  res.writeHead(404, { "content-type": "text/plain" });
  res.end("not found");
});

server.listen(port, "127.0.0.1", () => {
  console.log(`fixtures on http://127.0.0.1:${port}/`);
});
