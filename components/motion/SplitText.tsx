import type { CSSProperties, ElementType } from "react";

type Props = {
  text: string;
  // "char": one span per letter (letter rolls, blur-ins); "word": one span per word (word-by-word fills).
  by?: "char" | "word";
  as?: ElementType;
  className?: string;
  partClassName?: string;
};

// Splits text into spans for per-letter or per-word motion. Screen readers get the whole text once from a visually
// hidden copy; the pieces are hidden from them. Each piece gets --i (its index) for staggered CSS animation.
export default function SplitText({
  text,
  by = "char",
  as: Tag = "span",
  className,
  partClassName,
}: Props) {
  const parts = by === "char" ? [...text] : text.split(/(\s+)/);
  let index = 0;
  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      {parts.map((part, key) => {
        if (/^\s+$/.test(part))
          return by === "char" ? (
            <span
              key={key}
              aria-hidden="true"
              className={partClassName}
            >
              {" "}
            </span>
          ) : (
            <span
              key={key}
              aria-hidden="true"
            >
              {part}
            </span>
          );
        const style = { "--i": index++ } as CSSProperties;
        return (
          <span
            key={key}
            aria-hidden="true"
            className={partClassName}
            style={style}
          >
            {part}
          </span>
        );
      })}
    </Tag>
  );
}
