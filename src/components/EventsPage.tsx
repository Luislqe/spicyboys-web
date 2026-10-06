"use client";

import { useState, type CSSProperties } from "react";
import { EVENTS, pastEvents, upcomingEvents, type GvkEvent } from "@/data/events";
import { SITE } from "@/data/site";
import { usePageFx } from "@/lib/pagefx";
import { EventRow } from "./EventRow";
import { Footer } from "./Footer";
import { SectionHead } from "./SectionHead";
import { Split } from "./Split";

type Filter = "all" | "upcoming" | "past";

const yearOf = (e: GvkEvent) => e.date?.slice(0, 4) ?? (/\d{4}/.exec(e.when ?? "")?.[0] || "PRÓXIMAMENTE");

/** /eventos — the full archive of GRUVINK nights, grouped by year. */
export function EventsPage() {
  usePageFx();
  const [filter, setFilter] = useState<Filter>("all");
  const up = upcomingEvents();
  const past = pastEvents();
  const list = filter === "upcoming" ? up : filter === "past" ? past : [...up, ...past];

  const groups = new Map<string, GvkEvent[]>();
  list.forEach((e) => {
    const y = e.status === "upcoming" ? "PRÓXIMOS" : yearOf(e);
    if (!groups.has(y)) groups.set(y, []);
    groups.get(y)!.push(e);
  });

  const tabs: [Filter, string, number][] = [
    ["all", "TODOS", EVENTS.length],
    ["upcoming", "PRÓXIMOS", up.length],
    ["past", "PASADOS", past.length],
  ];

  return (
    <>
      <main id="main" className="evp" data-section="events" data-label="EVENTOS" data-idx="03">
        <SectionHead idx="03" label="EVENTOS" note="GRUVINK NIGHTS / ARCHIVE" />
        <header className="evp__head">
          <h1 className="evp__title" data-reveal data-fit data-fit-max="22">
            <Split text="EVENTOS" className="fit-in" />
          </h1>
          <div className="evp__tabs mono" role="tablist" aria-label="Filtrar eventos">
            {tabs.map(([k, label, n]) => (
              <button
                key={k}
                role="tab"
                aria-selected={filter === k}
                className={filter === k ? "is-on" : ""}
                onClick={() => setFilter(k)}
                data-cursor="hover"
              >
                {label} <span>{String(n).padStart(2, "0")}</span>
              </button>
            ))}
          </div>
        </header>

        <div className="evp__panel">
          {[...groups.entries()].map(([year, evs], gi) => (
            <section key={year} className="evp__group" data-reveal style={{ "--i": gi } as CSSProperties}>
              <h2 className="ev-label mono">
                <i aria-hidden="true" /> {year}
              </h2>
              <ul className="ev-list ev-list--past">
                {evs.map((e) => (
                  <EventRow key={e.id} e={e} />
                ))}
              </ul>
            </section>
          ))}
          {list.length === 0 && <p className="evp__empty mono">NO HAY EVENTOS AQUÍ TODAVÍA.</p>}
          <p className="evp__note mono">
            Fechas nuevas, line ups y entradas se anuncian primero en{" "}
            <a href={SITE.links.instagram} target="_blank" rel="noopener noreferrer">
              {SITE.links.instagramHandle} ↗
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
