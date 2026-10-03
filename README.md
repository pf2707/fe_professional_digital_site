# Thai Tran — Digital CV + AI Digital Twin

A professional personal website / digital CV for **Hong Thai Tran**, built with
**Next.js (App Router)**, with an integrated **AI digital twin** that answers visitors'
questions about his career, skills, and experience.

The twin's intelligence is integrated from the sibling `digital_twin` project:
- Same model: **`google/gemini-2.5-flash-lite`** via **OpenRouter**
- Same knowledge base: summary + LinkedIn + Upwork (see `lib/twin-knowledge.json`)
- Same persona & rules (including rate confidentiality) — see `lib/twin.ts`

Features:
- Light **and** dark themes with a toggle
- Streaming, markdown-formatted twin replies
- Single source of truth for site content: `lib/profile.ts`
- Fully responsive, plain CSS with design tokens

## Run locally

```bash
npm install      # already done
npm run dev      # http://localhost:3000
```

The OpenRouter key is already in `.env.local` (gitignored). To use a different key:

```bash
cp .env.local.example .env.local   # then edit it
```

## Refresh the twin's knowledge

The twin reads from `lib/twin-knowledge.json`. When you update the source files in the
`digital_twin` project (`summary.txt`, `db/linkedin.pdf`, `db/upwork.md`), regenerate it:

```bash
cd ../digital_twin && .venv/bin/python -c "
import json
from pypdf import PdfReader
r = PdfReader('db/linkedin.pdf')
linkedin = ''.join((p.extract_text() or '') + '\n' for p in r.pages)
out = {
  'summary': open('summary.txt', encoding='utf-8').read().strip(),
  'linkedin': linkedin.strip(),
  'upwork': open('db/upwork.md', encoding='utf-8').read().strip(),
}
json.dump(out, open('../fe_digital_website/lib/twin-knowledge.json','w',encoding='utf-8'), ensure_ascii=False, indent=2)
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
  layout.tsx           # root layout + theme provider
  page.tsx             # the CV page (reads lib/profile.ts)
  globals.css          # styling + light/dark theme tokens
  api/chat/route.ts    # streaming twin endpoint (OpenRouter + Gemini)
components/
  ThemeProvider.tsx    # next-themes wrapper
  ThemeToggle.tsx      # light/dark switch
  DigitalTwin.tsx      # chat widget (streams + renders markdown)
lib/
  profile.ts           # website content (name, experience, skills, projects…)
  twin.ts              # twin model + system prompt (mirrors digital_twin/context.py)
  twin-knowledge.json  # summary + LinkedIn + Upwork knowledge base
mockup/
  index.html           # original static design mockup (reference only)
```

## Security note

Your OpenRouter API key currently lives in plaintext in the sibling `digital_twin/.evn`
file. Since it's now also used here (and `.env.local` keeps it out of git), consider
rotating the key if that file was ever committed or shared.
