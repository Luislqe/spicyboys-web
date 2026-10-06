"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { invalidateRects } from "@/lib/engine";
import { Background } from "./Background";
import { Cursor } from "./Cursor";
import { Extras } from "./Extras";
import { HUD } from "./HUD";
import { Loader } from "./Loader";
import { Player } from "./Player";

/**
 * Everything that lives across pages: entry screen, background, cursor, HUD,
 * the radio (so the music keeps playing when you move between pages) and extras.
 */
export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname() ?? "/";
  useEffect(() => {
    invalidateRects();
  }, [path]);
  return (
    <>
      <Loader />
      <Background route={path} />
      <Cursor />
      <HUD />
      {children}
      <Player />
      <Extras />
    </>
  );
}
