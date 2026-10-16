export type Profile = {
  name: string;
  birth?: string;
  photo?: string;
  introduction?: string;
  // The about sentence, one entry per line; `mark` is the highlighted phrase. Shown small on the about page and large
  // in the ABSORB statement scene.
  statement: { lines: string[]; mark?: string };
  // period / date: shown as the muted note after the item (e.g. "2025.01 ~ 2025.06").
  education: {
    year: string;
    school: string;
    program: string;
    status: "수료" | "졸업" | "재학";
    period?: string;
  }[];
  certificates?: {
    year: string;
    name: string;
    issuer: string;
    date?: string;
  }[];
};

// [수정 예정] PLACEHOLDER: birth, education and certificates below are made-up examples to fill the layout.
// Replace every "[수정 예정]" entry with real, verified information before sharing the portfolio.
export const profile: Profile = {
  name: "백현정",
  birth: "[수정 예정]",
  photo: "/images/profile/profile-front.webp",
  statement: {
    lines: [
      "안녕하세요, 새로운 환경에 금방 적응해",
      "결과로 증명하는 백현정입니다.",
    ],
    mark: "결과로 증명하는",
  },
  education: [
    {
      year: "2025",
      school: "OO아카데미",
      program: "UI/UX 반응형 웹디자인 & 웹퍼블리셔 양성과정 [수정 예정]",
      status: "수료",
      period: "2025.01 ~ 2025.06",
    },
    {
      year: "2024",
      school: "OO온라인캠프",
      program: "웹퍼블리싱 기초 [수정 예정]",
      status: "수료",
      period: "2024.11 ~ 2024.12",
    },
    {
      year: "2024",
      school: "OO대학교",
      program: "OO학과 [수정 예정]",
      status: "졸업",
      period: "2020.03 ~ 2024.02",
    },
  ],
  certificates: [
    {
      year: "2025",
      name: "웹디자인개발기능사 [수정 예정]",
      issuer: "한국산업인력공단",
      date: "2025.07",
    },
    {
      year: "2024",
      name: "GTQ 그래픽기술자격 1급 [수정 예정]",
      issuer: "한국생산성본부",
      date: "2024.10",
    },
    {
      year: "2024",
      name: "컴퓨터활용능력 2급 [수정 예정]",
      issuer: "대한상공회의소",
      date: "2024.08",
    },
  ],
};

export type Hobby = {
  title: string;
  group: "absorb" | "build" | "grow";
  description?: string;
  photos?: string[];
  focus?: Record<string, string>;
};

// Hobbies (HobbyFlow): each hobby sits under the part of the concept it feeds, ABSORB (taking things in), BUILD
// (working out rules and plans) or GROW (keeping on to the end).
// photos: images under public/images/hobby/ shown large in its panel (cropped to fit), one after another as a
// slideshow when there are several; originals are in assets/hobby/. focus: object-position for a photo whose subject is
// off centre, so the crop keeps it in (e.g. "26% 50%"). Until one is added the panel shows "사진 준비 중".
// [수정 예정] description: the one line under each hobby, left out (hidden) until the final copy is decided.
export const hobbies: Hobby[] = [
  {
    title: "EXHIBITION & CAFE",
    group: "absorb",
    photos: [1, 2, 3, 4, 5, 6, 7].map(
      (n) => `/images/hobby/exhibition-cafe-0${n}.webp`,
    ),
    focus: { "/images/hobby/exhibition-cafe-01.webp": "26% 50%" },
  },
  { title: "MUSIC", group: "absorb" },
  { title: "TRAVEL", group: "absorb" },
  { title: "VOLUNTEER", group: "absorb" },
  { title: "BOARD GAME", group: "build" },
  { title: "RUNNING", group: "grow" },
];

// Vlog page after the hobbies: a daily-life edit. video: a file under public/ (e.g. "/videos/vlog.mp4"), poster: an
// optional still shown before playback. The page stays hidden until a video exists.
export const vlog: { video?: string; poster?: string } = {};
