# Enable OpenAI responses

LaunchKit uses the OpenAI Responses API. The default model is `gpt-5-mini`; change `OPENAI_MODEL` to another model supporting Responses and Structured Outputs if needed.

## Default: free local mock mode

`VITE_USE_MOCK_AI` defaults to true when unset. Mock mode works without a key and makes no OpenAI requests. The backend also rejects live generation while mock mode is enabled. No credentials are included in this repository.

## When you are ready

1. Create an API key in your [OpenAI project](https://platform.openai.com/api-keys) and configure [API billing](https://platform.openai.com/settings/organization/billing/overview). API usage is billed through the API account.
2. Use Node.js 22 or newer. In the repository root, copy `.env.example` to `.env` if you do not already have a `.env` file.
3. Edit `.env` locally:

   ```dotenv
   VITE_USE_MOCK_AI=false
   OPENAI_API_KEY=your-key-goes-here
   OPENAI_MODEL=gpt-5-mini
   OPENAI_IMAGE_MODEL=gpt-image-2
   ```

   Keep the key server-side. Never prefix it with `VITE_`, paste it into application source, or commit `.env`.
4. Run:

   ```sh
   npm ci
   npm run build
   npm run server
   ```

5. Open `http://127.0.0.1:3000`, fill in the business form, and generate a strategy. Generating and regenerating in live mode makes paid API requests. Regeneration requests only the selected section. The Visuals tab creates images only when you click a Generate or Regenerate button; each click makes one additional paid image request.

For development, run `npm run server` in one terminal and `npm run dev` in another. Vite proxies `/api` to the backend on port 3000. `npm run preview` alone does not provide the API backend.

Vite embeds `VITE_USE_MOCK_AI` at build time. After changing it, restart both processes and rebuild production assets. To return to free mock mode, set it to `true`, rebuild, and restart the server.

## Errors and limits

Missing keys, invalid keys, usage/rate limits, invalid responses, and timeouts produce visible errors. Live failures do not silently fall back to mock data. Requests have a two-minute backend timeout and a 16,000 output-token ceiling; incomplete output is rejected. The API returns only validated strategy data, not raw provider error details.

Strategies use the submitted business details, without browsing websites. Scores are estimates, and unverified claims should be reviewed before use.

The server binds to localhost by default. This setup is for local use; add user authentication and per-user usage controls before exposing the paid generation route publicly. No deployment is configured by this change.

## Checks

`npm test` covers the provider contract and both frontend modes using simulated HTTP responses. It makes no paid API calls. `npm run build` checks TypeScript and builds the app. A real account/key smoke test remains necessary when you activate billing.

References: [Responses API](https://developers.openai.com/api/reference/typescript/resources/responses/methods/create), [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [GPT-5 mini](https://developers.openai.com/api/docs/models/gpt-5-mini), [Image generation](https://developers.openai.com/api/docs/guides/image-generation).
