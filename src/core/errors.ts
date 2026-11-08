/** 可直接展示给玩家的错误；`code` 供界面与测试区分情形。 */
export type ErrorCode =
  | 'E_NOT_ZIP' | 'E_NO_MANIFEST' | 'E_UNKNOWN_FORMAT' | 'E_NEWER_FORMAT' | 'E_NEWER_APP'
  | 'E_RULE_MISSING' | 'E_BAD_CONTENT' | 'E_CHECKSUM' | 'E_NEWER_DATA' | 'E_BAD_VERSION' | 'E_OLD_DATA'
  | 'E_QUOTA'
  | 'E_RULE_MISMATCH' | 'E_RULE_SWITCH_REQUIRED' | 'E_NOT_FOUND' | 'E_SAVE_IN_USE'
  | 'E_AUTO_NOT_DELETABLE' | 'E_BAD_NAME'
  | 'E_NO_WORKSPACE' | 'E_READ_ONLY' | 'E_NETWORK' | 'E_HTTP' | 'E_CANCELLED'
  | 'E_BAD_KERNEL' | 'E_NO_KERNEL' | 'E_REVISION_CONFLICT'
  | 'E_NO_REF_MAPPER' | 'E_NO_COMPACTOR'
  | 'E_TOO_LARGE'
 

export class TrpgError extends Error {
  readonly code: ErrorCode
  readonly details?: Record<string, unknown>

  constructor(code: ErrorCode, message: string, details?: Record<string, unknown>) {
    super(message)
    this.name = 'TrpgError'
    this.code = code
    this.details = details
  }
}

export function isQuotaError(error: unknown): boolean {
  const name = (error as { name?: string } | null)?.name
  return name === 'QuotaExceededError'
}

export const QUOTA_MESSAGE = '存储空间不足：可以清空最近删除的存档'
