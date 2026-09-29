/** Understated "most chosen" badge shared by the video and photo pricing cards. */
export function PackageBadge({ children }: { children: string }) {
  return (
    <span className="absolute top-6 right-6 rounded-full border border-gold/40 px-2.5 py-1 text-[10px] tracking-[0.16em] text-gold/90 uppercase md:top-8 md:right-8">
      {children}
    </span>
  );
}
