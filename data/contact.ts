export type Contact = { name: string; phone?: string; email?: string; github?: string; resume?: string };

// Shared by the contact section in the window (ContactStory) and the project detail pages' footer (SiteFooter).
// Add phone, github and resume only when real values are available.
export const contact: Contact = {
  name: "백현정",
  email: "amy010402@naver.com",
};
