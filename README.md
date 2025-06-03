![Shadcn Registry](./public/og-image.png)

A Cloudflare Worker service that acts as a registry for shadcn/ui components, tracking component usage statistics in real time.

## Features

- **Serves Static Component JSON Files:** Component files are stored in the `public/static` folder.
- **Real-time Usage Tracking:** Download counts are incremented and stored using Cloudflare KV.
- **Simple API Endpoints:** Easily retrieve components and their usage statistics.
- **Built on Hono:** Uses the lightweight [`Hono`](https://github.com/honojs/hono) framework for routing.

## API Endpoints

### GET `/r/:objectName`

- **Description:** Retrieves a component JSON file from the static registry and increments its download count.
- **Usage:** Make a GET request replacing `:objectName` with the JSON filename (e.g., `button.json`).

### GET `/s/:objectName`

- **Description:** Returns the statistics for a specific component including:
  - Component name
  - JSON filename
  - Total download count

## Development

1. **Clone the Repository**
   ```sh
   git clone https://github.com/R4ULtv/shadcn-registry.git
   ```
2. **Install Dependencies:**
   ```sh
   pnpm install
   ```
3. **Configure KV Namespace ID:**
   Update your KV namespace ID in `wrangler.jsonc`.
   ```jsonc
   "kv_namespaces": [
    {
      "binding": "KV",
      "id": "your-kv-namespace-id"
    }
   ]
   ```
4. **Add Component JSON Files:**
   Place your component JSON files in the `public/static` folder. These files will be served by the registry and tracked for usage statistics.
5. **Run Locally:**
   ```sh
   pnpm run dev
   ```
6. **Deploy:**
   ```sh
   pnpm run deploy
   ```

## Build Script

For the best implementation, you can add the following script to your main project's `package.json` to output the build in the `public/static` folder. This is just a suggestion - feel free to implement it however you prefer.

```json
"scripts": {
  "registry:build": "shadcn build --output public/static"
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
