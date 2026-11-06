import type { SchemaInfo } from '../../tests/e2e/library/audit-layers34'

/** 从作者 5etools-utils 的 schema/site 目录读出审计第 3、4 层要用的结构定义信息。 */
export function schemaInfo(siteDir: string): Promise<SchemaInfo>
