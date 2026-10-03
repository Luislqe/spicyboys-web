"use client";

import { useRef, useState } from "react";
import { SITE } from "@/data/site";
import { useMagnetic } from "@/lib/hooks";

const RING = "FOLLOW THE NOISE • @SPICYBOYS.GVK • INSTAGRAM • ";

/** FOLLOW THE NOISE — magnetic Instagram disc. Hovering it turns the page grain up. */
export function Follow() {
  const btn = useRef<HTMLAnchorElement>(null);
  const [hot, setHot] = useState(false);
  useMagnetic(btn, 0.32, 110);

  const heat = (v: boolean) => {
    setHot(v);
    document.documentElement.classList.toggle("is-noisy", v);
  };

  return (
    <section
      id="follow"
      className={`follow ${hot ? "is-hot" : ""}`}
      data-section="follow"
      data-label="FOLLOW"
      data-idx="05"
      aria-labelledby="follow-title"
    >
      <div className="follow__meta mono" data-reveal>
        <span>[05] OUTPUT</span>
        <span>INSTAGRAM · {SITE.links.instagramHandle.toUpperCase()}</span>
      </div>

      <h2 id="follow-title" className="follow__title">
        <span className="follow__w follow__w--1" data-reveal>FOLLOW</span>
        <span className="follow__w follow__w--2" data-reveal>THE</span>
        <span className="follow__w follow__w--3" data-reveal>NOISE</span>
      </h2>

      <div className="follow__row">
        <a
          className="follow__handle"
          href={SITE.links.instagram}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="follow"
          data-reveal
        >
          {SITE.links.instagramHandle}
        </a>

        <a
          ref={btn}
          className="follow__disc"
          href={SITE.links.instagram}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="follow"
          aria-label={`Follow ${SITE.links.instagramHandle} on Instagram`}
          onPointerEnter={() => heat(true)}
          onPointerLeave={() => heat(false)}
          onFocus={() => heat(true)}
          onBlur={() => heat(false)}
        >
          <svg className="follow__ring" viewBox="0 0 200 200" aria-hidden="true">
            <defs>
              <path id="ring-path" d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0" />
            </defs>
            <text>
              <textPath href="#ring-path">{RING}</textPath>
            </text>
          </svg>
          <span className="follow__disc-core mono">
            <span>INSTAGRAM</span>
            <b aria-hidden="true">→</b>
          </span>
        </a>
      </div>
    </section>
  );
}
