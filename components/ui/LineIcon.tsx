type Props = {
  name: string;
  className?: string;
  /** Tints the icon with currentColor via CSS mask so it follows the theme. */
  tint?: boolean;
};

/** Supplied PRIME line icons from /public/brand/icons. */
export function LineIcon({ name, className, tint = true }: Props) {
  const src = `/brand/icons/${name}.png`;
  if (!tint) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={className} aria-hidden draggable={false} />;
  }
  return (
    <span
      aria-hidden
      className={`inline-block bg-current ${className ?? ""}`}
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}
