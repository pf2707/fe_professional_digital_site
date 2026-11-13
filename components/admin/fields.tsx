"use client";

// Small form kit for the admin editor. Every field is controlled: it gets a
// value and reports a new value; the editor owns the state.

import { useEffect, useId, useState, type ReactNode } from "react";

export function Field({ label, hint, children, id }: { label: string; hint?: string; children: ReactNode; id?: string }) {
  return (
    <div className="f">
      <label className="f-label" htmlFor={id}>
        {label}
      </label>
      {children}
      {hint && <p className="f-hint">{hint}</p>}
    </div>
  );
}

export function Text({
  label,
  value,
  onChange,
  hint,
  multiline,
  rows = 3,
  placeholder,
  type = "text",
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "url" | "date";
  mono?: boolean;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} id={id}>
      {multiline ? (
        <textarea
          id={id}
          className={mono ? "mono" : undefined}
          value={value}
          rows={rows}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input id={id} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  );
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <div className="f">
      <label className="f-toggle">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span>{label}</span>
      </label>
      {hint && <p className="f-hint">{hint}</p>}
    </div>
  );
}

// A list of strings edited as one textarea, one item per line.
export function Lines({
  label,
  value,
  onChange,
  hint,
  rows = 5,
  mono,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  hint?: string;
  rows?: number;
  mono?: boolean;
}) {
  return (
    <Text
      label={label}
      hint={hint ?? "One per line."}
      value={value.join("\n")}
      onChange={(v) => onChange(v.split("\n"))}
      multiline
      rows={rows}
      mono={mono}
    />
  );
}

// A list of strings edited as comma-separated text. Keeps its own draft so
// typing a comma doesn't jump the caret.
export function Tags({ label, value, onChange, hint }: { label: string; value: string[]; onChange: (v: string[]) => void; hint?: string }) {
  const id = useId();
  const [draft, setDraft] = useState(value.join(", "));
  useEffect(() => {
    const parsed = draft.split(",").map((s) => s.trim()).filter(Boolean);
    if (parsed.join("\u0000") !== value.join("\u0000")) setDraft(value.join(", "));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <Field label={label} hint={hint ?? "Separate with commas."} id={id}>
      <input
        id={id}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean));
        }}
      />
    </Field>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const id = useId();
  return (
    <Field label={label} id={id}>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {!options.some((o) => o.value === value) && <option value={value}>{value || "Choose…"}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

// A reorderable list of objects. Each item is a collapsible card.
export function List<T>({
  label,
  hint,
  items,
  onChange,
  blank,
  title,
  render,
  addLabel = "Add",
}: {
  label: string;
  hint?: string;
  items: T[];
  onChange: (items: T[]) => void;
  blank: () => T;
  title: (item: T, index: number) => string;
  render: (item: T, set: (next: T) => void) => ReactNode;
  addLabel?: string;
}) {
  // Small lists start open; long ones (like projects) start collapsed.
  const [openSet, setOpenSet] = useState<Set<number>>(
    () => new Set(items.length <= 4 ? items.map((_, i) => i) : []),
  );
  const toggle = (i: number, open: boolean) =>
    setOpenSet((s) => {
      const n = new Set(s);
      if (open) n.add(i);
      else n.delete(i);
      return n;
    });

  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setOpenSet((s) => {
      const n = new Set<number>();
      s.forEach((k) => n.add(k === i ? j : k === j ? i : k));
      return n;
    });
  };
  const remove = (i: number) => {
    if (!window.confirm(`Remove “${title(items[i], i) || "this item"}”?`)) return;
    onChange(items.filter((_, k) => k !== i));
    setOpenSet((s) => {
      const n = new Set<number>();
      s.forEach((k) => k !== i && n.add(k > i ? k - 1 : k));
      return n;
    });
  };

  return (
    <section className="list">
      <div className="list-head">
        <h3>{label}</h3>
        <span className="count">{items.length}</span>
      </div>
      {hint && <p className="f-hint">{hint}</p>}
      {items.map((item, i) => (
        <details key={i} className="card" open={openSet.has(i)} onToggle={(e) => toggle(i, e.currentTarget.open)}>
          <summary>
            <span className="card-title">{title(item, i) || <em>Untitled</em>}</span>
            <span className="card-actions" onClick={(e) => e.preventDefault()}>
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                ↑
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down">
                ↓
              </button>
              <button type="button" className="danger" onClick={() => remove(i)} aria-label="Remove">
                Remove
              </button>
            </span>
          </summary>
          <div className="card-body">
            {render(item, (next) => onChange(items.map((it, k) => (k === i ? next : it))))}
          </div>
        </details>
      ))}
      <button
        type="button"
        className="add"
        onClick={() => {
          onChange([...items, blank()]);
          toggle(items.length, true);
        }}
      >
        + {addLabel}
      </button>
    </section>
  );
}
