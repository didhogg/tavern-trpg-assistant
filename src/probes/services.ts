// 诊断按钮共用的一套服务：经插件服务入口 createServices() 取后端，不各自 new【库】或结算内核。
// 用单独的用户数据库（不碰玩家真实战役）；【库】数据库是正式库（装的官方数据本来就要用）。
import { createServices, type Services } from '../core/services'

let services: Services | null = null

export function probeServices(): Services {
  services ??= createServices({ dbName: 'tavern-trpg-probe' })
  return services
}
