import { contact } from "@/data/contact";
import styles from "./SiteFooter.module.css";

// Contact icons, shared with ContactStory (the contact section inside the desert browser window).
export const iconPaths = {
  phone: "M6 3h4l2 5-3 2a15 15 0 0 0 5 5l2-3 5 2v4a3 3 0 0 1-3 3C9 20 4 15 3 6a3 3 0 0 1 3-3Z",
  email: "M3 5h18v14H3V5Zm0 1 9 7 9-7",
  github: "M9 19c-4 1-4-2-6-2m12 5v-4a3.5 3.5 0 0 0-1-3c3-.3 6-1.5 6-6a5 5 0 0 0-1.5-3.5A4.5 4.5 0 0 0 18.4 2S17.2 1.7 15 3a13 13 0 0 0-6 0C6.8 1.7 5.6 2 5.6 2a4.5 4.5 0 0 0-.1 3.5A5 5 0 0 0 4 9c0 4.5 3 5.7 6 6a3.5 3.5 0 0 0-1 3v4",
  resume: "M6 2h8l4 4v16H6V2Zm8 0v5h4M9 12h6m-6 4h6",
};

export default function SiteFooter() {
  const channels = [
    {
      key: "phone" as const,
      label: "전화",
      value: contact.phone,
      href: "tel:" + contact.phone,
    },
    {
      key: "email" as const,
      label: "이메일",
      value: contact.email,
      href: "mailto:" + contact.email,
    },
    {
      key: "github" as const,
      label: "GitHub",
      value: contact.github,
      href: contact.github,
    },
    {
      key: "resume" as const,
      label: "이력서",
      value: contact.resume,
      href: contact.resume,
    },
  ].filter((item) => item.value?.trim());

  return (
    <footer
      id="contact"
      aria-labelledby="contact-title"
      className={styles.footer}
    >
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 id="contact-title" className={styles.title}>
            연락처 · 이력서
          </h2>

          {channels.length > 0 && (
            <ul aria-label="연락 채널" className={styles.channels}>
              {channels.map((item) => {
                const isEmail = item.key === "email";
                const hasContactValue = isEmail || item.key === "phone";
                const accessibleLabel = hasContactValue
                  ? item.label + ": " + item.value
                  : item.label;

                return (
                  <li
                    key={item.key}
                    className={isEmail ? styles.emailItem : styles.item}
                  >
                    <a
                      href={item.href}
                      aria-label={accessibleLabel}
                      className={isEmail ? styles.emailLink : styles.link}
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={styles.icon}
                      >
                        <path d={iconPaths[item.key]} />
                      </svg>
                      <span className={isEmail ? styles.emailText : styles.text}>
                        {isEmail ? item.value : item.label}
                      </span>
                      <span aria-hidden="true" className={styles.arrow}>
                        ↗
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <p className={styles.copyright}>
          © {new Date().getFullYear()} {contact.name}
        </p>
      </div>
    </footer>
  );
}
