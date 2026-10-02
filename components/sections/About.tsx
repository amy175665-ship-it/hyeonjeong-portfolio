import Image from "next/image";
import Reveal from "@/components/ui/Reveal";

type Profile = {
  name: string;
  birth?: string;
  photo?: string;
  introduction?: string;
  // period / date: shown as the muted note after the item (e.g. "2025.01 ~ 2025.06").
  education: { year: string; school: string; program: string; status: "수료" | "졸업" | "재학"; period?: string }[];
  certificates?: { year: string; name: string; issuer: string; date?: string }[];
};

// [수정 예정] PLACEHOLDER: birth, education and certificates below are made-up examples to fill the layout.
// Replace every "[수정 예정]" entry with real, verified information before sharing the portfolio.
export const profile: Profile = {
  name: "백현정",
  birth: "[수정 예정]",
  photo: "/images/profile/profile-front.webp",
  education: [
    { year: "2025", school: "OO아카데미", program: "UI/UX 반응형 웹디자인 & 웹퍼블리셔 양성과정 [수정 예정]", status: "수료", period: "2025.01 ~ 2025.06" },
    { year: "2024", school: "OO온라인캠프", program: "웹퍼블리싱 기초 [수정 예정]", status: "수료", period: "2024.11 ~ 2024.12" },
    { year: "2024", school: "OO대학교", program: "OO학과 [수정 예정]", status: "졸업", period: "2020.03 ~ 2024.02" },
  ],
  certificates: [
    { year: "2025", name: "웹디자인개발기능사 [수정 예정]", issuer: "한국산업인력공단", date: "2025.07" },
    { year: "2024", name: "GTQ 그래픽기술자격 1급 [수정 예정]", issuer: "한국생산성본부", date: "2024.10" },
    { year: "2024", name: "컴퓨터활용능력 2급 [수정 예정]", issuer: "대한상공회의소", date: "2024.08" },
  ],
};

export default function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="border-t border-portfolio-line bg-portfolio-cream px-6 py-16 text-portfolio-ink md:px-10 md:py-24">
      <div className="mx-auto max-w-[1120px]">
      <Reveal>
        <h2 id="about-title" className="mb-7 text-[28px] font-bold leading-tight md:mb-10 md:text-4xl">
          <span className="relative isolate inline-block">
            <span aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-3 rounded-full bg-portfolio-sky/70" />
            소개
          </span>
        </h2>
        <div className="grid grid-cols-1 items-start gap-7 md:grid-cols-[220px_minmax(0,1fr)] md:gap-12 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
          <div className="w-[180px] rounded-2xl border border-portfolio-line bg-portfolio-surface p-3 md:w-full md:p-4">
            {profile.photo ? <Image src={profile.photo} alt={profile.name + " 프로필 사진"} width={480} height={600} sizes="(min-width: 1024px) 226px, (min-width: 768px) 186px, 154px" className="aspect-[4/5] w-full rounded-lg object-cover" /> : (
              <div role="img" aria-label="프로필 사진 등록 예정" className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-4 rounded-lg bg-portfolio-sky/30 text-portfolio-muted">
                <svg aria-hidden="true" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12"><circle cx="24" cy="16" r="8" /><path d="M8 42v-5a16 16 0 0 1 32 0v5" /></svg>
                <span className="text-xs font-medium">사진 준비 중</span>
              </div>
            )}
          </div>
          <div className="min-w-0 break-words">
            <div className="border-b border-portfolio-line pb-7 md:pb-8">
              <h3 className="text-[28px] font-semibold leading-tight md:text-[32px]">{profile.name}</h3>
              <p className="mt-3 text-base font-medium leading-[1.7]">포트폴리오</p>
              {profile.introduction && <p className="mt-5 max-w-prose whitespace-pre-line text-base leading-[1.7] text-portfolio-muted">{profile.introduction}</p>}
              {profile.birth && <p className="mt-3 text-sm leading-[1.7] text-portfolio-muted">생년월일 · {profile.birth}</p>}
            </div>
            <div className="grid gap-7 pt-7 md:gap-8 md:pt-8">
            <div>
              <h4 className="mb-4 flex items-center gap-2 text-base font-semibold"><span aria-hidden="true" className="h-2 w-2 rounded-full bg-portfolio-sky" />교육</h4>
              <ul className="space-y-5">
                {profile.education.map((item, i) => <li key={i} className="grid gap-2 leading-[1.7] lg:grid-cols-[9rem_minmax(0,1fr)] lg:gap-6">
                  <span className="text-sm text-portfolio-muted">{item.year}</span>
                  <div><p className="text-base font-medium">{item.school} · {item.status}</p><p className="mt-1 text-sm text-portfolio-muted">{item.program}</p></div>
                </li>)}
              </ul>
            </div>
            {!!profile.certificates?.length && <div className="border-t border-portfolio-line pt-7 md:pt-8">
              <h4 className="mb-4 flex items-center gap-2 text-base font-semibold"><span aria-hidden="true" className="h-2 w-2 rounded-full bg-portfolio-sky" />자격증</h4>
              <ul className="space-y-5">{profile.certificates.map((item, i) => <li key={i} className="grid gap-2 leading-[1.7] lg:grid-cols-[9rem_minmax(0,1fr)] lg:gap-6"><span className="text-sm text-portfolio-muted">{item.year}</span><div><p className="text-base font-medium">{item.name}</p><p className="mt-1 text-sm text-portfolio-muted">{item.issuer}</p></div></li>)}</ul>
            </div>}
            </div>
          </div>
        </div>
      </Reveal>
      </div>
    </section>
  );
}

