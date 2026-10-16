// Firefox restores dynamic disabled states on reload before React hydrates.
// Spreading these props also supports Firefox's nonstandard button attribute.
export const CONTROL_PROPS = { autoComplete: "off" } as const;
