import * as s1 from './s1'
import * as s2 from './s2'
import * as s3a from './s3a'
import * as s3b from './s3b'
import * as s3c from './s3c'
import * as s3d from './s3d'
import * as s4 from './s4'
import * as sp from './sp'

export type { Added, Allow, AllowRequires } from './types'
export const ALLOW = [...s1.ALLOW, ...s2.ALLOW, ...s3a.ALLOW, ...s3b.ALLOW, ...s3c.ALLOW, ...s3d.ALLOW, ...s4.ALLOW, ...sp.ALLOW]
export const ADDED = [...s1.ADDED, ...s2.ADDED, ...s3a.ADDED, ...s3b.ADDED, ...s3c.ADDED, ...s3d.ADDED, ...s4.ADDED, ...sp.ADDED]
export const ALLOW_REQUIRES = [...s1.ALLOW_REQUIRES, ...s2.ALLOW_REQUIRES, ...s3a.ALLOW_REQUIRES, ...s3b.ALLOW_REQUIRES, ...s3c.ALLOW_REQUIRES, ...s3d.ALLOW_REQUIRES, ...s4.ALLOW_REQUIRES, ...sp.ALLOW_REQUIRES]
