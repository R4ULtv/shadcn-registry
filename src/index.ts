import { Hono } from "hono";
import { cors } from "hono/cors"; // Remove if you no longer need CORS (Cross-Origin Resource Sharing) support.
import { cache } from "hono/cache"; // Remove or adjust 'max-age' if you want statistics to update more frequently.

interface Bindings {
  KV: KVNamespace;
  REGISTRY: Fetcher;
}

const REGISTRY_BASE_PATH = "/static/";

const getKeyFromName = (objectName: string): string => {
  return objectName.replace(/\.json$/i, "");
};

const updateDB = async (kv: KVNamespace, objectName: string) => {
  const counterKey = getKeyFromName(objectName);
  const newCount = (Number(await kv.get(counterKey)) ?? 0) + 1;
  await kv.put(counterKey, newCount.toString());
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS middleware is enabled for all routes (*).
// Remove this line if cross-origin access is not required.
app.use("*", cors());

app.get("/r/:objectName", async (c) => {
  const objectName = c.req.param("objectName");

  if (!objectName) {
    return c.json({ error: "Missing object name" }, 400);
  }

  if (!objectName.endsWith(".json")) {
    return c.json({ error: "Object name must end with .json" }, 400);
  }

  try {
    const registryUrl = `${new URL(c.req.url).origin}${REGISTRY_BASE_PATH}${objectName}`;
    const objectResponse = await c.env.REGISTRY.fetch(registryUrl);

    if (!objectResponse.ok) {
      return c.json({ error: "Object not found" }, 404);
    }

    c.executionCtx.waitUntil(updateDB(c.env.KV, objectName));

    return objectResponse;
  } catch (error) {
    console.error("Error retrieving object:", error);
    return c.json({ error: "Error processing request" }, 500);
  }
});

app.get(
  "/s/:objectName",
  cache({
    cacheName: "registry-stats",
    cacheControl: "max-age=600", // Cache for 10 min
  }),
  async (c) => {
    const objectName = c.req.param("objectName");

    if (!objectName) {
      return c.json({ error: "Missing object name" }, 400);
    }
    const counterKey = getKeyFromName(objectName);

    try {
      const counter = await c.env.KV.get(counterKey);

      if (counter === null) {
        return c.json({ error: "Object not found" }, 404);
      }

      return c.json({
        objectKey: counterKey,
        fileName: `${counterKey}.json`,
        downloads: Number(counter),
      });
    } catch (error) {
      console.error("Error retrieving object:", error);
      return c.json({ error: "Error processing request" }, 500);
    }
  },
);

export default app;
