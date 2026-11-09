---
name: create-favicon
description: Use when the app still shows the Next.js default favicon, when the app's name or accent colour changes, or when `/create-favicon` is invoked. Builds the favicon, the app icon, and the Apple touch icon from the app's initial (or its logo) on the accent colour, and checks them at 16px before placing them.
---

# Create the Favicon

The default Next.js icon makes every app built from this template look the same in a row of tabs. Replace it with a mark for this app: by default the first character of the app's name in white on the accent colour, or the app's own logo when it has one.

## Files

Next.js picks these up by their names in `src/app/` and writes the `<link>` tags itself; do not add them to `metadata`.

| File                     | Size               | Used by                                                     |
| ------------------------ | ------------------ | ----------------------------------------------------------- |
| `src/app/favicon.ico`    | 16, 32, 48 px      | Browser tabs and bookmarks, older browsers                  |
| `src/app/icon.png`       | 512 px             | Browsers that prefer a large icon, the installed web app    |
| `src/app/apple-icon.png` | 180 px, no corners | The iPhone and iPad home screen (the OS rounds the corners) |

## Steps

1. **Read the inputs.** The app's name is `metadata.title` in `src/app/layout.tsx` (use the name the users call the app, not `Next.js Template`; ask if it is still the template's). The background is the accent at its primary shade: `themeConfig.accentColors[themeConfig.accentShade]` in `src/helpers/theme.ts`. If `themeConfig.isConfigured` is `false`, run `/setup-theme` first.
2. **Choose the mark.** The first character of the app's name. When the name starts with a word that many apps share (`業務`, `管理`, `社内`), take the first character of the word that tells this app apart, and say which one you took. When the app has a logo, use its SVG instead of a letter.
3. **Generate.**

   ```bash
   node .claude/skills/create-favicon/generate-favicon.mjs --letter 倉 --background "#4938d1"
   # or, with a logo
   node .claude/skills/create-favicon/generate-favicon.mjs --logo path/to/logo.svg --background "#4938d1"
   ```

   The script uses only `sharp`, which Next.js already installs. The letter is drawn with the machine's Japanese gothic font (Hiragino Sans on macOS).

4. **Look at it.** Open `tmp/favicon-preview/16.png`, `32.png`, and `180.png` with the Read tool. At 16px the mark must still read as the intended character or logo; if it does not (a complex kanji, a detailed logo), pick a simpler character or a simpler form of the logo and generate again.
5. **Check in the browser.** Start the app and confirm the tab shows the new icon (a hard reload may be needed, because browsers cache favicons).

## Rules

- One character, white on the accent colour. No gradients, shadows, or outlines (`design-layout.md`).
- Never use another company's logo, or an icon that looks like one.
- When the app's name or accent colour changes, run this skill again so the icon follows.
- Leave `tmp/favicon-preview/` out of commits; the files in `src/app/` are the result.
