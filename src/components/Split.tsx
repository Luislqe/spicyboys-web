import type { CSSProperties } from "react";

/** Splits text into per-character spans (for staggered motion). Screen readers get the plain string. */
export function Split({
  text,
  className = "",
  charClass = "ch",
  offset = 0,
}: {
  text: string;
  className?: string;
  charClass?: string;
  offset?: number;
}) {
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      {Array.from(text).map((c, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={c === " " ? `${charClass} ${charClass}--sp` : charClass}
          style={{ "--i": i + offset } as CSSProperties}
        >
          {c === " " ? " " : c}
        </span>
      ))}
    </span>
  );
}
