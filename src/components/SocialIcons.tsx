import type { SVGProps } from "react";

/** Thin social icons, shared by the footer and the menu. */
export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" strokeWidth="1.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M6.94 8.5H4.06V20h2.88V8.5ZM5.5 4A1.67 1.67 0 1 0 5.5 7.34 1.67 1.67 0 0 0 5.5 4ZM20 20h-2.88v-6.16c0-1.83-.66-2.84-2.02-2.84-1.1 0-1.76.74-2.05 1.46-.1.25-.08.6-.08.95V20h-2.88s.04-10.18 0-11.5h2.88v1.83c.38-.59 1.07-1.43 2.6-1.43 1.9 0 3.43 1.24 3.43 4.04V20Z" />
    </svg>
  );
}

export function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M14.6 3h-2.7v11.16a2.66 2.66 0 1 1-2.66-2.66c.17 0 .34.02.5.05V8.8a5.4 5.4 0 0 0-.5-.02 5.36 5.36 0 1 0 5.36 5.36V9.74A7.1 7.1 0 0 0 18.7 11.2V8.46a4.5 4.5 0 0 1-4.1-5.46Z" />
    </svg>
  );
}
