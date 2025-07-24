import React, { forwardRef } from "react";

export const Card = forwardRef(({ customClass, children, ...rest }, ref) => (
  <div
    ref={ref}
    {...rest}
    className={`absolute top-1/2 left-1/2 rounded-xl border border-white bg-black [transform-style:preserve-3d] [will-change:transform] [backface-visibility:hidden] overflow-hidden ${customClass ?? ""} ${rest.className ?? ""}`.trim()}
  >
    {children}
  </div>
));
Card.displayName = "Card";

export { default } from "./CardSwapCore";
