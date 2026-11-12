# StudySphere

**Study together, even when apart.** StudySphere is a static, speculative-design prototype for a usability engineering course. It imagines a future pandemic in which students cannot meet in person, and explores how a warm shared study space could make working alone feel less isolating.

## What you can do

- Invite fictional friends individually or select the saved “Study Buddies” group.
- Choose an illustrated library, garden, or café and a 15, 25, or 45 minute focus session.
- Watch simulated invitation acceptance and holographic room preparation.
- Pause and resume a timestamp-based focus timer, send reactions, and take a social break.
- Try conversation prompts, a virtual drink, and preset encouragement messages.
- Finish with a summary of **actual focused time**, excluding pauses and breaks.

All friend interactions, invitations, and holographic projections are **client-side simulations**. No real friends are contacted and no online room is created. No account, backend, API key, database, or external runtime API is required.

## Stack

React, TypeScript, Vite, Lucide React, and plain responsive CSS. The application uses local state for the entire workflow. All environment illustrations and avatar drawings are original SVG artwork created for this project and bundled under `public/assets/`. No third-party images or fonts are loaded.

## Local development

Requires Node.js 22 or later and npm.

```bash
npm ci
npm run dev
```

Open the local address shown by Vite. Run the focused timer checks with `npm test`.

## Production build

```bash
npm run build
npm run preview
```

Vite writes the static application to `dist/`. The default base path is `/studysphere/`, so the preview URL is usually `http://localhost:4173/studysphere/`. The built site needs only static file hosting.

## GitHub Pages

1. Create a GitHub repository named `studysphere` and push this project to its `main` branch.
2. In **Settings → Pages**, choose **GitHub Actions** as the build and deployment source.
3. Pushes to `main` and manual workflow runs build and deploy `dist/` using `.github/workflows/deploy.yml`.
4. The expected URL is `https://USERNAME.github.io/studysphere/`, using your own GitHub username.

For a differently named repository, the workflow automatically sets `VITE_BASE_PATH` from the repository name. For a custom static host or local build, set `VITE_BASE_PATH` to the desired path (for example, `/new-repo/`) when running `npm run build`. `vite.config.ts` has the default.

## Limitations

This is a single-device prototype: room state is not shared, saved, or synchronized. “My Rooms” explains that rooms are temporary. Avatars and ambiance are 2D illustrated simulations; no physical holographic projection occurs. There is no real chat or voice feature. The focus timer uses browser timestamps while the page is open; reloading the page starts a new local session.
