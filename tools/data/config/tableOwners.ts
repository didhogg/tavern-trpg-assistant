/**
 * 书里的表挂到条目：章节标题（或表名）→ 这些条目（G2.5 P4）。
 * 5etools、Foundry 都没有"这张表属于哪个怪物／种族"的数据，只有书里的章节结构；这份字典就是把章节标题对到条目，约 30 行。
 * 条目用「编号」或「正则」写；只在 mm／vgm／mtf／dmg／phb／scag／xge／tce 的怪物、种族、亚种里找（MPMM 的重印不收，它们是同一怪物的再版）。
 * 第一个命中的条目作为主人（parent.id），其余写进 parent.appliesTo。字典行必须至少命中一个条目，否则构建报错。
 */
export interface OwnerRule { book: string; by: 'section' | 'name'; key: string; ids: Array<string | RegExp> }

const re = (s: string): RegExp => new RegExp(s)
export const TABLE_OWNERS: OwnerRule[] = [
  // 魔古尔怪物指南（VGM）·怪物学识：每个怪物家族一个章节
  { book: 'VGM', by: 'section', key: '眼魔：噩梦成真', ids: ['monster.beholder.mm', re('^monster\\.(death-tyrant|spectator)\\.mm$'), re('^monster\\.(gauth|gazer|death-kiss)\\.vgm$')] },
  { book: 'VGM', by: 'section', key: '蛇人：半蛇半人', ids: ['monster.yuan-ti-pureblood.mm', 'race.yuan-ti-pureblood.vgm', re('^monster\\.yuan-ti-.*\\.(mm|vgm)$')] },
  { book: 'VGM', by: 'section', key: '鬣狗人：欲壑难填', ids: ['monster.gnoll.mm', re('^monster\\.(gnoll-.*|flind)\\.(mm|vgm)$'), 'monster.yeenoghu.mtf'] },
  { book: 'VGM', by: 'section', key: '鬼婆：黑暗姐妹', ids: ['monster.green-hag.mm', re('^monster\\.(night-hag|sea-hag)\\.mm$'), re('^monster\\.(annis|bheur)-hag\\.vgm$')] },
  { book: 'VGM', by: 'section', key: '兽人：神授之民', ids: ['monster.orc.mm', 'race.orc.vgm', re('^monster\\.(orc-.*|orog)\\.(mm|vgm)$'), 'monster.tanarukk.vgm'] },
  { book: 'VGM', by: 'section', key: '巨人：撼世之人', ids: [re('^monster\\.(hill|stone|frost|fire|cloud|storm)-giant\\.mm$'), 'monster.fomorian.mm'] },
  { book: 'VGM', by: 'section', key: '夺心魔：世界之灾', ids: ['monster.mind-flayer.mm', re('^monster\\.(mind-flayer-arcanist|intellect-devourer)\\.mm$'), re('^monster\\.(mind-flayer-psion|ulitharid|elder-brain|neothelid)\\.vgm$')] },
  { book: 'VGM', by: 'section', key: '狗头人：小小巨龙', ids: ['monster.kobold.mm', 'race.kobold.vgm', 'monster.winged-kobold.mm', re('^monster\\.kobold-.*\\.vgm$')] },
  { book: 'VGM', by: 'section', key: '地精', ids: ['monster.goblin.mm', 'race.goblin.vgm', 'monster.goblin-boss.mm'] },
  { book: 'VGM', by: 'section', key: '大地精', ids: ['monster.hobgoblin.mm', 'race.hobgoblin.vgm', re('^monster\\.hobgoblin-.*\\.(mm|vgm)$')] },
  // 魔邓肯的众敌之册（MTF）
  { book: 'MTF', by: 'section', key: '吉斯人表格', ids: [re('^monster\\.(githyanki|githzerai)-.*\\.(mm|mtf)$'), 'race.gith.mtf', 'subrace.gith-githyanki.mtf', 'subrace.gith-githzerai.mtf'] },
  { book: 'MTF', by: 'section', key: '吉斯人角色', ids: ['race.gith.mtf', 'subrace.gith-githyanki.mtf', 'subrace.gith-githzerai.mtf'] },
  { book: 'MTF', by: 'section', key: '灰矮人表格', ids: ['subrace.dwarf-duergar.mtf', re('^monster\\.duergar.*\\.(mm|mtf)$')] },
  { book: 'MTF', by: 'section', key: '矮人表格', ids: ['race.dwarf.phb', 'subrace.dwarf-hill.phb', 'subrace.dwarf-mountain.phb'] },
  { book: 'MTF', by: 'section', key: '半身人表格', ids: ['race.halfling.phb', 'subrace.halfling-lightfoot.phb', 'subrace.halfling-stout.phb'] },
  { book: 'MTF', by: 'section', key: '侏儒表格', ids: ['race.gnome.phb', 'subrace.gnome-forest.phb', 'subrace.gnome-rock.phb'] },
  { book: 'MTF', by: 'section', key: '精灵表格', ids: ['race.elf.phb', 'subrace.elf-high.phb', 'subrace.elf-wood.phb', 'subrace.elf-drow.phb'] },
  { book: 'MTF', by: 'section', key: '魔鬼定制表格', ids: [re('^monster\\.(barbed|bearded|bone|chain|horned|ice|spined)-devil\\.mm$'), 'monster.geryon.mtf', 'monster.zariel.mtf'] },
  { book: 'MTF', by: 'section', key: '恶魔定制表格', ids: [re('^monster\\.(balor|glabrezu|hezrou|marilith|nalfeshnee|vrock|shadow-demon)\\.mm$')] },
  { book: 'MTF', by: 'section', key: '邪恶教派', ids: ['monster.cult-fanatic.mm', 'monster.cultist.mm'] },
  // 珊娜萨的万事指南（XGE）种族双亲表、SCAG／MTF 的种族神祇表：表名就是种族
  { book: 'XGE', by: 'name', key: '半精灵双亲', ids: ['race.half-elf.phb'] },
  { book: 'XGE', by: 'name', key: '半兽人双亲', ids: ['race.half-orc.phb'] },
  { book: 'XGE', by: 'name', key: '提夫林双亲', ids: ['race.tiefling.phb'] },
  { book: 'SCAG', by: 'name', key: '矮人神系', ids: ['race.dwarf.phb'] },
  { book: 'SCAG', by: 'name', key: '精灵神系', ids: ['race.elf.phb'] },
  { book: 'SCAG', by: 'name', key: '卓尔神系', ids: ['subrace.elf-drow.phb'] },
  { book: 'SCAG', by: 'name', key: '半身人神系', ids: ['race.halfling.phb'] },
  { book: 'SCAG', by: 'name', key: '侏儒神系', ids: ['race.gnome.phb'] },
  { book: 'SCAG', by: 'name', key: '兽人神系', ids: ['race.orc.dmg'] },
]
