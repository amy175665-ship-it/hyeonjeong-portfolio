export type ProjectLinksData = { website?: string; github?: string; figma?: string };

export type Project = {
  featured: boolean;
  placeholder: boolean;
  categoryTags: string[];
  featureTags: string[];
  links: ProjectLinksData;
  challenges: { problem: string; solution: string }[];
  slug: string;
  title: string;
  tagline: string;
  type: "Personal" | "Team" | "Clone" | "Redesign";
  stack: string[];
  size: "large" | "small";
  image: string;
  desktopImage: string;
  mobileImage: string;
  duration: string;
  scope: string;
  responsive: string;
  features: string[];
  // Colour of the project's full-screen panel (background tint, accents). Optional: the stage colour is used without it.
  accent?: string;
  // Big title on the full-screen panel, one entry per line (the title is used as one line without it).
  headline?: string[];
};

// Main projects: real project names and stacks; screens, links and the detail-page write-up are still to come, so
// placeholder stays true (labelled "작성 예시") until they are filled in.
// To finish one: put screenshots in public/images/projects/<slug>/ (desktop and mobile, WebP), point image /
// desktopImage / mobileImage at them, rewrite the text fields from real experience and set placeholder: false.
export const projects: Project[] = [
  {
    slug: "hoduit",
    headline: ["HODUIT"],
    accent: "#7f9657",
    featured: true,
    placeholder: true,
    categoryTags: ["디자인+퍼블리싱","개인"],
    featureTags: ["Figma 디자인","마크업","JS 인터랙션","접근성"],
    title: "HODUIT",
    tagline: "디저트 커뮤니티 — Figma 디자인부터 퍼블리싱까지 직접 만든 프로젝트",
    type: "Personal",
    stack: ["Figma","HTML","CSS","JavaScript"],
    size: "large",
    image: "/images/project-desktop-placeholder.svg",
    desktopImage: "/images/project-desktop-placeholder.svg",
    mobileImage: "/images/project-mobile-placeholder.svg",
    links: {},
    duration: "실제 제작 기간 입력 예정",
    scope: "작성 예시: 맡은 범위(디자인·마크업·스타일·스크립트)와 역할을 적어 주세요.",
    responsive: "작성 예시: 화면 크기별 배치 기준과 확인한 해상도를 적어 주세요.",
    features: ["작성 예시: 직접 구현한 기능을 하나씩 적어 주세요."],
    challenges: [{"problem":"작성 예시: 작업 중 겪은 문제를 적어 주세요.","solution":"작성 예시: 해결 방법과 확인 결과를 적어 주세요."}],
  },
  {
    slug: "jajak",
    headline: ["JAJAK"],
    accent: "#e96b5a",
    featured: true,
    placeholder: true,
    categoryTags: ["팀","Git 협업"],
    featureTags: ["역할 분담","담당 페이지","Git 협업","GSAP"],
    title: "JAJAK",
    tagline: "전통주 큐레이션 쇼핑몰 — React 팀 프로젝트",
    type: "Team",
    stack: ["React","Git","GSAP"],
    size: "large",
    image: "/images/project-desktop-placeholder.svg",
    desktopImage: "/images/project-desktop-placeholder.svg",
    mobileImage: "/images/project-mobile-placeholder.svg",
    links: {},
    duration: "실제 제작 기간 입력 예정",
    scope: "작성 예시: 맡은 범위(디자인·마크업·스타일·스크립트)와 역할을 적어 주세요.",
    responsive: "작성 예시: 화면 크기별 배치 기준과 확인한 해상도를 적어 주세요.",
    features: ["작성 예시: 직접 구현한 기능을 하나씩 적어 주세요."],
    challenges: [{"problem":"작성 예시: 작업 중 겪은 문제를 적어 주세요.","solution":"작성 예시: 해결 방법과 확인 결과를 적어 주세요."}],
  },
  {
    slug: "deepfine-copy",
    headline: ["DEEPFINE","COPY"],
    accent: "#e9a33a",
    featured: true,
    placeholder: true,
    categoryTags: ["반응형","퍼블리싱"],
    featureTags: ["시맨틱 마크업","접근성","디자인 재현"],
    title: "DEEPFINE COPY",
    tagline: "웹사이트 클론 — HTML/SCSS로 원본 디자인을 반응형으로 재현",
    type: "Clone",
    stack: ["HTML","SCSS","JavaScript"],
    size: "large",
    image: "/images/project-desktop-placeholder.svg",
    desktopImage: "/images/project-desktop-placeholder.svg",
    mobileImage: "/images/project-mobile-placeholder.svg",
    links: {},
    duration: "실제 제작 기간 입력 예정",
    scope: "작성 예시: 맡은 범위(디자인·마크업·스타일·스크립트)와 역할을 적어 주세요.",
    responsive: "작성 예시: 화면 크기별 배치 기준과 확인한 해상도를 적어 주세요.",
    features: ["작성 예시: 직접 구현한 기능을 하나씩 적어 주세요."],
    challenges: [{"problem":"작성 예시: 작업 중 겪은 문제를 적어 주세요.","solution":"작성 예시: 해결 방법과 확인 결과를 적어 주세요."}],
  },
];


// Main/side placement is editorial, independent of Personal/Clone/Redesign.
export const mainProjects = projects.filter((project) => project.featured);

// Side projects: a plain list after the main project panels; a row with a url opens that site in a new tab (no detail
// page). Names, descriptions and tags come from the project list; add each site's url and set placeholder: false once
// the description is final.
export type SideProject = { title: string; description: string; tags: string[]; url?: string; placeholder: boolean };

export const sideProjects: SideProject[] = [
  { title: "MORPH", description: "가구·오브제 편집숍 — 상품 데이터를 목록·필터·상세·장바구니로 잇는 React 개인 프로젝트", tags: ["React", "Router", "Context", "GSAP", "개인"], placeholder: true },
  { title: "NODE", description: "상품 사이트 — 상품 JSON 구조를 정리하고 필터·정렬 로직을 공통화한 팀 프로젝트", tags: ["JavaScript", "JSON", "필터·정렬", "팀"], placeholder: true },
  { title: "CHAMVERSE", description: "Vanilla JavaScript로 서비스 화면을 구현한 팀 프로젝트", tags: ["Vanilla JS", "DOM", "Event", "팀"], placeholder: true },
  { title: "UI LAB", description: "JavaScript 실습 모음", tags: ["Calculator", "Weather API", "Canvas Drawing", "Bubble", "Brick Game", "Board"], placeholder: true },
];
