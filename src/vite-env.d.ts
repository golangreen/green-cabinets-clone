/// <reference types="vite/client" />

declare module '*.tiff' {
  const src: string;
  export default src;
}

declare module '*.tif' {
  const src: string;
  export default src;
}
