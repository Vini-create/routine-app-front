import { AlfredShowcase } from "@/components/landing/AlfredShowcase";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingLoadGate } from "@/components/landing/LandingLoadGate";
import { ProductIntroduction } from "@/components/landing/ProductIntroduction";
import { ScrollVideoStory } from "@/components/landing/ScrollVideoStory";

export default function LandingPage() {
  return (
    <LandingLoadGate>
      <main className="winLandingPage">
        <LandingHeader />
        <ScrollVideoStory />
        <div className="storyToProductTransition" aria-hidden="true" />
        <ProductIntroduction />
        <FeatureShowcase />
        <AlfredShowcase />
        <FinalCTA />
        <LandingFooter />
      </main>
    </LandingLoadGate>
  );
}
