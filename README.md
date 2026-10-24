# SA Imagery — Ajayi Samuel portfolio

One-page portfolio built from the Figma file "Ajayi Samuel". All text, links and images
live in `content/site.json` and are edited in **Pages CMS** (https://app.pagescms.org).

```
content/site.json   everything on the page (edited through Pages CMS)
media/              uploaded images (Pages CMS saves uploads here)
src/render.mjs      HTML template — turns the content into the page
public/             styles (css/) and scripts (js/)
build.mjs           builds dist/ — Vercel runs `node build.mjs` on every push
.pages.yml          Pages CMS editor config (fields, labels, help text)
```

## Editing (for Samuel)

1. Go to https://app.pagescms.org and sign in with GitHub.
2. Open the `sa-imagery` repository → **Portfolio**.
3. Change text, upload photos, add projects, then **Save**. The live site updates in about a minute.

Any image left empty shows a striped "+ Add photo" placeholder on the site.

## Local preview

From the project root: `node .claude/serve.mjs` → http://localhost:5173 (rebuilds on each reload).
