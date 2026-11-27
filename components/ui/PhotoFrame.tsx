import Image from "next/image";
import type { PhotoAsset } from "@/lib/images";

type Props = {
  photo: PhotoAsset;
  alt: string;
  sizes: string;
  className?: string;
  imgClassName?: string;
  preload?: boolean;
  loading?: "eager" | "lazy";
};

/** Full-bleed clinic photograph inside a positioned frame. */
export function Photo({ photo, alt, sizes, className, imgClassName, preload, loading }: Props) {
  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <Image
        src={photo.src}
        alt={alt}
        fill
        sizes={sizes}
        preload={preload}
        loading={preload ? undefined : loading}
        className={`object-cover ${imgClassName ?? ""}`}
      />
    </div>
  );
}
