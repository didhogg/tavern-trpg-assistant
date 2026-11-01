import type { Fix } from '../engine'

const from = (id: string, target: string, basis: string): Fix => ({
  id, path: '/data/characteristicsFrom', op: 'set', before: undefined, after: target, basis,
})

export const ROWS: Fix[] = [
  from('background.city-watch.scag', 'background.soldier.phb', 'SCAG 城市守卫 p?：使用士兵背景的特征表'),
  from('background.variant-city-watch-investigator.scag', 'background.soldier.phb', 'SCAG 城市守卫调查员：使用士兵背景的特征表'),
  from('background.knight-of-the-order.scag', 'background.soldier.phb', 'SCAG 骑士团骑士：使用士兵背景的特征表'),
  from('background.mercenary-veteran.scag', 'background.soldier.phb', 'SCAG 佣兵老兵：使用士兵背景的特征表'),
  from('background.clan-crafter.scag', 'background.guild-artisan.phb', 'SCAG 氏族工匠：使用公会工匠背景的特征表'),
  from('background.courtier.scag', 'background.guild-artisan.phb', 'SCAG 朝臣：使用公会工匠背景的特征表'),
  from('background.cloistered-scholar.scag', 'background.sage.phb', 'SCAG 隐世学者：使用智者背景的特征表'),
  from('background.faction-agent.scag', 'background.acolyte.phb', 'SCAG 派系特工：使用侍僧背景的特征表'),
  from('background.urban-bounty-hunter.scag', 'background.criminal.phb', 'SCAG 城市赏金猎人：使用罪犯背景的特征表'),
  from('background.uthgardt-tribe-member.scag', 'background.outlander.phb', 'SCAG 乌斯伽部族成员：使用化外之民背景的特征表'),
  from('background.waterdhavian-noble.scag', 'background.noble.phb', 'SCAG 深水人贵族：使用贵族背景的特征表'),
  from('background.inheritor.scag', 'background.folk-hero.phb', 'SCAG 继承人：使用平民英雄背景的特征表'),
  {
    id: 'background.uthgardt-tribe-member.scag',
    path: '/data/text/2',
    op: 'set',
    before: { p: '使用《玩家手册》中化外之民背景的特征表格作为你的基础特征和动机，并在适当的时候修改条目以让其符合你作为乌斯伽部族成员的身份。' },
    after: { h: '建议人物特征', body: [
      { p: '使用《玩家手册》中化外之民背景的特征表格作为你的基础特征和动机，并在适当的时候修改条目以让其符合你作为乌斯伽部族成员的身份。' },
      { p: '即使已经离开了自己的部族（至少目前如此），你仍坚守着同胞的传统。你绝不会砍倒一棵尚且活着的树，也绝不容忍这样的事在你眼前发生。乌斯伽人的祖丘——图腾精魂被乌特加击败、部族英雄安葬于此的大丘陵——对你而言是神圣之地。' },
      { p: '你的牵绊很可能与你的部族、或乌斯伽人的某种观念或文化相关（甚至可能与乌特加本人相关）。你的理念是你个人的选择，它多半与同胞的精神信念紧密相连，且绝不会与你身为乌斯伽人所代表的意义相抵触。' },
    ] },
    basis: 'SCAG 乌斯伽部族成员“建议特征”一节（补回缺失的标题结构）',
  },
  { id: 'background.uthgardt-tribe-member.scag', path: '/data/text/4', op: 'delete', before: { p: '你的牵绊很可能与你的部族、或乌斯伽人的某种观念或文化相关（甚至可能与乌特加本人相关）。你的理念是你个人的选择，它多半与同胞的精神信念紧密相连，且绝不会与你身为乌斯伽人所代表的意义相抵触。' }, basis: '已并入建议人物特征标题' },
  { id: 'background.uthgardt-tribe-member.scag', path: '/data/text/3', op: 'delete', before: { p: '即使已经离开了自己的部族（至少目前如此），你仍坚守着同胞的传统。你绝不会砍倒一棵尚且活着的树，也绝不容忍这样的事在你眼前发生。乌斯伽人的祖丘——图腾精魂被乌特加击败、部族英雄安葬于此的大丘陵——对你而言是神圣之地。' }, basis: '已并入建议人物特征标题' },
  {
    id: 'background.waterdhavian-noble.scag',
    path: '/data/text/2',
    op: 'set',
    before: { p: '使用《玩家手册》中贵族背景的特征表格作为你的基础特征和动机，并在适当的时候修改条目以让其符合你作为深水人贵族的身份。' },
    after: { h: '建议人物特征', body: [
      { p: '使用《玩家手册》中贵族背景的特征表格作为你的基础特征和动机，并在适当的时候修改条目以让其符合你作为深水人贵族的身份。' },
      { p: '和其他贵族一样，你出生和成长的世界与大多数人的认知不同——这是一种赋予你特权、但同时要求你履行相应义务的身份。你的牵绊可能与所属家族相关，也可能与另一个和你们家族结盟或敌对的贵族家族相关。你的理念某种程度上取决于你如何看待自己在家族中的角色，以及你打算如何以家族代表的身份行于世间。' },
    ] },
    basis: 'SCAG 深水人贵族“建议特征”一节（补回缺失的标题结构）',
  },
  { id: 'background.waterdhavian-noble.scag', path: '/data/text/3', op: 'delete', before: { p: '和其他贵族一样，你出生和成长的世界与大多数人的认知不同——这是一种赋予你特权、但同时要求你履行相应义务的身份。你的牵绊可能与所属家族相关，也可能与另一个和你们家族结盟或敌对的贵族家族相关。你的理念某种程度上取决于你如何看待自己在家族中的角色，以及你打算如何以家族代表的身份行于世间。' }, basis: '已并入建议人物特征标题' },
]
