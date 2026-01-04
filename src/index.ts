import { serve } from "bun";
import index from "./index.html";

const robotsTxt = Bun.file("./public/robots.txt");
const sitemapXml = Bun.file("./public/sitemap.xml");

const server = serve({
  port: 3001,
  routes: {
    // SEO files
    "/robots.txt": {
      async GET() {
        return new Response(robotsTxt, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
        });
      },
    },

    "/sitemap.xml": {
      async GET() {
        return new Response(sitemapXml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
          },
        });
      },
    },

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async (req) => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },

    // Serve index.html for all unmatched routes.
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
