import Hero from "@/components/sections/hero/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import DesignGallery from "@/components/sections/DesignGallery";
import { designItems } from "@/data/design";
import WorkGrid from "@/components/sections/WorkGrid";
import SideProjects from "@/components/sections/SideProjects";
import SiteFooter from "@/components/layout/SiteFooter";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <About />
        <Skills />
        <WorkGrid />
        <SideProjects />
        <DesignGallery designItems={designItems} />
      </main>
      <SiteFooter />
    </>
  );
}

