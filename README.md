# 3D Studio CV

Interactive 3D CVs: a small studio diorama where every object opens one part of a
person's CV, plus an **AI digital twin** that answers visitors' questions about them.
Anyone can fill in a CV, reserve an address like `/thai-tran`, and contact the owner to
publish it. Built with Next.js (App Router), React Three Fiber, Firestore and OpenRouter.

| Object in the room | Opens |
|---|---|
| Monitor | Live project groups |
| Server rack | Skill groups |
| Framed certificates (first three) | Certificates |
| Neon sign | A close-up of the slogan |
| Corkboard | Career timeline |
| Filing cabinet | Archived skills and project groups |
| Telephone | Calls the person |
| Reading corner | About and contact |
| Hologram (the person's photo) | Digital twin chat (if turned on) |

## Pages

| Path | What it is |
|---|---|
| `/` | Landing page: the live sample room as the headline image, a big button into `/scene` |
| `/scene` | The sample CV (`data/profile.json`), with a rail to try each place and colour design |
| `/cv` | The sample CV as plain text |
| `/login`, `/register` | Sign in or create an account (email and password, or Google) |
| `/scene/admin` | Fill in your CV. Needs an account: signed-out visitors are sent to `/login` first. The preview updates as you type |
| `/scene/admin/publish` | Choose an address, reserve it, contact us |
| `/scene/<slug>` | A published CV (once approved) |
| `/owner` | Site owner only: pending CVs, open each one, approve it |
| `/scene/<slug>/cv` | That CV as plain text, for recruiters, search engines and browsers without WebGL |

## Run locally

```bash
npm install
cp .env.local.example .env.local   # set OPENROUTER_API_KEY, FIREBASE_ADMIN_CREDENTIALS, NEXT_PUBLIC_FIREBASE_*
npm run dev                        # http://localhost:3000
```

Without `FIREBASE_ADMIN_CREDENTIALS`, drafts and CVs are saved as JSON files in `.data/`
(git-ignored). Signing in always needs the Firebase web app config (`NEXT_PUBLIC_FIREBASE_*`).

## How publishing works

1. A customer creates an account (`/register`, email and password or Google) and fills in
   their CV at `/scene/admin`: details, photo, place and colours, and whether the digital twin is on.
   **Save** (or ⌘S / Ctrl+S) stores it in Firestore as `drafts/<uid>`, so each account has
   one CV and can edit it from any device. Every API call carries the user's Firebase ID
   token, which the server verifies (`lib/auth-server.ts`).
2. **Publish** opens `/scene/admin/publish`. They choose an address (`/scene/thuy-huynh`). It's checked
   as they type: shape rules and reserved words (`lib/slug.ts`), then the database.
3. **Contact us to publish** reserves the address and stores the CV with
   `status: "pending"`, with `ownerUid` and `ownerEmail` so you know whose it is. One
   address per account. Until you approve it, every Save in the editor
   updates the pending CV too. Once it's live, saves only update the draft, and the
   customer is told to contact you. They then email you at the address in
   `lib/business.ts`. Payment happens outside the website.
4. You approve it at `/owner` (below), or in the Firebase console by changing `status`
   in `cvs/<slug>` to `approved`. The CV is live at `/scene/<slug>` straight away.

### Reviewing and approving at `/owner`

Sign in at `/owner` with `OWNER_EMAIL` and `OWNER_PASSWORD` from the environment (one
owner account, separate from customers' Firebase accounts; the session is a signed,
httpOnly cookie that lasts 12 hours). The page lists every pending CV. Click one to open
the full 3D CV at `/scene/<slug>`, twin included, with an **Approve** bar on top. The bar's
**Digital twin** checkbox turns the twin on or off for that CV right away. It's stored as
`twinEnabled` on `cvs/<slug>`, overrides the customer's own switch, and their later saves
don't change it.
Approving puts it live straight away. There's no decline yet: to turn one down, delete
`cvs/<slug>` in the Firebase console.

The address is the Firestore document ID, so two CVs can never share one: reserving
uses an atomic create that fails if the document exists.

### Each twin only knows its own CV

The chat sends the CV's slug. The server loads that one CV and builds the twin's
instructions from its knowledge alone, with a rule to decline questions about anyone
else. Nothing from other CVs is ever in the prompt. A pending CV, or one with the twin
turned off, gets no answers (except to the signed-in site owner reviewing it).

### The twin is premium

The editor says so under the twin switch. In the editor's preview, the twin answers
2 questions from the knowledge being edited (signed-in users only, checked on the server
too); the third gets "This is a premium feature… contact us". The count is per chat, so
reloading the preview starts a new trial. `lib/premium.ts` holds the limit and the wording.

## Firebase setup

1. Create a Firebase project and a Firestore database.
2. Deploy `firestore.rules`. It blocks all browser access, because only the server reads and
   writes CVs, through the Admin SDK.
3. Project settings → Service accounts → Generate new private key. Put the whole JSON in
   `FIREBASE_ADMIN_CREDENTIALS`, on one line, in single quotes.
4. Project settings → General → Your apps → add a **Web** app. Copy `apiKey`, `authDomain`,
   `projectId` and `appId` into the `NEXT_PUBLIC_FIREBASE_*` variables.
5. Authentication → Sign-in method: enable **Email/Password** and **Google**. Under
   Settings → Authorized domains, add your production domain (localhost is there already).

Collections: `drafts` (one per account, keyed by uid) and `cvs` (reserved and published CVs, keyed
by address).

## Places and colours

A CV picks a **place** (`studio.place`) and a **colour design** (`studio.design`), separately.

- **Places** (`lib/places.ts`): the Studio (`components/studio/Room.tsx`), the Coffee shop
  (`components/studio/Cafe.tsx`), the Park (`components/studio/Park.tsx`) and the Shop
  (`components/studio/Shop.tsx`). Each is its own 3D scene with every CV section on an
  object that suits it; the camera positions for each are in `LAYOUTS`
  (`components/studio/hotspots.ts`). Pieces shared by every place (the clickable wrapper,
  certificate frames, phone, hologram, lights) are in `components/studio/parts.tsx`.
- **Colours** (`lib/designs.ts`): Night, Sakura, Cyber and Forest. Each is a palette for
  any place (walls, floor, wood, metal, two accent lights) plus the sky behind it.

Hover labels are written for the studio ("The monitor — AI projects"). In other places the
object's name replaces the part before the dash ("The chalkboard menu — AI projects").

To add a place: add it to `PLACES`, give it a layout in `LAYOUTS`, build its scene from
`parts.tsx`, pick it in `Scene.tsx`, and add a picture of it as `public/places/<id>.webp`
(a screenshot of the scene, about 1170×780). It then appears in the place picker on
`/scene` and in the editor; to show it on the landing page too, add it to `SHOWN` in
`app/page.tsx`.

## Refresh the sample twin's knowledge from `digital_twin`

`/scene` shows Thai's CV as the sample. When the source files in the sibling
`digital_twin` project change, regenerate its knowledge file:

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

Set `OPENROUTER_API_KEY`, `FIREBASE_ADMIN_CREDENTIALS`, `NEXT_PUBLIC_FIREBASE_*`, `OWNER_EMAIL` and `OWNER_PASSWORD` in the
Vercel project's environment variables.

## Project structure

```
app/
  page.tsx                 # landing page
  scene/page.tsx           # sample CV + design rail
  cv/page.tsx              # sample CV as text
  scene/[slug]/page.tsx    # a published CV
  scene/[slug]/cv/page.tsx # a published CV as text
  scene/admin/             # editor, live preview, publish page (signed in)
  api/chat/route.ts        # streaming twin endpoint, scoped to one CV by slug
  api/publish/route.ts     # check an address; reserve it with a pending CV
  (auth)/                  # /login and /register
  api/drafts/route.ts      # load and save the signed-in user's draft
components/
  studio/                  # 3D room: Studio, Scene, Room, Panels, hotspots, textures,
                           # StudioData (which CV the studio is showing)
  scene/                   # design rail
  admin/                   # editor, preview, publish flow, form fields
  auth/                    # sign-in state, login/register form, RequireAuth
  landing/                 # the landing page's live 3D room (HeroRoom)
  cv/                      # text CV, pending page
  DigitalTwin.tsx          # chat panel
lib/
  profile.ts               # CV types + the sample
  designs.ts               # colour designs
  places.ts                # places (studio, coffee shop, park, shop) and their objects
  store.ts                 # Firestore (or .data/ locally)
  cv-store.ts              # reserved and published CVs
  draft-store.ts           # saved editor drafts, one per account
  auth-server.ts           # verifies the caller's Firebase ID token
  firebase-client.ts       # Firebase Auth in the browser
  cv-validate.ts           # shape check before publishing
  slug.ts                  # address rules
  twin.ts                  # twin model + per-CV system prompt
  draft.ts                 # the editor's working copy and Save
  business.ts              # contact details on the publish page
data/                      # the sample CV + the blank template
firestore.rules            # no direct browser access
```

## Security note

Thai's OpenRouter API key lives in plaintext in the sibling `digital_twin/.evn` file. If that
file was ever committed or shared, rotate the key.
