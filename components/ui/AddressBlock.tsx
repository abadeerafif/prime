import type { ReactNode } from "react";
import { mapsLink } from "@/lib/site";
import { PinIcon } from "@/components/ui/Icons";

type Props = { address: string; mapLabel: string; className?: string; children?: ReactNode };

/** Clinic address with a pin and the Google Maps link; children sit between the two (e.g. hours). */
export function AddressBlock({ address, mapLabel, className, children }: Props) {
  return (
    <div className={`flex items-start gap-3 text-theme-muted ${className ?? ""}`}>
      <PinIcon className="mt-1 h-5 w-5 shrink-0 text-accent" />
      <div>
        <p className="text-body max-w-[36ch]">{address}</p>
        {children}
        <a href={mapsLink} target="_blank" rel="noreferrer" className="link-line tap-target text-label mt-2 text-theme">
          {mapLabel}
        </a>
      </div>
    </div>
  );
}
