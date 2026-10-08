export type Skill = {
  name: string;
  description?: string;
  // Monochrome icon for the about page's skill marquee (see public/images/SOURCES.md).
  icon?: string;
};

export const skills: Skill[] = [
  { name: "HTML", icon: "/images/skills/html5.svg" },
  { name: "CSS", icon: "/images/skills/css3.svg" },
  { name: "Figma", icon: "/images/skills/figma.svg" },
  { name: "Photoshop", icon: "/images/skills/photoshop.svg" },
  { name: "Illustrator", icon: "/images/skills/illustrator.svg" },
  { name: "JavaScript", icon: "/images/skills/javascript.svg" },
];
