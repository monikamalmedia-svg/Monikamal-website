import Link from "next/link";

export default function RootNotFound() {
  return (
    <main className="relative z-20 flex min-h-screen flex-1 items-center justify-center bg-[linear-gradient(160deg,#1E040C_0%,#0F0206_50%,#2D0915_100%)] px-6 py-28">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-xs tracking-[0.28em] text-gold uppercase">Lost frame</p>
        <h1 className="font-display mt-4 text-[clamp(4rem,12vw,7rem)] leading-none font-medium text-foreground">
          404
        </h1>
        <p className="mt-4 text-lg text-foreground-muted md:text-xl">
          This page isn’t on the storyboard.
        </p>
        <Link
          href="/"
          className="mt-10 inline-flex rounded-full bg-[#7A2A42] px-7 py-3.5 text-xs font-semibold tracking-wide text-gold uppercase transition-all duration-300 hover:bg-gold hover:text-graphite hover:shadow-gold-glow"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
