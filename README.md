# 3D Studio CV — template

An interactive 3D CV: a small studio diorama where every object opens one part of a
person's CV, plus an **AI digital twin** that answers visitors' questions about them.
Built with Next.js (App Router), React Three Fiber and OpenRouter.

This copy is filled in for **Thai Tran**. It's a template: each person gets their own copy
and deployment, and everything about them is edited from **`/admin`**.

| Object in the room | Opens |
|---|---|
| Monitor | Live project groups |
| Server rack | Skill groups |
| Framed certificates (first three) | Certificates |
| Corkboard | Career timeline |
| Filing cabinet | Archived skills and project groups |
| Reading corner | About and contact |
| Hologram (the person's photo) | Digital twin chat |

`/cv` is the same content as a plain, printable page for recruiters, search engines and
browsers without WebGL.

## Run locally

```bash
npm install
cp .env.local.example .env.local   # set OPENROUTER_API_KEY for the twin
npm run dev                        # http://localhost:3000
```

## Edit a CV — `/admin`

Open **http://localhost:3000/admin** while `npm run dev` is running.

- Tabs cover basics and photo, about, career, skills, certificates, projects, the words on
  the 3D objects, and the digital twin (greeting, suggested questions and what it knows).
- **Save** (or ⌘S / Ctrl+S) writes the content files; the preview pane reloads with the change.
- Uploaded photos go to `public/uploads/`.
- **Archived** skill or project groups move from the monitor and rack into the filing cabinet.

Content lives in the repo, so **publishing = commit + deploy**:

```
data/profile.json          # everything shown on the site (public)
data/twin-knowledge.json   # what the twin knows (server only, never sent to the browser)
data/templates/            # the blank starter used by "Start from blank template"
public/uploads/            # photos uploaded from /admin
```

On a deployed site `/admin` is **read-only**: the save and upload APIs refuse writes outside
`npm run dev`. There is no login yet. Add one before allowing edits anywhere else (see
`TODO(auth)` in `lib/admin-store.ts`).

## Make a CV for someone else

1. Copy this repo (or use it as a GitHub template) for the new person.
2. `npm install && npm run dev`, open `/admin`, click **Start from blank template**.
3. Fill in every tab, upload their photo, paste their CV/LinkedIn into
   **Digital twin → Sources**, and **Save**.
4. Delete the previous person's photos from `public/` and `public/uploads/`.
5. Commit and deploy with their own `OPENROUTER_API_KEY`.

## Refresh Thai's twin knowledge from `digital_twin`

When the source files in the sibling `digital_twin` project change, regenerate the knowledge
file (or paste the new text into **/admin → Digital twin**):

```bash
cd ../digital_twin && .venv/bin/python -c "
import json
from pypdf import PdfReader
r = PdfReader('db/linkedin.pdf')
linkedin = ''.join((p.extract_text() or '') + '\n' for p in r.pages)
read = lambda f: open(f, encoding='utf-8').read().strip()
path = '../fe_digital_website/data/twin-knowledge.json'
out = json.load(open(path, encoding='utf-8'))  # keeps the rules
out.update({
  'currentGoal': read('db/title.md'),
  'summary': read('summary.txt'),
  'sources': [
    {'title': 'LinkedIn profile (may describe older roles; prefer the current goal when they differ)', 'content': linkedin.strip()},
    {'title': 'Upwork profile (Job Success Score, level, completed jobs, skills, portfolio, certifications, ratings and reviews)', 'content': read('db/upwork.md')},
    {'title': 'Full list of projects since 2012, grouped by role', 'content': read('db/projects.md')},
  ],
})
json.dump(out, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('updated knowledge')
"
```

## Deploy to Vercel

```bash
npx vercel --prod
```

Set `OPENROUTER_API_KEY` in the Vercel project's environment variables.

## Project structure

```
app/
  page.tsx               # the 3D studio
  cv/page.tsx            # plain text CV
  admin/                 # the editor (page + styles)
  api/chat/route.ts      # streaming twin endpoint (OpenRouter + Gemini)
  api/admin/             # read/save content, upload photos (dev only)
components/
  studio/                # 3D room: Scene (camera, effects), Room (objects),
                         # Panels (HTML panels), hotspots (camera views), textures
  admin/                 # editor UI and form fields
  DigitalTwin.tsx        # chat panel
lib/
  profile.ts             # content types + loader for data/profile.json
  twin.ts                # twin model + system prompt built from data/twin-knowledge.json
  admin-store.ts         # file read/write + validation for /admin
data/                    # the content (see above)
```

## Security note

Thai's OpenRouter API key lives in plaintext in the sibling `digital_twin/.evn` file. If that
file was ever committed or shared, rotate the key.
