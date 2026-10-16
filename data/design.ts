// Design work shown on the orbits of the design part (DesignStory). Seven works (user's decision, 2026-10-14).
// To add a real work: put a WebP in public/images/design/, set `image` and its `ratio` (width / height), fill in the
// title, tools and one-line description, and set `placeholder: false` (or remove it).
export type DesignItem = {
  title: string;
  ratio: number; // width / height of the work, for the centre frame and the large view
  image?: string;
  tools?: string[]; // e.g. ["Photoshop", "Illustrator"]
  description?: string;
  placeholder?: boolean; // shown with the "작성 예시" label
  color?: string; // colour field of a placeholder (no image yet)
};

const example = (no: number, ratio: number, color: string): DesignItem => ({
  title: `디자인 작업 ${String(no).padStart(2, "0")}`,
  ratio,
  description: "제목 · 사용 도구 · 한 줄 설명 자리",
  placeholder: true,
  color,
});

export const designItems: DesignItem[] = [
  example(1, 3 / 4, "#e96b5a"),
  example(2, 1, "#7f9657"),
  example(3, 16 / 9, "#e9a33a"),
  example(4, 4 / 5, "#3a4a6b"),
  example(5, 1, "#d9b07e"),
  example(6, 3 / 4, "#58636e"),
  example(7, 9 / 16, "#c9824f"),
];
