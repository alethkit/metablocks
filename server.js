import { file } from "bun";

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/") {
      return new Response(await file("./src/index.html").text(), {
        headers: { "Content-Type": "text/html" },
      });
    }

    if (url.pathname === "/index.js") {
      return new Response(await file("./build/index.js").arrayBuffer(), {
        headers: { "Content-Type": "application/javascript" },
      });
    }

    if (url.pathname === "/index.js.map") {
      return new Response(await file("./build/index.js.map").arrayBuffer(), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(Bun.file(new URL(req.url).pathname.slice(1)));
  },
  error() {
    return new Response("Page not found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);
