"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  /scene/admin — fill in a CV. A working copy is kept in this browser as you type,
//  and the preview pane redraws from it live. Save stores the CV in the
//  database (lib/draft.ts). Publish saves, then reserves the CV's path and
//  sends it for approval (/scene/admin/publish). Each account has one CV.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@/components/auth/AuthProvider";
import { DesignSwatch } from "@/components/scene/DesignPicker";
import { validateCv } from "@/lib/cv-validate";
import { DESIGNS, designById } from "@/lib/designs";
import { blankCv, cleanCv, loadDraft, loadFromCloud, saveDraft, saveToCloud } from "@/lib/draft";
import { draftProblem } from "@/lib/cv-validate";
import { CONTACT } from "@/lib/business";
import { PREVIEW_QUESTIONS, premiumNote } from "@/lib/premium";
import type { Certificate, CvContent, Profile, SectionId, TwinKnowledge } from "@/lib/profile";
import { Lines, List, Select, Tags, Text, Toggle } from "./fields";

type Content = CvContent;

const TABS = [
  { id: "basics", label: "Basics" },
  { id: "about", label: "About" },
  { id: "career", label: "Career" },
  { id: "skills", label: "Skills" },
  { id: "certs", label: "Certificates" },
  { id: "projects", label: "Projects" },
  { id: "studio", label: "3D studio" },
  { id: "twin", label: "Digital twin" },
  { id: "json", label: "Raw JSON" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const SECTION_NAMES: Record<SectionId, string> = {
  work: "Monitor (live projects)",
  stack: "Server rack (skills)",
  certs: "Certificate wall",
  career: "Corkboard (career)",
  archive: "Filing cabinet (archive)",
  about: "Reading corner (about)",
  twin: "Hologram (digital twin)",
};

export function AdminEditor() {
  const router = useRouter();
  const user = useUser();
  const { signOut } = useAuth();
  const [content, setContent] = useState<Content | null>(null);
  const [tab, setTab] = useState<TabId>("basics");
  const [status, setStatus] = useState<{ kind: "idle" | "ok" | "error"; text?: string }>({ kind: "idle" });
  const [preview, setPreview] = useState<"" | "studio" | "cv">("studio");
  const [saved, setSaved] = useState<string | null>(null); // the last version saved to the database
  const [saving, setSaving] = useState(false);

  // Pick up where this browser left off, or start from the blank template.
  // The account's saved copy is the baseline.
  useEffect(() => {
    const local = loadDraft(user.uid);
    setContent(local ?? blankCv());
    loadFromCloud(user)
      .then((cloud) => {
        if (!cloud) return;
        const copy = { profile: cloud.profile, knowledge: cloud.knowledge };
        if (!local) setContent(copy);
        setSaved(JSON.stringify(copy));
      })
      .catch((e) => setStatus({ kind: "error", text: e.message }));
  }, [user]);

  // Keep the working copy as you type; the preview pane listens for the change.
  useEffect(() => {
    if (!content) return;
    const t = setTimeout(() => {
      if (!saveDraft(user.uid, content))
        setStatus({ kind: "error", text: "This browser's storage is full or blocked. Try a smaller photo, then Save." });
    }, 300);
    return () => clearTimeout(t);
  }, [content, user.uid]);

  const cleaned = useMemo(() => (content ? cleanCv(content) : null), [content]);
  const dirty = cleaned !== null && JSON.stringify(cleaned) !== saved;

  const save = useCallback(async () => {
    if (!cleaned || saving) return false;
    const problem = draftProblem(cleaned);
    if (problem) {
      setStatus({ kind: "error", text: problem });
      return false;
    }
    setSaving(true);
    try {
      const { cv, slug } = await saveToCloud(user, cleaned);
      setSaved(JSON.stringify(cleaned));
      const time = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      setStatus({
        kind: "ok",
        text:
          cv === "updated"
            ? `Saved at ${time}. Your CV waiting for approval at /${slug} has the changes too.`
            : cv === "live"
              ? `Saved at ${time}. /${slug} is already live: contact us to publish these changes.`
              : `Saved at ${time}`,
      });
      return true;
    } catch (e) {
      setStatus({ kind: "error", text: e instanceof Error ? e.message : "Couldn't save. Try again." });
      return false;
    } finally {
      setSaving(false);
    }
  }, [cleaned, saving, user]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  const startOver = () => {
    if (!window.confirm("Replace your CV with the blank template? Your saved copy stays as it is until you Save.")) return;
    setContent(blankCv());
    setStatus({ kind: "idle" });
    setTab("basics");
  };

  const publish = async () => {
    if (!cleaned) return;
    const problem = validateCv(cleaned);
    if (problem) return setStatus({ kind: "error", text: problem });
    if (dirty && !(await save())) return;
    router.push("/scene/admin/publish");
  };

  if (!content) return <div className="admin-empty">Loading…</div>;

  const statusText = saving
    ? "Saving…"
    : status.kind === "error"
      ? status.text
      : dirty
        ? saved
          ? "Unsaved changes"
          : "Not saved yet"
        : (status.text ?? "All changes saved");

  const p = content.profile;
  const k = content.knowledge;
  const setP = (fn: (draft: Profile) => void) =>
    setContent((c) => {
      const n = structuredClone(c!);
      fn(n.profile);
      return n;
    });
  const setK = (fn: (draft: TwinKnowledge) => void) =>
    setContent((c) => {
      const n = structuredClone(c!);
      fn(n.knowledge);
      return n;
    });

  return (
    <div className={`admin ${preview ? "with-preview" : ""}`}>
      <header className="admin-bar">
        <div className="admin-title">
          <strong>Edit CV</strong>
          <span>{p.name || "Untitled"}</span>
        </div>
        <div className="admin-account">
          <span title={user.email ?? undefined}>{user.email}</span>
          <button type="button" className="ghost" onClick={() => (!dirty || window.confirm("You have unsaved changes. Sign out anyway?")) && signOut()}>
            Sign out
          </button>
        </div>
        <p className={`admin-status ${status.kind === "error" ? "error" : !dirty && !saving ? "ok" : ""}`} role="status">
          {statusText}
        </p>
        <div className="admin-actions">
          <button type="button" className="ghost" onClick={startOver}>
            Start over
          </button>
          <select value={preview} onChange={(e) => setPreview(e.target.value as typeof preview)} aria-label="Preview">
            <option value="studio">Preview: 3D studio</option>
            <option value="cv">Preview: text CV</option>
            <option value="">Hide preview</option>
          </select>
          <button type="button" className="ghost" onClick={save} disabled={saving || !dirty}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button type="button" className="primary" onClick={publish} disabled={saving}>
            Publish
          </button>
        </div>
      </header>

      <nav className="admin-nav" aria-label="Editor sections">
        {TABS.map((t) => (
          <button key={t.id} type="button" className={tab === t.id ? "on" : ""} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      <main className="admin-form">
        {tab === "basics" && (
          <>
            <h2>Basics</h2>
            <div className="grid2">
              <Text label="Full name" value={p.name} onChange={(v) => setP((d) => void (d.name = v))} />
              <Text label="Initials" value={p.initials} onChange={(v) => setP((d) => void (d.initials = v))} hint="Shown when there's no photo." />
            </div>
            <Avatar value={p.avatar} onChange={(v) => setP((d) => void (d.avatar = v))} initials={p.initials} />
            <Text label="Job title" value={p.title} onChange={(v) => setP((d) => void (d.title = v))} />
            <Text label="Studio subtitle" value={p.subtitle} onChange={(v) => setP((d) => void (d.subtitle = v))} hint="Under the name in the top-left of the 3D studio." />
            <Text label="Tagline" value={p.tagline} onChange={(v) => setP((d) => void (d.tagline = v))} hint="Used in the page description for search engines." />
            <div className="grid2">
              <Text label="Location" value={p.location} onChange={(v) => setP((d) => void (d.location = v))} />
              <Text label="Email" type="email" value={p.email} onChange={(v) => setP((d) => void (d.email = v))} />
            </div>
            <div className="grid2">
              <Text
                label="Phone"
                type="tel"
                value={p.phone ?? ""}
                onChange={(v) => setP((d) => void (d.phone = v))}
                placeholder="+84 90 123 4567"
                hint="The telephone on the cabinet and the About panel call this. Leave empty to hide the phone."
              />
              <Text label="Languages" value={p.languages} onChange={(v) => setP((d) => void (d.languages = v))} />
            </div>
            <Toggle label="Open to new opportunities" checked={p.available} onChange={(v) => setP((d) => void (d.available = v))} />
            <List
              label="Stats"
              hint="Short facts shown in the About panel, like years of experience."
              items={p.stats}
              onChange={(v) => setP((d) => void (d.stats = v))}
              blank={() => ({ value: "", label: "" })}
              title={(s) => [s.value, s.label].filter(Boolean).join(" ")}
              addLabel="Add stat"
              render={(s, set) => (
                <div className="grid2">
                  <Text label="Value" value={s.value} onChange={(v) => set({ ...s, value: v })} placeholder="10+" />
                  <Text label="Label" value={s.label} onChange={(v) => set({ ...s, label: v })} placeholder="Years Experience" />
                </div>
              )}
            />
            <List
              label="Links"
              items={p.socials}
              onChange={(v) => setP((d) => void (d.socials = v))}
              blank={() => ({ label: "", title: "", href: "https://" })}
              title={(s) => s.title}
              addLabel="Add link"
              render={(s, set) => (
                <>
                  <div className="grid2">
                    <Text label="Name" value={s.title} onChange={(v) => set({ ...s, title: v })} placeholder="LinkedIn" />
                    <Text label="Short label" value={s.label} onChange={(v) => set({ ...s, label: v })} placeholder="in" />
                  </div>
                  <Text label="URL" type="url" value={s.href} onChange={(v) => set({ ...s, href: v })} />
                </>
              )}
            />
          </>
        )}

        {tab === "about" && (
          <>
            <h2>About</h2>
            <List
              label="Paragraphs"
              hint="Shown in the reading corner and at the top of the text CV."
              items={p.about}
              onChange={(v) => setP((d) => void (d.about = v))}
              blank={() => ""}
              title={(s, i) => `Paragraph ${i + 1}: ${s.slice(0, 60)}${s.length > 60 ? "…" : ""}`}
              addLabel="Add paragraph"
              render={(s, set) => <Text label="Text" value={s} onChange={set} multiline rows={5} />}
            />
          </>
        )}

        {tab === "career" && (
          <>
            <h2>Career</h2>
            <List
              label="Roles"
              hint="Newest first. Pinned to the corkboard and listed in the Career panel."
              items={p.experience}
              onChange={(v) => setP((d) => void (d.experience = v))}
              blank={() => ({ period: "", role: "", org: "", summary: "" })}
              title={(e) => [e.role, e.period].filter(Boolean).join(", ")}
              addLabel="Add role"
              render={(e, set) => (
                <>
                  <div className="grid2">
                    <Text label="Role" value={e.role} onChange={(v) => set({ ...e, role: v })} />
                    <Text label="Period" value={e.period} onChange={(v) => set({ ...e, period: v })} placeholder="2020 — Present" />
                  </div>
                  <Text label="Organisation" value={e.org} onChange={(v) => set({ ...e, org: v })} />
                  <Text label="Summary" value={e.summary} onChange={(v) => set({ ...e, summary: v })} multiline rows={5} />
                </>
              )}
            />
          </>
        )}

        {tab === "skills" && (
          <>
            <h2>Skills</h2>
            <List
              label="Skill groups"
              hint="Groups go on the server rack. Archived groups go in the filing cabinet instead."
              items={p.skills}
              onChange={(v) => setP((d) => void (d.skills = v))}
              blank={() => ({ group: "", items: [] })}
              title={(g) => `${g.group}${g.archived ? " (archived)" : ""}`}
              addLabel="Add group"
              render={(g, set) => (
                <>
                  <Text label="Group name" value={g.group} onChange={(v) => set({ ...g, group: v })} />
                  <Tags label="Skills" value={g.items} onChange={(v) => set({ ...g, items: v })} />
                  <Toggle label="Archived (show in the filing cabinet)" checked={!!g.archived} onChange={(v) => set({ ...g, archived: v })} />
                </>
              )}
            />
          </>
        )}

        {tab === "certs" && (
          <>
            <h2>Certificates</h2>
            <List
              label="Certificates"
              hint="Newest first. The first three hang on the wall; all of them are listed in the panel."
              items={p.certificates}
              onChange={(v) => setP((d) => void (d.certificates = v))}
              blank={(): Certificate => ({ title: "", issuer: "", instructor: "", date: new Date().toISOString().slice(0, 10) })}
              title={(c) => c.title}
              addLabel="Add certificate"
              render={(c, set) => (
                <>
                  <Text label="Title" value={c.title} onChange={(v) => set({ ...c, title: v })} />
                  <div className="grid2">
                    <Text label="Issuer" value={c.issuer} onChange={(v) => set({ ...c, issuer: v })} placeholder="Udemy" />
                    <Text label="Instructor" value={c.instructor} onChange={(v) => set({ ...c, instructor: v })} />
                  </div>
                  <div className="grid2">
                    <Text label="Completed on" type="date" value={c.date} onChange={(v) => set({ ...c, date: v })} />
                    <Text label="Seal text" value={c.badge ?? ""} onChange={(v) => set({ ...c, badge: v })} placeholder="AI" hint="Up to 3 characters." />
                  </div>
                  <Text label="Note (optional)" value={c.note ?? ""} onChange={(v) => set({ ...c, note: v })} multiline rows={2} />
                </>
              )}
            />
          </>
        )}

        {tab === "projects" && (
          <>
            <h2>Projects</h2>
            <List
              label="Project groups"
              hint="Live groups appear on the monitor. Archived groups are filed in the cabinet."
              items={p.projectGroups}
              onChange={(v) => setP((d) => void (d.projectGroups = v))}
              blank={() => ({ key: `group-${p.projectGroups.length + 1}`, label: "", archived: false })}
              title={(g) => `${g.label || g.key}${g.archived ? " (archived)" : ""}`}
              addLabel="Add group"
              render={(g, set) => (
                <>
                  <div className="grid2">
                    <Text label="Heading" value={g.label} onChange={(v) => set({ ...g, label: v })} />
                    <Text
                      label="ID"
                      value={g.key}
                      onChange={(v) => {
                        const key = v.toLowerCase().replace(/[^a-z0-9-]/g, "");
                        // Keep projects attached when a group's ID changes.
                        setP((d) => {
                          d.projects.forEach((pr) => pr.category === g.key && (pr.category = key));
                          d.projectGroups = d.projectGroups.map((x) => (x.key === g.key ? { ...g, key } : x));
                        });
                      }}
                      hint="Lowercase letters, numbers and dashes."
                    />
                  </div>
                  <Toggle label="Archived (show in the filing cabinet)" checked={!!g.archived} onChange={(v) => set({ ...g, archived: v })} />
                </>
              )}
            />
            <List
              label="Projects"
              items={p.projects}
              onChange={(v) => setP((d) => void (d.projects = v))}
              blank={() => ({ category: p.projectGroups[0]?.key ?? "", icon: "✨", name: "", description: "" })}
              title={(pr) => `${pr.icon} ${pr.name}`}
              addLabel="Add project"
              render={(pr, set) => (
                <>
                  <div className="grid-icon">
                    <Text label="Icon" value={pr.icon} onChange={(v) => set({ ...pr, icon: v })} hint="An emoji." />
                    <Text label="Name" value={pr.name} onChange={(v) => set({ ...pr, name: v })} />
                  </div>
                  <Select
                    label="Group"
                    value={pr.category}
                    onChange={(v) => set({ ...pr, category: v })}
                    options={p.projectGroups.map((g) => ({ value: g.key, label: g.label || g.key }))}
                  />
                  <Text label="Description" value={pr.description} onChange={(v) => set({ ...pr, description: v })} multiline rows={3} />
                </>
              )}
            />
          </>
        )}

        {tab === "studio" && (
          <>
            <h2>3D studio</h2>
            <p className="admin-lede">How the room looks, the words on its objects, and the panel each object opens.</p>
            <div className="f">
              <span className="f-label">Room design</span>
              <div className="design-choices">
                {DESIGNS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className={designById(p.studio.design).id === d.id ? "on" : ""}
                    aria-pressed={designById(p.studio.design).id === d.id}
                    onClick={() => setP((x) => void (x.studio.design = d.id))}
                  >
                    <DesignSwatch design={d} />
                    <strong>{d.name}</strong>
                    <span>{d.blurb}</span>
                  </button>
                ))}
              </div>
            </div>
            <Text
              label="Neon sign"
              multiline
              rows={3}
              value={p.studio.neon}
              onChange={(v) => setP((d) => void (d.studio.neon = v))}
              hint="Above the certificates. Each line here is one line on the sign. The text shrinks to fit the longest line, so 2–3 lines of up to about 45 characters read best."
            />
            <Lines
              label="Monitor terminal"
              value={p.studio.terminal}
              onChange={(v) => setP((d) => void (d.studio.terminal = v))}
              hint="Typed out line by line on the monitor. Start a line with $ for a command; add ✓ to highlight it."
              rows={8}
              mono
            />
            <div className="grid2">
              {[0, 1, 2, 3].map((i) => (
                <Text
                  key={i}
                  label={`Cabinet drawer ${i + 1}`}
                  value={p.studio.drawers[i] ?? ""}
                  onChange={(v) =>
                    setP((d) => {
                      const drawers = [0, 1, 2, 3].map((j) => d.studio.drawers[j] ?? "");
                      drawers[i] = v;
                      d.studio.drawers = drawers;
                    })
                  }
                />
              ))}
            </div>
            {(Object.keys(SECTION_NAMES) as SectionId[]).map((id) => {
              const s = p.studio.sections[id];
              const set = (patch: Partial<typeof s>) => setP((d) => void (d.studio.sections[id] = { ...d.studio.sections[id], ...patch }));
              const hasPanelCopy = id !== "about" && id !== "twin";
              return (
                <section key={id} className="list">
                  <div className="list-head">
                    <h3>{SECTION_NAMES[id]}</h3>
                  </div>
                  <div className="card-body plain">
                    <div className="grid2">
                      <Text label="Dock button" value={s.label} onChange={(v) => set({ label: v })} />
                      <Text label="Hover label" value={s.hint} onChange={(v) => set({ hint: v })} />
                    </div>
                    {hasPanelCopy && (
                      <>
                        <Text label="Panel heading" value={s.title} onChange={(v) => set({ title: v })} />
                        <Text label="Panel intro" value={s.lede} onChange={(v) => set({ lede: v })} multiline rows={2} />
                      </>
                    )}
                  </div>
                </section>
              );
            })}
          </>
        )}

        {tab === "twin" && (
          <>
            <h2>Digital twin</h2>
            <Toggle
              label="Turn on the digital twin"
              checked={p.twin.enabled !== false}
              onChange={(v) => setP((d) => void (d.twin.enabled = v))}
              hint="Visitors chat with an AI version of you, standing in the room as a hologram. Turn it off to remove the hologram and the chat."
            />
            <p className="premium-note">
              {premiumNote} <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </p>
            <p className="admin-lede">
              The chat greeting is public. Everything under “What the twin knows” is only sent to the AI model, and the twin answers
              only from it. In the preview, the twin answers {PREVIEW_QUESTIONS} questions so you can try it.
            </p>
            <Text label="Greeting" value={p.twin.greeting} onChange={(v) => setP((d) => void (d.twin.greeting = v))} multiline rows={2} />
            <Lines label="Suggested questions" value={p.twin.suggestions} onChange={(v) => setP((d) => void (d.twin.suggestions = v))} rows={4} />

            <h2 className="sub">What the twin knows</h2>
            <Text label="Current goal" value={k.currentGoal} onChange={(v) => setK((d) => void (d.currentGoal = v))} multiline rows={2} hint="Takes priority over older sources." />
            <Text label="Summary" value={k.summary} onChange={(v) => setK((d) => void (d.summary = v))} multiline rows={4} />
            <List
              label="Sources"
              hint="Paste whole documents: a CV, a LinkedIn export, a project list. The twin answers only from what's here."
              items={k.sources}
              onChange={(v) => setK((d) => void (d.sources = v))}
              blank={() => ({ title: "", content: "" })}
              title={(s) => `${s.title}${s.content ? ` (${s.content.length.toLocaleString()} characters)` : " (empty)"}`}
              addLabel="Add source"
              render={(s, set) => (
                <>
                  <Text label="Title" value={s.title} onChange={(v) => set({ ...s, title: v })} />
                  <Text label="Content" value={s.content} onChange={(v) => set({ ...s, content: v })} multiline rows={14} mono />
                </>
              )}
            />
            <Text
              label="Extra rules"
              value={k.rules}
              onChange={(v) => setK((d) => void (d.rules = v))}
              multiline
              rows={4}
              hint="Person-specific instructions, e.g. never reveal the hourly rate."
            />
          </>
        )}

        {tab === "json" && <RawJson content={content} onApply={setContent} />}
      </main>

      {preview && (
        <aside className="admin-preview">
          <div className="preview-head">
            <span>Preview</span>
            <a href={`/scene/admin/preview?view=${preview}`} target="_blank" rel="noopener noreferrer">
              Open in new tab
            </a>
          </div>
          <iframe src={`/scene/admin/preview?view=${preview}`} title="CV preview" />
        </aside>
      )}
    </div>
  );
}

// The photo is shrunk in the browser and stored in the CV itself as a small
// JPEG data URL, so it publishes with the rest of the CV.
const PHOTO_SIZE = 360;

function shrinkPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      // Centre-crop to a square: it becomes the round hologram.
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = Math.min(PHOTO_SIZE, side);
      canvas
        .getContext("2d")!
        .drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file isn't an image this browser can read."));
    };
    img.src = url;
  });
}

function Avatar({ value, onChange, initials }: { value: string; onChange: (v: string) => void; initials: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const pick = async (file: File) => {
    setError("");
    try {
      onChange(await shrinkPhoto(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read that photo.");
    }
  };

  return (
    <div className="f avatar-field">
      <span className="f-label">Photo</span>
      <div className="avatar-row">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="avatar-img" />
        ) : (
          <span className="avatar-img avatar-initials">{initials}</span>
        )}
        <div className="avatar-buttons">
          <button type="button" className="ghost" onClick={() => input.current?.click()}>
            {value ? "Replace photo" : "Add photo"}
          </button>
          {value && (
            <button type="button" className="ghost" onClick={() => onChange("")}>
              Use initials
            </button>
          )}
        </div>
        <input
          ref={input}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) pick(f);
            e.target.value = "";
          }}
        />
      </div>
      <p className="f-hint">{error || "PNG, JPEG or WebP. It's cropped to a square and becomes the hologram."}</p>
    </div>
  );
}

function RawJson({ content, onApply }: { content: Content; onApply: (c: Content) => void }) {
  const [text, setText] = useState(() => JSON.stringify(content, null, 2));
  const [error, setError] = useState("");
  return (
    <>
      <h2>Raw JSON</h2>
      <p className="admin-lede">
        The whole CV: <code>profile</code> is what visitors see, <code>knowledge</code> is what the twin knows. Apply to load it into
        the editor.
      </p>
      <textarea className="mono raw" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
      {error && <p className="f-error">{error}</p>}
      <div className="raw-actions">
        <button
          type="button"
          className="primary"
          onClick={() => {
            try {
              const parsed = JSON.parse(text);
              if (!parsed.profile || !parsed.knowledge) throw new Error("Needs both “profile” and “knowledge”.");
              onApply(parsed);
              setError("");
            } catch (e) {
              setError(e instanceof Error ? e.message : "That isn't valid JSON.");
            }
          }}
        >
          Apply to editor
        </button>
        <button type="button" className="ghost" onClick={() => setText(JSON.stringify(content, null, 2))}>
          Reset
        </button>
      </div>
    </>
  );
}
