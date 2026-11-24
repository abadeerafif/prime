"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

let registered = false;

if (typeof window !== "undefined" && !registered) {
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, CustomEase, useGSAP);
  // Shared motion character: long, soft ease-out used for most entrances.
  CustomEase.create("prime", "0.22, 1, 0.36, 1");
  CustomEase.create("primeInOut", "0.76, 0, 0.24, 1");
  gsap.defaults({ ease: "prime", duration: 1.1 });
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (process.env.NODE_ENV !== "production") {
    (window as unknown as { __prime: unknown }).__prime = { gsap, ScrollTrigger };
  }
  registered = true;
}

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, CustomEase, useGSAP };
