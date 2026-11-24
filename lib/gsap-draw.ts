"use client";

import { gsap } from "@/lib/gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

/** DrawSVG is only needed by the bloom draws and the form check; import this module there. */
if (typeof window !== "undefined") gsap.registerPlugin(DrawSVGPlugin);

export { gsap };
