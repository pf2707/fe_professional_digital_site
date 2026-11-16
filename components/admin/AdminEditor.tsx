"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  /scene/admin — fill in a CV. A working copy is kept in this browser as you type,
//  and the preview pane redraws from it live. Save stores the CV in the
//  database (lib/draft.ts). Publish saves, then reserves the CV's path and
//  sends it for approval (/scene/admin/publish). Each account has one CV.
//  The whole CV (profile + twin knowledge) is what's saved, and what the twin
//  answers from; there's no separate document to paste for the twin.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import type { User } from "firebase/auth";
import { useAuth, useUser } from "@/components/auth/AuthProvider";
import { BackButton } from "@/components/BackButton";
import { useT } from "@/components/I18nProvider";
import { DesignSwatch } from "@/components/scene/DesignPicker";
import { validateCv } from "@/lib/cv-validate";
import { DESIGNS, designById } from "@/lib/designs";
import { designIn, lookNameIn, placeIn } from "@/lib/i18n";
import { hintIn, PLACES, placeById } from "@/lib/places";
import { blankCv, cleanCv, loadDraft, loadFromCloud, saveDraft, saveToCloud } from "@/lib/draft";
import { draftProblem } from "@/lib/cv-validate";
import { CONTACT } from "@/lib/business";
import { PREVIEW_QUESTIONS } from "@/lib/premium";
import type { ImportedCv } from "@/lib/cv-import";
import { MAX_PDF_MB, pdfText } from "@/lib/pdf-text";
import type { Certificate, CvContent, Profile, SectionId, TwinKnowledge } from "@/lib/profile";
import { Lines, List, Select, Tags, Text, Toggle } from "./fields";

type Content = CvContent;

// Their names are in lib/i18n, under editor.tabs.
const TABS = ["basics", "about", "career", "skills", "certs", "projects", "studio", "twin"] as const;
type TabId = (typeof TABS)[number];

// The sections, in order. What each holds is editor.sectionWhat; the object it's on depends on the place.
const SECTIONS: SectionId[] = ["work", "stack", "certs", "career", "archive", "about", "twin"];

// Phones get a slimmer editor: no preview pane, and Save opens the preview
// (/scene/admin/preview?flow=1) with Publish there. Matches admin.css's 720px.
const PHONE = "(max-width: 720px)";
const onPhoneChange = (cb: () => void) => {
  const mq = window.matchMedia(PHONE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const usePhone = () =>
  useSyncExternalStore(onPhoneChange, () => window.matchMedia(PHONE).matches, () => false);

export function AdminEditor() {
  const router = useRouter();
  const user = useUser();
  const { signOut } = useAuth();
  const t = useT();
  const e = t.editor;
  const [content, setContent] = useState<Content | null>(null);
  const [tab, setTab] = useState<TabId>("basics");
  const [status, setStatus] = useState<{ kind: "idle" | "ok" | "error"; text?: string }>({ kind: "idle" });
  const [preview, setPreview] = useState<"" | "studio" | "cv">("studio");
  const [saved, setSaved] = useState<string | null>(null); // the last version saved to the database
  const [saving, setSaving] = useState(false);
  const phone = usePhone();

  // Pick up where this browser left off, or start from the blank template.
  // The account's saved copy is the baseline.
  useEffect(() => {
    const local = loadDraft(user.uid);
    setContent(local ?? blankCv());
    loadFromCloud(user, t.errors)
      .then((cloud) => {
        if (!cloud) return;
        const copy = { profile: cloud.profile, knowledge: cloud.knowledge };
        if (!local) setContent(copy);
        setSaved(JSON.stringify(copy));
      })
      .catch((err) => setStatus({ kind: "error", text: err.message }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Keep the working copy as you type; the preview pane listens for the change.
  useEffect(() => {
    if (!content) return;
    const timer = setTimeout(() => {
      if (!saveDraft(user.uid, content)) setStatus({ kind: "error", text: e.storageFull });
    }, 300);
    return () => clearTimeout(timer);
  }, [content, user.uid, e.storageFull]);

  const cleaned = useMemo(() => (content ? cleanCv(content) : null), [content]);
  const dirty = cleaned !== null && JSON.stringify(cleaned) !== saved;

  const save = useCallback(async () => {
    if (!cleaned || saving) return false;
    const problem = draftProblem(cleaned, t.errors);
    if (problem) {
      setStatus({ kind: "error", text: problem });
      return false;
    }
    setSaving(true);
    try {
      const { cv, slug } = await saveToCloud(user, cleaned, t.errors);
      setSaved(JSON.stringify(cleaned));
      const time = new Date().toLocaleTimeString(t.dateLocale, { hour: "numeric", minute: "2-digit" });
      setStatus({
        kind: "ok",
        text: cv === "updated" ? e.savedPending(time, slug!) : cv === "live" ? e.savedLive(time, slug!) : e.savedAt(time),
      });
      return true;
    } catch (err) {
      setStatus({ kind: "error", text: err instanceof Error ? err.message : e.saveFailed });
      return false;
    } finally {
      setSaving(false);
    }
  }, [cleaned, saving, user, t, e]);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if ((ev.metaKey || ev.ctrlKey) && ev.key === "s") {
        ev.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  const startOver = () => {
    if (!window.confirm(e.startOverConfirm)) return;
    setContent(blankCv());
    setStatus({ kind: "idle" });
    setTab("basics");
  };

  const publish = async () => {
    if (!cleaned) return;
    const problem = validateCv(cleaned, t.errors);
    if (problem) return setStatus({ kind: "error", text: problem });
    if (dirty && !(await save())) return;
    router.push("/scene/admin/publish");
  };

  // On a phone, Save goes on to the preview (straight there when nothing changed).
  const saveAndPreview = async () => {
    if (dirty && !(await save())) return;
    router.push("/scene/admin/preview?view=cv&flow=1");
  };

  if (!content) return <div className="admin-empty">{e.loading}</div>;

  const statusText = saving
    ? e.saving
    : status.kind === "error"
      ? status.text
      : dirty
        ? saved
          ? e.unsaved
          : e.notSaved
        : (status.text ?? e.allSaved);

  const p = content.profile;
  const k = content.knowledge;
  const place = placeIn(t, placeById(p.studio.place));
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
    <div className={`admin ${preview && !phone ? "with-preview" : ""}`}>
      <header className="admin-bar">
        <div className="admin-title">
          <strong>{e.title}</strong>
          <span>{p.name || e.untitled}</span>
        </div>
        <div className="admin-account">
          <span title={user.email ?? undefined}>{user.email}</span>
          <button type="button" className="ghost" onClick={() => (!dirty || window.confirm(e.signOutConfirm)) && signOut()}>
            {e.signOut}
          </button>
        </div>
        <p className={`admin-status ${status.kind === "error" ? "error" : !dirty && !saving ? "ok" : ""}`} role="status">
          {statusText}
        </p>
        <div className="admin-actions">
          <BackButton
            fallback="/scene"
            className="ghost"
            confirm={() => !dirty || window.confirm(e.cancelConfirm)}
          >
            {e.cancel}
          </BackButton>
          <button type="button" className="ghost" onClick={startOver}>
            {e.startOver}
          </button>
          <select className="admin-preview-pick" value={preview} onChange={(e) => setPreview(e.target.value as typeof preview)} aria-label={e.previewAria}>
            <option value="studio">{e.previewStudio}</option>
            <option value="cv">{e.previewCv}</option>
            <option value="">{e.hidePreview}</option>
          </select>
          <button type="button" className="ghost" onClick={phone ? saveAndPreview : save} disabled={saving || (!dirty && !phone)}>
            {saving ? e.saving : e.save}
          </button>
          <button type="button" className="primary admin-publish" onClick={publish} disabled={saving}>
            {e.publish}
          </button>
        </div>
      </header>

      <nav className="admin-nav" aria-label={e.sectionsAria}>
        {TABS.map((id) => (
          <button key={id} type="button" className={tab === id ? "on" : ""} onClick={() => setTab(id)}>
            {e.tabs[id]}
          </button>
        ))}
      </nav>

      <main className="admin-form">
        {tab === "basics" && (
          <>
            <h2>{e.tabs.basics}</h2>
            <ImportCv user={user} content={content} onImport={setContent} />
            <div className="grid2">
              <Text label={e.basics.name} value={p.name} onChange={(v) => setP((d) => void (d.name = v))} />
              <Text label={e.basics.initials} value={p.initials} onChange={(v) => setP((d) => void (d.initials = v))} hint={e.basics.initialsHint} />
            </div>
            <Avatar value={p.avatar} onChange={(v) => setP((d) => void (d.avatar = v))} initials={p.initials} />
            <Text label={e.basics.jobTitle} value={p.title} onChange={(v) => setP((d) => void (d.title = v))} />
            <Text label={e.basics.subtitle} value={p.subtitle} onChange={(v) => setP((d) => void (d.subtitle = v))} hint={e.basics.subtitleHint} />
            <Text label={e.basics.tagline} value={p.tagline} onChange={(v) => setP((d) => void (d.tagline = v))} hint={e.basics.taglineHint} />
            <div className="grid2">
              <Text label={e.basics.location} value={p.location} onChange={(v) => setP((d) => void (d.location = v))} />
              <Text label={e.basics.email} type="email" value={p.email} onChange={(v) => setP((d) => void (d.email = v))} />
            </div>
            <div className="grid2">
              <Text
                label={e.basics.phone}
                type="tel"
                value={p.phone ?? ""}
                onChange={(v) => setP((d) => void (d.phone = v))}
                placeholder="+84 90 123 4567"
                hint={e.basics.phoneHint}
              />
              <Text label={e.basics.languages} value={p.languages} onChange={(v) => setP((d) => void (d.languages = v))} />
            </div>
            <Toggle label={e.basics.available} checked={p.available} onChange={(v) => setP((d) => void (d.available = v))} />
            <List
              label={e.basics.stats}
              hint={e.basics.statsHint}
              items={p.stats}
              onChange={(v) => setP((d) => void (d.stats = v))}
              blank={() => ({ value: "", label: "" })}
              title={(s) => [s.value, s.label].filter(Boolean).join(" ")}
              addLabel={e.basics.addStat}
              render={(s, set) => (
                <div className="grid2">
                  <Text label={e.basics.value} value={s.value} onChange={(v) => set({ ...s, value: v })} placeholder="10+" />
                  <Text label={e.basics.label} value={s.label} onChange={(v) => set({ ...s, label: v })} placeholder={e.basics.statPlaceholder} />
                </div>
              )}
            />
            <List
              label={e.basics.links}
              items={p.socials}
              onChange={(v) => setP((d) => void (d.socials = v))}
              blank={() => ({ label: "", title: "", href: "https://" })}
              title={(s) => s.title}
              addLabel={e.basics.addLink}
              render={(s, set) => (
                <>
                  <div className="grid2">
                    <Text label={e.basics.linkName} value={s.title} onChange={(v) => set({ ...s, title: v })} placeholder="LinkedIn" />
                    <Text label={e.basics.shortLabel} value={s.label} onChange={(v) => set({ ...s, label: v })} placeholder="in" />
                  </div>
                  <Text label={e.basics.url} type="url" value={s.href} onChange={(v) => set({ ...s, href: v })} />
                </>
              )}
            />
          </>
        )}

        {tab === "about" && (
          <>
            <h2>{e.tabs.about}</h2>
            <List
              label={e.about.paragraphs}
              hint={e.about.hint}
              items={p.about}
              onChange={(v) => setP((d) => void (d.about = v))}
              blank={() => ""}
              title={(s, i) => e.about.item(i + 1, `${s.slice(0, 60)}${s.length > 60 ? "…" : ""}`)}
              addLabel={e.about.add}
              render={(s, set) => <Text label={e.about.text} value={s} onChange={set} multiline rows={5} />}
            />
          </>
        )}

        {tab === "career" && (
          <>
            <h2>{e.tabs.career}</h2>
            <List
              label={e.career.roles}
              hint={e.career.hint}
              items={p.experience}
              onChange={(v) => setP((d) => void (d.experience = v))}
              blank={() => ({ period: "", role: "", org: "", summary: "" })}
              title={(r) => [r.role, r.period].filter(Boolean).join(", ")}
              addLabel={e.career.add}
              render={(r, set) => (
                <>
                  <div className="grid2">
                    <Text label={e.career.role} value={r.role} onChange={(v) => set({ ...r, role: v })} />
                    <Text label={e.career.period} value={r.period} onChange={(v) => set({ ...r, period: v })} placeholder={e.career.periodPlaceholder} />
                  </div>
                  <Text label={e.career.org} value={r.org} onChange={(v) => set({ ...r, org: v })} />
                  <Text label={e.career.summary} value={r.summary} onChange={(v) => set({ ...r, summary: v })} multiline rows={5} />
                </>
              )}
            />
          </>
        )}

        {tab === "skills" && (
          <>
            <h2>{e.tabs.skills}</h2>
            <List
              label={e.skills.groups}
              hint={e.skills.hint}
              items={p.skills}
              onChange={(v) => setP((d) => void (d.skills = v))}
              blank={() => ({ group: "", items: [] })}
              title={(g) => `${g.group}${g.archived ? e.skills.archived : ""}`}
              addLabel={e.skills.add}
              render={(g, set) => (
                <>
                  <Text label={e.skills.group} value={g.group} onChange={(v) => set({ ...g, group: v })} />
                  <Tags label={e.skills.skills} value={g.items} onChange={(v) => set({ ...g, items: v })} />
                  <Toggle label={e.skills.archive} checked={!!g.archived} onChange={(v) => set({ ...g, archived: v })} />
                </>
              )}
            />
          </>
        )}

        {tab === "certs" && (
          <>
            <h2>{e.tabs.certs}</h2>
            <List
              label={e.certs.list}
              hint={e.certs.hint}
              items={p.certificates}
              onChange={(v) => setP((d) => void (d.certificates = v))}
              blank={(): Certificate => ({ title: "", issuer: "", instructor: "", date: new Date().toISOString().slice(0, 10) })}
              title={(c) => c.title}
              addLabel={e.certs.add}
              render={(c, set) => (
                <>
                  <Text label={e.certs.title} value={c.title} onChange={(v) => set({ ...c, title: v })} />
                  <div className="grid2">
                    <Text label={e.certs.issuer} value={c.issuer} onChange={(v) => set({ ...c, issuer: v })} placeholder="Udemy" />
                    <Text label={e.certs.instructor} value={c.instructor} onChange={(v) => set({ ...c, instructor: v })} />
                  </div>
                  <div className="grid2">
                    <Text label={e.certs.date} type="date" value={c.date} onChange={(v) => set({ ...c, date: v })} />
                    <Text label={e.certs.seal} value={c.badge ?? ""} onChange={(v) => set({ ...c, badge: v })} placeholder="AI" hint={e.certs.sealHint} />
                  </div>
                  <Text label={e.certs.note} value={c.note ?? ""} onChange={(v) => set({ ...c, note: v })} multiline rows={2} />
                </>
              )}
            />
          </>
        )}

        {tab === "projects" && (
          <>
            <h2>{e.tabs.projects}</h2>
            <List
              label={e.projects.groups}
              hint={e.projects.groupsHint}
              items={p.projectGroups}
              onChange={(v) => setP((d) => void (d.projectGroups = v))}
              blank={() => ({ key: `group-${p.projectGroups.length + 1}`, label: "", archived: false })}
              title={(g) => `${g.label || g.key}${g.archived ? e.skills.archived : ""}`}
              addLabel={e.projects.addGroup}
              render={(g, set) => (
                <>
                  <div className="grid2">
                    <Text label={e.projects.heading} value={g.label} onChange={(v) => set({ ...g, label: v })} />
                    <Text
                      label={e.projects.id}
                      value={g.key}
                      onChange={(v) => {
                        const key = v.toLowerCase().replace(/[^a-z0-9-]/g, "");
                        // Keep projects attached when a group's ID changes.
                        setP((d) => {
                          d.projects.forEach((pr) => pr.category === g.key && (pr.category = key));
                          d.projectGroups = d.projectGroups.map((x) => (x.key === g.key ? { ...g, key } : x));
                        });
                      }}
                      hint={e.projects.idHint}
                    />
                  </div>
                  <Toggle label={e.projects.archive} checked={!!g.archived} onChange={(v) => set({ ...g, archived: v })} />
                </>
              )}
            />
            <List
              label={e.projects.list}
              items={p.projects}
              onChange={(v) => setP((d) => void (d.projects = v))}
              blank={() => ({ category: p.projectGroups[0]?.key ?? "", icon: "✨", name: "", description: "" })}
              title={(pr) => `${pr.icon} ${pr.name}`}
              addLabel={e.projects.add}
              render={(pr, set) => (
                <>
                  <div className="grid-icon">
                    <Text label={e.projects.icon} value={pr.icon} onChange={(v) => set({ ...pr, icon: v })} hint={e.projects.iconHint} />
                    <Text label={e.projects.name} value={pr.name} onChange={(v) => set({ ...pr, name: v })} />
                  </div>
                  <Select
                    label={e.projects.group}
                    value={pr.category}
                    onChange={(v) => set({ ...pr, category: v })}
                    options={p.projectGroups.map((g) => ({ value: g.key, label: g.label || g.key }))}
                  />
                  <Text label={e.projects.description} value={pr.description} onChange={(v) => set({ ...pr, description: v })} multiline rows={3} />
                </>
              )}
            />
          </>
        )}

        {tab === "studio" && (
          <>
            <h2>{e.tabs.studio}</h2>
            <p className="admin-lede">{e.studio.lede}</p>
            <div className="f">
              <span className="f-label">{e.studio.place}</span>
              <div className="design-choices">
                {PLACES.map((x) => placeIn(t, x)).map((pl) => (
                  <button
                    key={pl.id}
                    type="button"
                    className={place.id === pl.id ? "on" : ""}
                    aria-pressed={place.id === pl.id}
                    onClick={() => setP((x) => void (x.studio.place = pl.id))}
                  >
                    <strong>{pl.name}</strong>
                    <span>{pl.blurb}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="f">
              <span className="f-label">{e.studio.colours}</span>
              <div className="design-choices">
                {DESIGNS.map((x) => designIn(t, x)).map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className={designById(p.studio.design).id === d.id ? "on" : ""}
                    aria-pressed={designById(p.studio.design).id === d.id}
                    onClick={() => setP((x) => void (x.studio.design = d.id))}
                  >
                    <DesignSwatch design={d} />
                    <strong>{lookNameIn(t, place, d)}</strong>
                    <span>{d.blurb}</span>
                  </button>
                ))}
              </div>
            </div>
            <Text
              label={e.studio.neon}
              multiline
              rows={3}
              value={p.studio.neon}
              onChange={(v) => setP((d) => void (d.studio.neon = v))}
              hint={e.studio.neonHint}
            />
            <Lines
              label={e.studio.terminal}
              value={p.studio.terminal}
              onChange={(v) => setP((d) => void (d.studio.terminal = v))}
              hint={place.id === "room" ? e.studio.terminalHint : e.studio.terminalElsewhere(place.noun, place.objects.work)}
              rows={8}
              mono
            />
            <div className="grid2">
              {[0, 1, 2, 3].map((i) => (
                <Text
                  key={i}
                  label={`${place.drawer} ${i + 1}`}
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
            {SECTIONS.map((id) => {
              const s = p.studio.sections[id];
              const set = (patch: Partial<typeof s>) => setP((d) => void (d.studio.sections[id] = { ...d.studio.sections[id], ...patch }));
              const hasPanelCopy = id !== "about" && id !== "twin";
              return (
                <section key={id} className="list">
                  <div className="list-head">
                    <h3>
                      {place.objects[id]} ({e.sectionWhat[id]})
                    </h3>
                  </div>
                  <div className="card-body plain">
                    <div className="grid2">
                      <Text label={e.studio.dock} value={s.label} onChange={(v) => set({ label: v })} />
                      <Text
                        label={e.studio.hover}
                        value={s.hint}
                        onChange={(v) => set({ hint: v })}
                        hint={place.id === "room" ? undefined : e.studio.shownAs(hintIn(place, id, s.hint))}
                      />
                    </div>
                    {hasPanelCopy && (
                      <>
                        <Text label={e.studio.panelHeading} value={s.title} onChange={(v) => set({ title: v })} />
                        <Text label={e.studio.panelIntro} value={s.lede} onChange={(v) => set({ lede: v })} multiline rows={2} />
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
            <h2>{e.tabs.twin}</h2>
            <Toggle
              label={e.twin.toggle}
              checked={p.twin.enabled !== false}
              onChange={(v) => setP((d) => void (d.twin.enabled = v))}
              hint={e.twin.toggleHint}
            />
            <p className="premium-note">
              {t.premium.note} <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </p>
            <p className="admin-lede">{e.twin.lede(PREVIEW_QUESTIONS)}</p>
            <Text label={e.twin.greeting} value={p.twin.greeting} onChange={(v) => setP((d) => void (d.twin.greeting = v))} multiline rows={2} />
            <Lines label={e.twin.suggestions} value={p.twin.suggestions} onChange={(v) => setP((d) => void (d.twin.suggestions = v))} rows={4} />

            <h2 className="sub">{e.twin.knows}</h2>
            <Text
              label={e.twin.goal}
              value={k.currentGoal}
              onChange={(v) => setK((d) => void (d.currentGoal = v))}
              multiline
              rows={2}
              placeholder={e.twin.goalPlaceholder}
              hint={e.twin.goalHint}
            />
            <Text
              label={e.twin.summary}
              value={k.summary}
              onChange={(v) => setK((d) => void (d.summary = v))}
              multiline
              rows={4}
              hint={e.twin.summaryHint}
            />
            <Text
              label={e.twin.rules}
              value={k.rules}
              onChange={(v) => setK((d) => void (d.rules = v))}
              multiline
              rows={4}
              hint={e.twin.rulesHint}
            />
          </>
        )}

      </main>

      {preview && !phone && (
        <aside className="admin-preview">
          <div className="preview-head">
            <span>{e.preview}</span>
            <a href={`/scene/admin/preview?view=${preview}`} target="_blank" rel="noopener noreferrer">
              {e.openTab}
            </a>
          </div>
          <iframe src={`/scene/admin/preview?view=${preview}`} title={e.frameTitle} />
        </aside>
      )}
    </div>
  );
}

// The photo is shrunk in the browser and stored in the CV itself as a small
// JPEG data URL, so it publishes with the rest of the CV.
const PHOTO_SIZE = 360;

function shrinkPhoto(file: File, unreadable: string): Promise<string> {
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
      reject(new Error(unreadable));
    };
    img.src = url;
  });
}

function Avatar({ value, onChange, initials }: { value: string; onChange: (v: string) => void; initials: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const t = useT().editor.photo;

  const pick = async (file: File) => {
    setError("");
    try {
      onChange(await shrinkPhoto(file, t.unreadable));
    } catch (e) {
      setError(e instanceof Error ? e.message : t.failed);
    }
  };

  return (
    <div className="f avatar-field">
      <span className="f-label">{t.label}</span>
      <div className="avatar-row">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="avatar-img" />
        ) : (
          <span className="avatar-img avatar-initials">{initials}</span>
        )}
        <div className="avatar-buttons">
          <button type="button" className="ghost" onClick={() => input.current?.click()}>
            {value ? t.replace : t.add}
          </button>
          {value && (
            <button type="button" className="ghost" onClick={() => onChange("")}>
              {t.initials}
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
      <p className="f-hint">{error || t.hint}</p>
    </div>
  );
}

// Fill in the editor from a CV PDF. The PDF is read here in the browser; only
// its text goes to /api/import-cv, and nothing is stored. What the CV has replaces
// what's in the editor; the blank template's sample text is cleared even
// where the CV has nothing, so it doesn't end up in the CV or the twin.
function mergeImport(c: Content, cv: ImportedCv, projectsLabel: string): Content {
  const n = structuredClone(c);
  const blank = blankCv();
  const { suggestions, projects, ...fields } = cv.profile;
  const p = n.profile as unknown as Record<string, unknown>;
  const template = blank.profile as unknown as Record<string, unknown>;
  for (const key of ["name", "initials", "title", "subtitle", "tagline", "location", "email", "languages"] as const)
    if (p[key] === template[key]) n.profile[key] = "";
  for (const key of ["stats", "about", "experience", "skills", "certificates", "socials"] as const)
    if (JSON.stringify(p[key]) === JSON.stringify(template[key])) n.profile[key] = [];
  if (JSON.stringify(n.profile.projects) === JSON.stringify(blank.profile.projects)) n.profile.projects = [];
  Object.assign(n.profile, fields);

  if (projects) {
    // Everything from the CV goes in one live group on the monitor.
    const group = n.profile.projectGroups.find((g) => !g.archived) ?? { key: "work", label: projectsLabel };
    n.profile.projectGroups = [group];
    n.profile.projects = projects.map((pr) => ({ ...pr, category: group.key }));
  } else if (!n.profile.projects.length) {
    n.profile.projectGroups = n.profile.projectGroups.filter((g) => !g.archived);
  }
  if (suggestions) n.profile.twin.suggestions = suggestions;
  Object.assign(n.knowledge, cv.knowledge);
  return n;
}

function ImportCv({ user, content, onImport }: { user: User; content: Content; onImport: (c: Content) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ error: boolean; text: string } | null>(null);
  const t = useT().editor.import;

  const pick = async (file: File) => {
    if (file.type !== "application/pdf") return setNote({ error: true, text: t.notPdf });
    if (file.size > MAX_PDF_MB * 1024 * 1024) return setNote({ error: true, text: t.tooBig(MAX_PDF_MB) });
    if (!window.confirm(t.confirm)) return;
    setBusy(true);
    setNote(null);
    try {
      let text: string;
      try {
        text = await pdfText(file);
      } catch {
        return setNote({ error: true, text: t.unreadable });
      }
      if (!text.trim()) return setNote({ error: true, text: t.nothing });
      const res = await fetch("/api/import-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error((await res.text()) || t.failed);
      const cv = (await res.json()) as ImportedCv;
      const found = Object.keys(cv.profile).length + Object.keys(cv.knowledge).length;
      if (!found) return setNote({ error: true, text: t.nothing });
      onImport(mergeImport(content, cv, t.projects));
      setNote({ error: false, text: t.done(found) });
    } catch (err) {
      setNote({ error: true, text: err instanceof Error ? err.message : t.failed });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="import-cv">
      <div>
        <h3>{t.title}</h3>
        <p className="f-hint">{t.lede}</p>
      </div>
      <button type="button" className="primary" onClick={() => input.current?.click()} disabled={busy}>
        {busy ? t.reading : t.pick}
      </button>
      <input
        ref={input}
        type="file"
        accept="application/pdf"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) pick(f);
          e.target.value = "";
        }}
      />
      {note && (
        <p className={note.error ? "f-error" : "f-ok"} role="status">
          {note.text}
        </p>
      )}
    </section>
  );
}
