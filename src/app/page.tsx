import { Site } from "@/components/Site";
import { MUSIC } from "@/data/music";
import { SITE } from "@/data/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  name: SITE.name,
  url: SITE.url,
  genre: ["Hard Techno", "Techno"],
  description: SITE.description,
  foundingLocation: { "@type": "Place", name: "Castelldefels, Barcelona, Spain" },
  member: SITE.members.map((m) => ({ "@type": "Person", name: m })),
  sameAs: [SITE.links.soundcloud, SITE.links.instagram],
  track: MUSIC.filter((m) => m.url && m.kind === "original").map((m) => ({
    "@type": "MusicRecording",
    name: m.title,
    url: m.url,
  })),
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Site />
    </>
  );
}
