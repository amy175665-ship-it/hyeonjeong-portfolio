import Reveal from "@/components/ui/Reveal";

type Skill = {
  name: string;
  description?: string;
};

const skills: Skill[] = [
  { name: "HTML" },
  { name: "CSS" },
  { name: "JavaScript" },
  { name: "React" },
  { name: "Next.js" },
  { name: "Tailwind CSS" },
];

export default function Skills() {
  return (
    <section id="skill" aria-labelledby="skills-title" className="border-t border-portfolio-line bg-portfolio-cream px-6 py-16 text-portfolio-ink md:px-10 md:py-24">
      <div className="mx-auto max-w-[1120px]">
        <Reveal>
          <h2 id="skills-title" className="mb-7 text-[28px] font-bold leading-tight md:mb-10 md:text-4xl">
            <span className="relative isolate inline-block">
              <span aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-3 rounded-full bg-portfolio-sky/70" />
              학습·사용 기술
            </span>
          </h2>
          <ul aria-label="기술 목록" className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
            {skills.map((skill) => (
              <li key={skill.name} className="min-w-0 rounded-2xl border border-portfolio-line bg-portfolio-surface px-3 py-4 min-[390px]:px-4 md:p-6">
                <span aria-hidden="true" className="mb-6 block h-1 w-8 rounded-full bg-portfolio-sky md:mb-8" />
                <h3 className="break-words text-lg font-semibold leading-snug min-[390px]:text-xl md:text-2xl">{skill.name}</h3>
                {skill.description && <p className="mt-3 whitespace-pre-line break-words text-base leading-[1.7] text-portfolio-muted">{skill.description}</p>}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
