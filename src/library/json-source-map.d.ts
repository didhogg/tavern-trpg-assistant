declare module 'json-source-map' {
  export interface Location { line: number; column: number; pos: number }
  export interface Pointer { value: Location; valueEnd: Location; key?: Location; keyEnd?: Location }
  export function parse(json: string, _?: unknown, options?: unknown): { data: unknown; pointers: Record<string, Pointer> }
}
