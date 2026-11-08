/** 插件版本。正式构建由 vite define 注入；测试 / harness 自己打包时没有注入，退为 dev。 */
export const PLUGIN_VERSION: string = typeof __APP_VERSION__ === 'undefined' ? 'dev' : __APP_VERSION__
