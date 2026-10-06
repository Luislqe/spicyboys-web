import type { Metadata } from "next";
import { EventsPage } from "@/components/EventsPage";

export const metadata: Metadata = {
  title: "Eventos",
  description: "Próximos y pasados eventos de GRUVINK en Barcelona: KORA y más.",
  alternates: { canonical: "/eventos" },
};

export default function Page() {
  return <EventsPage />;
}
