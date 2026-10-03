/** HUD-style section header: [02] ────── LABEL ─── note */
export function SectionHead({ idx, label, note }: { idx: string; label: string; note?: string }) {
  return (
    <div className="shead" data-reveal>
      <span className="shead__idx">[{idx}]</span>
      <span className="shead__rule" aria-hidden="true" />
      <span className="shead__label">{label}</span>
      <span className="shead__rule shead__rule--short" aria-hidden="true" />
      {note && <span className="shead__note">{note}</span>}
    </div>
  );
}
