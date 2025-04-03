declare module 'audio-type' {
    function audioType(buf: ArrayBuffer | Uint8Array | null | undefined): string | undefined;
  
    function isMp3(buf: Uint8Array | null | undefined): boolean | undefined;
    function isWav(buf: Uint8Array | null | undefined): boolean | undefined;
    function isOgg(buf: Uint8Array | null | undefined): boolean | undefined;
    function isFlac(buf: Uint8Array | null | undefined): boolean | undefined;
    function isM4a(buf: Uint8Array | null | undefined): boolean | undefined;
    function isOpus(buf: Uint8Array | null | undefined): boolean | undefined;
    function isQoa(buf: Uint8Array | null | undefined): boolean | undefined;
  
    export default audioType;
    export { isMp3, isWav, isOgg, isFlac, isM4a, isOpus, isQoa };
  }