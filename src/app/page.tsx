import { Site } from "@/components/Site";
import { ARTISTS } from "@/data/artists";
import { MUSIC } from "@/data/music";
import { SITE } from "@/data/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  name: SITE.name,
  url: SITE.url,
  genre: ["Electronic", "Techno"],
  description: SITE.description,
  foundingLocation: { "@type": "Place", name: "Barcelona, Spain" },
  member: ARTISTS.map((a) => ({ "@type": "MusicGroup", name: a.name })),
  sameAs: [SITE.links.instagram, SITE.links.soundcloud, SITE.links.youtube],
  track: MUSIC.filter((m) => m.url).map((m) => ({
    "@type": "MusicRecording",
    name: m.artist ? `${m.title} / ${m.artist}` : m.title,
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
