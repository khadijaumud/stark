import React from "react";
import { cn } from "../../lib/utils.js";

export function LogoCloud({ className, logos, ...props }) {
  return (
    <div {...props} className={cn("py-6", className)}>
      <div className="mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-70">
        {logos.map((logo) => (
          <img
            alt={logo.alt}
            className="pointer-events-none h-4 select-none md:h-5"
            height={logo.height || "auto"}
            key={`logo-${logo.alt}`}
            loading="lazy"
            src={logo.src}
            width={logo.width || "auto"}
          />
        ))}
      </div>
    </div>
  );
}
