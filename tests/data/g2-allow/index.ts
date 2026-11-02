import * as s1 from './s1'
import * as s2 from './s2'
import * as s3a from './s3a'
import * as s3b from './s3b'
import * as s3c from './s3c'
import * as s3d from './s3d'
import * as s4 from './s4'
import * as sp from './sp'
import * as e1 from './e1'
import * as e2 from './e2'
import * as e3 from './e3'
import * as e4 from './e4'
import * as e5 from './e5'
import * as d12b from './d12b'
import * as g3 from './g3'

export type { Added, Allow, AllowRequires } from './types'
export const ALLOW = [...s1.ALLOW, ...s2.ALLOW, ...s3a.ALLOW, ...s3b.ALLOW, ...s3c.ALLOW, ...s3d.ALLOW, ...s4.ALLOW, ...sp.ALLOW, ...e1.ALLOW, ...e2.ALLOW, ...e3.ALLOW, ...e4.ALLOW, ...e5.ALLOW, ...d12b.ALLOW, ...g3.ALLOW]
export const ADDED = [...s1.ADDED, ...s2.ADDED, ...s3a.ADDED, ...s3b.ADDED, ...s3c.ADDED, ...s3d.ADDED, ...s4.ADDED, ...sp.ADDED, ...e1.ADDED, ...e2.ADDED, ...e3.ADDED, ...e4.ADDED, ...e5.ADDED, ...d12b.ADDED, ...g3.ADDED]
export const ALLOW_REQUIRES = [...s1.ALLOW_REQUIRES, ...s2.ALLOW_REQUIRES, ...s3a.ALLOW_REQUIRES, ...s3b.ALLOW_REQUIRES, ...s3c.ALLOW_REQUIRES, ...s3d.ALLOW_REQUIRES, ...s4.ALLOW_REQUIRES, ...sp.ALLOW_REQUIRES, ...e1.ALLOW_REQUIRES, ...e2.ALLOW_REQUIRES, ...e3.ALLOW_REQUIRES, ...e4.ALLOW_REQUIRES, ...e5.ALLOW_REQUIRES, ...d12b.ALLOW_REQUIRES, ...g3.ALLOW_REQUIRES]
