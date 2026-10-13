# Tennis Progression Assistant V2

This app is a knowledge-first Hybrid Knowledge Atlas for tennis progression.

Primary sections:

- Atlas
- Path
- Drill
- Review
- Settings

The app starts from the clean V2 Atlas state key, `tennis-knowledge-atlas-v2`. Old localStorage or IndexedDB user data is not migrated into the V2 product state.

Knowledge cards use verified content packs under `content/atlas/` and generated bitmap teaching assets under `public/assets/knowledge/`.

Run from this app directory:

```bash
cd apps/progression-assistant
npm install
npm run dev
npm run test
npm run typecheck
npm run build
```
