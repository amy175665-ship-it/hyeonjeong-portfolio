import Image from "next/image";
import type { DesignItem } from "@/data/design";

export default function DesignGallery({ designItems = [] }: { designItems?: DesignItem[] }) {
  return (
    <section id="design" aria-labelledby="design-title" className="border-t border-portfolio-line bg-portfolio-cream px-6 py-16 text-portfolio-ink md:px-10 md:py-24">
      <div className="mx-auto max-w-[1120px]">
      <h2 id="design-title" className="mb-7 text-[28px] font-bold leading-tight md:mb-10 md:text-4xl">
        <span className="relative isolate inline-block">
          <span aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-3 rounded-full bg-portfolio-sky/70" />
          디자인
        </span>
      </h2>
      {designItems.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center gap-5 rounded-2xl border border-portfolio-line bg-portfolio-surface px-6 py-10 text-center md:min-h-64 md:py-12">
          <div aria-hidden="true" className="flex h-16 w-16 items-center justify-center rounded-2xl bg-portfolio-sky/40 text-portfolio-muted">
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-9 w-9">
              <rect x="7" y="8" width="34" height="32" rx="4" />
              <circle cx="17" cy="18" r="3" />
              <path d="m8 33 10-9 7 6 7-11 9 14" />
            </svg>
          </div>
          <p className="text-base leading-[1.7] text-portfolio-muted">준비 중입니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {designItems.map((item, index) => (
            <figure key={`${item.image}-${index}`} className="min-w-0 overflow-hidden rounded-2xl border border-portfolio-line bg-portfolio-surface">
              <div className="relative aspect-[4/3] bg-portfolio-sky/20">
                <Image src={item.image} alt={item.title || `디자인 작업 ${index + 1}`} fill sizes="(min-width: 1200px) 357px, (min-width: 1024px) calc((100vw - 128px) / 3), (min-width: 768px) calc((100vw - 104px) / 2), (min-width: 640px) calc((100vw - 64px) / 2), calc(100vw - 48px)" className="object-contain p-3 md:p-4" />
              </div>
              {item.title && <figcaption className="break-words border-t border-portfolio-line p-5 text-xl font-semibold leading-snug md:p-6 md:text-2xl">{item.title}</figcaption>}
            </figure>
          ))}
        </div>
      )}
      </div>
    </section>
  );
}
