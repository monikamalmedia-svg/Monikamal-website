import { Fragment, type ReactNode } from "react";

/**
 * Keeps "e-commerce" on one line in large type (browsers may otherwise break it after the
 * hyphen as "e-" / "commerce"). Only the word itself gets nowrap, not the whole heading.
 */
export function keepEcommerce(text: string): ReactNode {
  const parts = text.split(/(e-commerce)/gi);
  if (parts.length === 1) return text;
  return parts.map((part, index) =>
    /^e-commerce$/i.test(part) ? (
      <span key={index} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}
