import Reveal from "@/components/ui/Reveal";
import { contact, iconPaths } from "@/components/layout/SiteFooter";
import styles from "./ContactStory.module.css";

// Last section inside the desert browser window: GROW. (yellow dot) and the contact channels, with the same data and
// wording as SiteFooter. The email is set large in the serif; other channels show only when they have a value.
export default function ContactStory() {
  const channels = [
    { key: "phone" as const, label: "전화", value: contact.phone, href: "tel:" + contact.phone },
    { key: "email" as const, label: "이메일", value: contact.email, href: "mailto:" + contact.email },
    { key: "github" as const, label: "GitHub", value: contact.github, href: contact.github },
    { key: "resume" as const, label: "이력서", value: contact.resume, href: contact.resume },
  ].filter(item => item.value?.trim());
  const email = channels.find(item => item.key === "email");
  const others = channels.filter(item => item.key !== "email");
  return (
    <footer id="contact" aria-labelledby="contact-story-title" className={styles.section} data-page>
      <div className={styles.inner}>
        <Reveal>
          <p className={styles.kicker} lang="en"><span className={styles.dot} aria-hidden="true" />GROW.</p>
          <h2 id="contact-story-title" className={styles.title}>연락처 · 이력서</h2>
          {email && <a href={email.href} className={styles.email} aria-label={`${email.label}: ${email.value}`}>
            {/* Wraps only after the @ on narrow screens, never inside the name or the domain. */}
            <span className={styles.emailText}>{email.value?.split("@").map((part, index) => index ? <span key={index}>@<wbr />{part}</span> : part)}</span>
            <span aria-hidden="true" className={styles.arrow}>↗</span>
          </a>}
          {others.length > 0 && <ul aria-label="연락 채널" className={styles.channels}>
            {others.map(item => <li key={item.key}>
              <a href={item.href} aria-label={item.label + (item.key === "phone" ? ": " + item.value : "")} className={styles.channel}>
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={iconPaths[item.key]} /></svg>
                {item.label}
                <span aria-hidden="true">↗</span>
              </a>
            </li>)}
          </ul>}
        </Reveal>
        <p className={styles.copyright}>© {new Date().getFullYear()} {contact.name}</p>
      </div>
    </footer>
  );
}
