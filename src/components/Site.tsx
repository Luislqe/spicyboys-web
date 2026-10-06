"use client";

import { About } from "./About";
import { Artists } from "./Artists";
import { Events } from "./Events";
import { Follow } from "./Follow";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { Marquee } from "./Marquee";
import { Music } from "./Music";
import { Visuals } from "./Visuals";
import { usePageFx } from "@/lib/pagefx";

export function Site() {
  usePageFx();
  return (
    <>
      <main id="main">
        <Hero />
        <div className="bands" aria-hidden="true">
          <Marquee
            variant="solid"
            speed={70}
            followScroll
            items={["GRUVINK", "PODCAST", "KORA", "BARCELONA"]}
          />
          <Marquee
            variant="outline"
            speed={45}
            reverse
            followScroll
            sep="✕"
            items={["SPICY BOYS", "IZIAL", "DBØ", "AVRAXAS", "CHAMÓX", "NANDES"]}
          />
          <Marquee
            variant="tape"
            speed={120}
            sep="■"
            items={[
              "GROOVE",
              "INK",
              "AFTER DARK",
              "NO VIP",
              "PODCAST Nº26 OUT NOW",
              "GROOVE",
              "INK",
              "AFTER DARK",
              "NO VIP",
              "PODCAST Nº26 OUT NOW",
            ]}
          />
        </div>
        <Music />
        <Marquee
          className="mq--divider"
          variant="mono"
          speed={40}
          reverse
          sep="//"
          items={Array.from({ length: 4 }, () => ["GVK—SYS", "41.3874°N 2.1686°E", "SIGNAL OK", "ARTISTS INCOMING"]).flat()}
        />
        <Artists />
        <Events />
        <Visuals />
        <About />
        <Follow />
      </main>
      <Footer />
    </>
  );
}
