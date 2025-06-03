A Cloudflare Worker service that acts as a registry for shadcn/ui components, tracking component usage statistics.

## Features

- Serves component JSON files from a static registry
- Tracks component download counts using Cloudflare KV
- Provides download statistics via API endpoints

## API Endpoints

### GET /r/:objectName
Retrieves a component JSON file and increments its download count.

### GET /s/:objectName 
Gets statistics for a specific component including:
- Component name
- JSON filename
- Download count

## Development

1. Clone the repository
2. Install dependencies with `npm install`
3. Configure your KV namespace ID in `wrangler.jsonc`
4. Run locally with `npm run dev`
5. Deploy with `npm run deploy`

## Build Script

For the best implementation, you can add the following script to your main project's `package.json` to output the build in the `public/static` folder. This is just a suggestion - feel free to implement it however you prefer.

```json
"scripts": {
  "registry:build": "shadcn build --output public/static"
}
```

## License

MIT