import Hero from "@/components/sections/hero/Hero";
import ScrollHero from "@/components/sections/hero/ScrollHero";
import ConceptScenes from "@/components/sections/concept/ConceptScenes";
import AboutStory from "@/components/sections/AboutStory";
import WorkStory from "@/components/sections/WorkStory";
import DesignStory from "@/components/sections/DesignStory";
import ContactStory from "@/components/sections/ContactStory";


import DesignGallery from "@/components/sections/DesignGallery";
import { designItems } from "@/data/design";
import ProjectCarousel from "@/components/sections/ProjectCarousel";
import SideProjects from "@/components/sections/SideProjects";
import SiteFooter from "@/components/layout/SiteFooter";

// 하단 콘텐츠를 다시 표시하려면 true로 변경합니다.
const showLowerSections = false;
// true: 히어로 → 모래 전환·선인장 컨셉 장면 → 소개·기술 → 프로젝트.
// false: 이전 구성(히어로 → 날아오는 데모 → 소개·기술 → 프로젝트).
const showConceptIntro = true;

export default function Home() {
  return (
    <>
      <main>
        {showConceptIntro ? <>
        {/* All the page sections (about, projects, design, contact) live in a browser window that rises out of the desert after the story. */}
        <ConceptScenes content={<><AboutStory /><WorkStory /><DesignStory designItems={designItems} /><ContactStory /></>}><Hero showExtras={false} showTitle={false} desert /></ConceptScenes>
        </> : <>
        <ScrollHero><Hero showExtras={false} showTitle={false} /></ScrollHero>
        <ProjectCarousel />
        </>}
        {showLowerSections && <>



        <SideProjects />
        <DesignGallery designItems={designItems} />
        </>}
      </main>
      {showLowerSections && <SiteFooter />}
    </>
  );
}

