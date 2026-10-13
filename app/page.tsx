import Hero from "@/components/sections/hero/Hero";
import ConceptScenes from "@/components/sections/concept/ConceptScenes";
import AboutStory from "@/components/sections/AboutStory";
import WorkStory from "@/components/sections/WorkStory";
import GrowStory from "@/components/sections/GrowStory";
import DesignStory from "@/components/sections/DesignStory";
import ContactStory from "@/components/sections/ContactStory";
import { designItems } from "@/data/design";

// Hero → sand cover and cactus story → the sand uncovers a browser window holding the page sections, which then
// dissolves into the full-screen layout (ConceptScenes, WindowFrame). Each top-level child of the window is one part
// of the story: about (ABSORB), projects (BUILD), design (GROW), contact (BLOOM); see data/stages.ts. The GROW sand circle
// (GrowStory) has no menu entry: it is the way into the design part, so the two share one part (the DESIGN tab).
export default function Home() {
  return (
    <main>
      <ConceptScenes content={<><AboutStory /><WorkStory /><div><GrowStory /><DesignStory designItems={designItems} /></div><ContactStory /></>}>
        <Hero showTitle={false} desert />
      </ConceptScenes>
    </main>
  );
}
