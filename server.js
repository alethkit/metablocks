const { file } = require('bun');

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === '/') {
      return new Response(await file('./src/index.html').text(), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    if (url.pathname === '/index.js') {
      return new Response(await file('./build/index.js').arrayBuffer(), {
        headers: { 'Content-Type': 'application/javascript' },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);
