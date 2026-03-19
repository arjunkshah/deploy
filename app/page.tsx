import { HomeHero } from "@/components/HomeHero";
import { SiteHeader } from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

export default async function Home() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <SiteHeader />
      <HomeHero />
    </div>
  );
}
