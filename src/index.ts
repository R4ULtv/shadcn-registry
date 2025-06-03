import { Hono } from "hono";

interface Bindings {
  KV: KVNamespace;
  REGISTRY: Fetcher;
}

const app = new Hono<{ Bindings: Bindings }>();

const updateDB = async (kv: KVNamespace, objectName: string) => {
  const counterKey = objectName.replace(".json", "");
  const newCount = (Number(await kv.get(counterKey)) ?? 0) + 1;
  await kv.put(counterKey, newCount.toString());
};

app.get("/r/:objectName", async (c) => {
  const objectName = c.req.param("objectName");

  if (!objectName) {
    return c.json({ error: "Missing object name" }, 400);
  }

  try {
    const registryUrl = `${new URL(c.req.url).origin}/static/${objectName}`;
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

app.get("/s/:objectName", async (c) => {
  const objectName = c.req.param("objectName");

  if (!objectName) {
    return c.json({ error: "Missing object name" }, 400);
  }
  const counterKey = objectName.replace(".json", "");

  const counter = await c.env.KV.get(counterKey);

  if (counter === null) {
    return c.json({ error: "Object not found" }, 404);
  }

  return c.json({
    key: counterKey,
    file: counterKey + ".json",
    count: Number(counter),
  });
});

export default app;
