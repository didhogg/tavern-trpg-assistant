export function upstreamKey(text: string): string
export function upstreamMessages(foundry: string): Promise<Array<{ key: string; text: string; origins: string[] }>>
