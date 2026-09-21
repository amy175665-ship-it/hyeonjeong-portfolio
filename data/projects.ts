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
};

// All projects below are writing examples, not completed work.
// Replace descriptions with verified experience and images with actual screenshots.
export const projects: Project[] = [
  {
    slug: "responsive-cafe",
    featured: true,
    placeholder: true,
    categoryTags: ["반응형","개인 프로젝트"],
    featureTags: ["모바일메뉴","카테고리필터","앵커이동"],
    title: "PLACEHOLDER — 카페 소개 웹사이트",
    tagline: "매장 소개와 메뉴를 담는 반응형 사이트 구성 예시",
    type: "Personal",
    stack: ["HTML", "CSS", "JavaScript"],
    size: "large",
    image: "/images/project-desktop-placeholder.svg",
    desktopImage: "/images/project-desktop-placeholder.svg",
    mobileImage: "/images/project-mobile-placeholder.svg",
    links: {},
    duration: "실제 제작 기간 입력 예정",
    scope: "작성 예시: 개인 작업으로 시각 디자인을 직접 구성하고 마크업·반응형·메뉴 인터랙션을 구현. 실제 담당 범위로 교체해 주세요.",
    responsive: "작성 예시: 메뉴 카드는 768px 이상에서 3열, 미만에서 1열로 배치. 카드 제목은 두 줄로 제한하고 제목 영역의 최소 높이를 맞춰 설명 시작 위치를 통일.",
    features: ["모바일 메뉴: 버튼으로 열고 닫기, aria-expanded 상태 동기화", "메뉴 카테고리 필터: 전체·음료·디저트 선택에 따라 목록 변경", "섹션 이동: 고정 헤더 높이를 고려한 앵커 이동"],
    challenges: [{ problem: "작성 예시: 고정 헤더 때문에 메뉴에서 이동한 섹션의 제목이 가려짐.", solution: "작성 예시: html에 scroll-padding-top을 지정하고, 헤더가 두 줄이 되는 모바일 화면에서도 제목이 보이는지 확인. 실제로 겪은 문제와 확인 결과로 교체해 주세요." }],
  },
  {
    slug: "product-catalog",
    featured: true,
    placeholder: true,
    categoryTags: ["반응형","클론코딩"],
    featureTags: ["상품검색","카테고리필터","가격정렬"],
    title: "PLACEHOLDER — 상품 목록 페이지",
    tagline: "검색과 필터를 연습하는 상품 목록 구성 예시",
    type: "Clone",
    stack: ["React", "CSS"],
    size: "small",
    image: "/images/project-desktop-placeholder.svg",
    desktopImage: "/images/project-desktop-placeholder.svg",
    mobileImage: "/images/project-mobile-placeholder.svg",
    links: {},
    duration: "실제 제작 기간 입력 예정",
    scope: "작성 예시: 기존 사이트의 디자인·레이아웃을 참고한 개인 클론 작업. 마크업·반응형·상품 필터를 직접 구현. 실제 원본 출처와 담당 범위를 기입해 주세요.",
    responsive: "작성 예시: 1024px 이상은 4열, 768~1023px는 2열, 768px 미만은 1열. 이미지는 aspect-ratio: 4 / 3과 object-fit: contain으로 상품 비율을 유지. 필터는 모바일에서 목록 위로 배치.",
    features: ["상품 검색: 입력한 단어로 상품명 필터링", "카테고리 선택: 검색 조건과 함께 적용", "가격 정렬: 낮은 가격·높은 가격 순으로 표시", "빈 결과 안내: 결과가 없을 때 검색 초기화 버튼 표시"],
    challenges: [{ problem: "작성 예시: sort()로 원본 배열을 변경해 필터를 초기화해도 최초 순서로 돌아가지 않음.", solution: "작성 예시: [...products].sort()로 복사본을 정렬하고 원본 목록을 유지. 검색·정렬 후 초기화했을 때 처음 순서가 복원되는지 확인. 실제 경험으로 교체해 주세요." }],
  },
  {
    slug: "event-landing",
    featured: true,
    placeholder: true,
    categoryTags: ["반응형","리뉴얼"],
    featureTags: ["일정선택","아코디언메뉴","폼검증"],
    title: "PLACEHOLDER — 행사 안내 페이지",
    tagline: "일정 안내와 신청 폼을 담는 랜딩 페이지 구성 예시",
    type: "Redesign",
    stack: ["Next.js", "React", "Tailwind CSS"],
    size: "small",
    image: "/images/project-desktop-placeholder.svg",
    desktopImage: "/images/project-desktop-placeholder.svg",
    mobileImage: "/images/project-mobile-placeholder.svg",
    links: {},
    duration: "실제 제작 기간 입력 예정",
    scope: "작성 예시: 기존 행사 사이트의 콘텐츠를 참고하고 시각 디자인은 직접 재구성한 개인 리디자인. 반응형 화면과 클라이언트 폼 검증을 구현. 실제 원본 출처와 범위를 기입해 주세요.",
    responsive: "작성 예시: 768px 이상에서 행사 설명과 신청 폼을 2열로, 미만에서는 설명 다음에 폼이 오는 1열로 구성. 입력 요소에 width: 100%와 min-width: 0을 적용해 좁은 화면에서 넘침을 방지.",
    features: ["일정 선택: 날짜 버튼으로 해당 일자의 프로그램 표시", "FAQ: 질문 버튼으로 답변 열고 닫기", "신청 폼 검증: 이름 필수 입력과 이메일 형식 확인", "오류 안내: 입력 옆에 메시지를 표시하고 첫 오류 입력으로 포커스 이동"],
    challenges: [{ problem: "작성 예시: 오류를 색상으로만 표시해 어떤 값을 수정해야 하는지 알기 어려움.", solution: "작성 예시: 오류 문구에 id를 부여하고 입력의 aria-describedby와 연결. aria-invalid를 설정하고 키보드로 오류 입력을 수정할 수 있는지 확인. 실제 경험으로 교체해 주세요." }],
  },
];


// Main/side placement is editorial, independent of Personal/Clone/Redesign.
export const mainProjects = projects.filter((project) => project.featured);
export const sideProjects = projects.filter((project) => !project.featured);
