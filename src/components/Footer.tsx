"use client";

import { SITE } from "@/data/site";
import { scrollToY } from "@/lib/engine";

export function Footer() {
  return (
    <footer className="footer" data-section="end" data-label="END" data-idx="06">
      <div className="footer__big" aria-hidden="true">
        END OF TRANSMISSION
      </div>
      <div className="footer__grid mono">
        <div>
          <span className="footer__k">SB—SYS</span>
          <span>© {SITE.year} SPICY BOYS</span>
          <span>
            {SITE.city} / {SITE.region}
          </span>
        </div>
        <div>
          <span className="footer__k">LINKS</span>
          <a href={SITE.links.soundcloud} target="_blank" rel="noopener noreferrer" data-cursor="open">
            SOUNDCLOUD ↗
          </a>
          <a href={SITE.links.instagram} target="_blank" rel="noopener noreferrer" data-cursor="follow">
            INSTAGRAM ↗
          </a>
        </div>
        <div className="footer__keys">
          <span className="footer__k">INPUT</span>
          <span>
            <kbd>1</kbd>—<kbd>5</kbd> JUMP
          </span>
          <span>
            <kbd>K</kbd> PLAY / PAUSE
          </span>
          <span>
            <kbd>G</kbd> GRID
          </span>
          <span className="footer__secret">
            <kbd>?</kbd> ASK THE BOOTH
          </span>
        </div>
        <div>
          <button className="footer__top" onClick={() => scrollToY(0)}>
            BACK TO TOP ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
