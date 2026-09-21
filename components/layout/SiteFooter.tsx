type Contact = { name: string; phone?: string; email?: string; github?: string; resume?: string };
const contact: Contact = {
  name: "백현정",
  email: "amy010402@naver.com",
  // Add phone, github, and resume only when real values are available.
};
const iconPaths = {
  phone: "M6 3h4l2 5-3 2a15 15 0 0 0 5 5l2-3 5 2v4a3 3 0 0 1-3 3C9 20 4 15 3 6a3 3 0 0 1 3-3Z",
  email: "M3 5h18v14H3V5Zm0 1 9 7 9-7",
  github: "M9 19c-4 1-4-2-6-2m12 5v-4a3.5 3.5 0 0 0-1-3c3-.3 6-1.5 6-6a5 5 0 0 0-1.5-3.5A4.5 4.5 0 0 0 18.4 2S17.2 1.7 15 3a13 13 0 0 0-6 0C6.8 1.7 5.6 2 5.6 2a4.5 4.5 0 0 0-.1 3.5A5 5 0 0 0 4 9c0 4.5 3 5.7 6 6a3.5 3.5 0 0 0-1 3v4",
  resume: "M6 2h8l4 4v16H6V2Zm8 0v5h4M9 12h6m-6 4h6",
};

export default function SiteFooter() {
  const channels = [
    { key: "phone" as const, label: "전화", value: contact.phone, href: "tel:" + contact.phone },
    { key: "email" as const, label: "이메일", value: contact.email, href: "mailto:" + contact.email },
    { key: "github" as const, label: "GitHub", value: contact.github, href: contact.github },
    { key: "resume" as const, label: "이력서", value: contact.resume, href: contact.resume },
  ].filter((item) => item.value?.trim());
  return (
    <footer id="contact" aria-labelledby="contact-title" className="border-t border-portfolio-line bg-portfolio-cream px-6 text-portfolio-ink md:px-10">
      <div className="mx-auto max-w-[1120px] pb-8 pt-16 md:pb-10 md:pt-24">
        <div className="rounded-3xl border border-portfolio-sky/60 bg-portfolio-sky/30 px-5 py-8 md:px-10 md:py-12">
          <h2 id="contact-title" className="mb-7 text-[28px] font-bold leading-tight md:mb-10 md:text-4xl">연락처 · 이력서</h2>
        {channels.length > 0 && <ul aria-label="연락 채널" className="flex flex-wrap gap-4 md:gap-6">
          {channels.map((item) => <li key={item.key} className={item.key === "email" ? "w-full min-w-0" : "min-w-0"}>
            <a href={item.href} aria-label={item.label + (item.key === "email" || item.key === "phone" ? ": " + item.value : "")} className={`group inline-flex min-h-11 max-w-full items-center gap-3 rounded-xl transition-colors hover:bg-portfolio-cream/70 focus-visible:!outline-portfolio-ink focus-visible:outline-offset-4 motion-reduce:transition-none ${item.key === "email" ? "max-[389px]:grid max-[389px]:grid-cols-[1fr_auto] max-[389px]:gap-y-2 py-3 pr-2 text-lg font-semibold min-[390px]:text-xl md:gap-5 md:text-3xl" : "bg-portfolio-cream/70 px-4 py-3 text-sm font-medium"}`}>
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0 md:h-6 md:w-6"><path d={iconPaths[item.key]} /></svg>
              <span className={item.key === "email" ? "min-w-0 break-words max-[389px]:col-span-2 max-[389px]:row-start-2" : "min-w-0 break-words"}>{item.key === "email" ? item.value : item.label}</span>
              <span aria-hidden="true" className="shrink-0">↗</span>
            </a>
          </li>)}
        </ul>}
        </div>
        <p className="mt-8 border-t border-portfolio-line pt-6 text-sm leading-[1.7] text-portfolio-muted md:mt-12">© {new Date().getFullYear()} {contact.name}</p>
      </div>
    </footer>
  );
}


