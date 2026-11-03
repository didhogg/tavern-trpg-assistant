import type { DeriveContext, DerivePerson, PersonDerived } from './types'
import { deriveAbilities, deriveInitiative, derivePassives, deriveSaves, deriveSkills, proficiencyFor, totalLevel } from './abilities'
import { deriveAc, deriveHp, deriveSpeed } from './combat'
import { deriveSpellSlots } from './spells'

export * from './types'
export { abilityModifier, crProficiency, crValue, deriveAbilities, deriveInitiative, derivePassives, deriveSaves, deriveSkills, proficiencyFor, totalLevel } from './abilities'
export { deriveAc, deriveHp, deriveSpeed } from './combat'
export { deriveSpellSlots } from './spells'

/** 一次算完概览带需要的全部派生数值；UNIT3 的抽屉复用同一组函数。 */
export function derivePerson(person: DerivePerson, ctx: DeriveContext): PersonDerived {
  const abilities = deriveAbilities(person, ctx)
  const proficiency = proficiencyFor(person, ctx)
  const saves = deriveSaves(person, ctx, abilities, proficiency)
  const skills = deriveSkills(person, ctx, abilities, proficiency)
  return {
    level: totalLevel(ctx) || null,
    proficiency,
    abilities,
    saves,
    skills,
    initiative: deriveInitiative(person, ctx, abilities),
    passives: derivePassives(person, ctx, skills),
    ac: deriveAc(person, ctx, abilities),
    hp: deriveHp(person, ctx, abilities),
    speed: deriveSpeed(person, ctx),
    spellSlots: deriveSpellSlots(person, ctx),
  }
}

export { derivePerson as derive }
