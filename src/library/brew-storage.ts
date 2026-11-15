// 作者自制管理器（BrewUtil2）存已装自制包的键。`HOMEBREW_STORAGE` 是旧版迁移用的老键，真正存包的是这个（Plutonium Bundle.js 65687 起）。
export const BREW_STORAGE_KEY = 'HOMEBREW_2_STORAGE'

/**
 * 作者同步存储里哪些键是资料内容：作者自制管理器（BrewUtil2）与试玩稿管理器（PrereleaseUtil）自己声明的存储键
 * 都以 HOMEBREW / PRERELEASE 开头（作者源码 _STORAGE_KEY / _STORAGE_KEY_META / _MIGRATION_VERSION / _CUSTOM_URL…，Plutonium Bundle.js 同名常量）。
 * 其余是网站自己的偏好（主题、掷骰框样式、界面语言、筛选器状态、存储自检…），与插件无关。
 */
export const isAuthorContentStorageKey = (key: string): boolean => /^(HOMEBREW|PRERELEASE)/.test(key)
