import * as s1 from './s1'
import * as s2 from './s2'
import * as s3 from './s3'
import * as s4 from './s4'

export type { Added, Allow, AllowRequires } from './types'
export const ALLOW = [...s1.ALLOW, ...s2.ALLOW, ...s3.ALLOW, ...s4.ALLOW]
export const ADDED = [...s1.ADDED, ...s2.ADDED, ...s3.ADDED, ...s4.ADDED]
export const ALLOW_REQUIRES = [...s1.ALLOW_REQUIRES, ...s2.ALLOW_REQUIRES, ...s3.ALLOW_REQUIRES, ...s4.ALLOW_REQUIRES]
