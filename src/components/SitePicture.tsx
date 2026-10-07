/**
 * Site visuals (services, process): AVIF with WebP fallback, intrinsic size, lazy by default.
 * Files are generated in public/images/visuals from assets/visual-originals (see SOURCES.md).
 */
const VISUALS = {
  "dienst-ugc": { widths: [480, 720, 960, 1280], width: 1448, height: 1086 },
  "dienst-ai": { widths: [480, 720, 960, 1280], width: 1448, height: 1086 },
  "dienst-product": { widths: [480, 720, 960, 1280], width: 1448, height: 1086 },
  "werkwijze-kennismaken": { widths: [480, 720, 960, 1120], width: 1122, height: 1402 },
  "werkwijze-creeren": { widths: [480, 720, 960, 1120], width: 1122, height: 1402 },
  "werkwijze-opleveren": { widths: [480, 720, 960, 1120], width: 1122, height: 1402 },
  "monika-portrait": { widths: [480, 720, 960, 1200], width: 1200, height: 1600 },
} as const;

export type VisualName = keyof typeof VISUALS;

const srcSet = (name: VisualName, format: "avif" | "webp") =>
  VISUALS[name].widths.map((width) => `/images/visuals/${name}-${width}.${format} ${width}w`).join(", ");

export function SitePicture({
  name,
  alt,
  sizes,
  className = "",
  loading = "lazy",
}: {
  name: VisualName;
  alt: string;
  sizes: string;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  const { width, height } = VISUALS[name];
  return (
    <picture className="block h-full w-full">
      <source type="image/avif" srcSet={srcSet(name, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(name, "webp")} sizes={sizes} />
      <img
        src={`/images/visuals/${name}-960.webp`}
        width={width}
        height={height}
        alt={alt}
        loading={loading}
        decoding="async"
        draggable={false}
        className={className}
      />
    </picture>
  );
}
