import type { Entry } from "../../../src/schemas/pack"

export const BASELINE_ALIASES: Entry[] = [
  {
    "data": {
      "attunement": {
        "required": true
      },
      "baseItem": "刺剑",
      "category": "weapon",
      "credit": {
        "by": "共库机翻",
        "license": "CC-BY-NC-SA-4.0",
        "machine": true,
        "missing": [],
        "srd": true
      },
      "lootTables": [
        "魔法物品表H"
      ],
      "properties": [
        "F"
      ],
      "rarity": "very rare",
      "src": {
        "book": "DMG",
        "page": 206
      },
      "text": [
        {
          "p": "当你用这把魔法剑攻击一个物体并且命中时，对目标造成的伤害骰达到最大值。"
        },
        {
          "p": "当你用这件武器攻击一个生物并且在攻击骰上掷出20时，那个目标会额外受到14点挥砍伤害。然后再次掷一个{{roll:d20|d20}}。如果你掷出20，你会切断目标的一只肢体，这种损失的效果由DM决定。如果生物没有肢体可以切断，你会切断它身体的一部分。"
        },
        {
          "p": "{{em:注意：根据SRD，它造成额外4d6挥砍伤害，尽管这是不正确的}}."
        },
        {
          "p": "此外，你可以说出剑的命令词，使剑刃在10尺半径内散发出明亮的光线，并在额外的10尺内散发出微光。再次说出命令词或收剑入鞘可以熄灭光线。"
        }
      ],
      "value": 2500,
      "weapon": {
        "category": "martial",
        "damage": [
          {
            "dice": "1d8",
            "type": "piercing"
          }
        ],
        "properties": [
          "F"
        ]
      },
      "weight": 2
    },
    "id": "item.rapier-sword-of-sharpness.dmg",
    "keywords": [
      "锐锋刺剑",
      "锐锋Rapier"
    ],
    "name": "锐锋刺剑",
    "nameEn": "锐锋Rapier",
    "summary": "锐锋刺剑｜武器·极稀有｜1d8 穿刺",
    "type": "item",
    "unique": false
  },
  {
    "data": {
      "attunement": {
        "required": true
      },
      "baseItem": "刺剑",
      "bonuses": {
        "attack": "+3"
      },
      "category": "weapon",
      "credit": {
        "by": "共库机翻",
        "license": "CC-BY-NC-SA-4.0",
        "machine": true,
        "missing": [],
        "srd": true
      },
      "lootTables": [
        "魔法物品表I"
      ],
      "properties": [
        "F"
      ],
      "rarity": "legendary",
      "src": {
        "book": "DMG",
        "page": 209
      },
      "text": [
        {
          "p": "你用此魔法武器进行的攻击检定和伤害掷骰获得 +3 加值。此外，此武器无视对挥砍伤害的抗性。"
        },
        {
          "p": "当你命中一名有头生物并投出 20 时，你砍下该生物的一颗头。如果该生物无法在失去头的情况下生存，则它将随之死亡。免疫挥砍伤害、没有头、不需要头、有传奇动作或DM认为体型太大无法被斩首的生物免疫斩首效应，但额外受到 {{roll:6d8|6d8}} 点挥砍伤害。"
        }
      ],
      "value": 2500,
      "weapon": {
        "category": "martial",
        "damage": [
          {
            "dice": "1d8+3",
            "type": "piercing"
          }
        ],
        "properties": [
          "F"
        ]
      },
      "weight": 2
    },
    "id": "item.rapier-vorpal-sword.dmg",
    "keywords": [
      "斩首刺剑",
      "斩首Rapier"
    ],
    "name": "斩首刺剑",
    "nameEn": "斩首Rapier",
    "summary": "斩首刺剑｜武器·传奇｜1d8+3 穿刺",
    "type": "item",
    "unique": false
  },
  {
    "data": {
      "attunement": {
        "required": true
      },
      "baseItem": "短剑",
      "category": "weapon",
      "credit": {
        "by": "共库机翻",
        "license": "CC-BY-NC-SA-4.0",
        "machine": true,
        "missing": [],
        "srd": true
      },
      "lootTables": [
        "魔法物品表H"
      ],
      "properties": [
        "F",
        "L"
      ],
      "rarity": "very rare",
      "src": {
        "book": "DMG",
        "page": 206
      },
      "text": [
        {
          "p": "当你用这把魔法剑攻击一个物体并且命中时，对目标造成的伤害骰达到最大值。"
        },
        {
          "p": "当你用这件武器攻击一个生物并且在攻击骰上掷出20时，那个目标会额外受到14点挥砍伤害。然后再次掷一个{{roll:d20|d20}}。如果你掷出20，你会切断目标的一只肢体，这种损失的效果由DM决定。如果生物没有肢体可以切断，你会切断它身体的一部分。"
        },
        {
          "p": "{{em:注意：根据SRD，它造成额外4d6挥砍伤害，尽管这是不正确的}}."
        },
        {
          "p": "此外，你可以说出剑的命令词，使剑刃在10尺半径内散发出明亮的光线，并在额外的10尺内散发出微光。再次说出命令词或收剑入鞘可以熄灭光线。"
        }
      ],
      "value": 1000,
      "weapon": {
        "category": "martial",
        "damage": [
          {
            "dice": "1d6",
            "type": "piercing"
          }
        ],
        "properties": [
          "F",
          "L"
        ]
      },
      "weight": 2
    },
    "id": "item.shortsword-sword-of-sharpness.dmg",
    "keywords": [
      "锐锋短剑",
      "锐锋Shortsword"
    ],
    "name": "锐锋短剑",
    "nameEn": "锐锋Shortsword",
    "summary": "锐锋短剑｜武器·极稀有｜1d6 穿刺",
    "type": "item",
    "unique": false
  },
  {
    "data": {
      "attunement": {
        "required": true
      },
      "baseItem": "短剑",
      "bonuses": {
        "attack": "+3"
      },
      "category": "weapon",
      "credit": {
        "by": "共库机翻",
        "license": "CC-BY-NC-SA-4.0",
        "machine": true,
        "missing": [],
        "srd": true
      },
      "lootTables": [
        "魔法物品表I"
      ],
      "properties": [
        "F",
        "L"
      ],
      "rarity": "legendary",
      "src": {
        "book": "DMG",
        "page": 209
      },
      "text": [
        {
          "p": "你用此魔法武器进行的攻击检定和伤害掷骰获得 +3 加值。此外，此武器无视对挥砍伤害的抗性。"
        },
        {
          "p": "当你命中一名有头生物并投出 20 时，你砍下该生物的一颗头。如果该生物无法在失去头的情况下生存，则它将随之死亡。免疫挥砍伤害、没有头、不需要头、有传奇动作或DM认为体型太大无法被斩首的生物免疫斩首效应，但额外受到 {{roll:6d8|6d8}} 点挥砍伤害。"
        }
      ],
      "value": 1000,
      "weapon": {
        "category": "martial",
        "damage": [
          {
            "dice": "1d6+3",
            "type": "piercing"
          }
        ],
        "properties": [
          "F",
          "L"
        ]
      },
      "weight": 2
    },
    "id": "item.shortsword-vorpal-sword.dmg",
    "keywords": [
      "斩首短剑",
      "斩首Shortsword"
    ],
    "name": "斩首短剑",
    "nameEn": "斩首Shortsword",
    "summary": "斩首短剑｜武器·传奇｜1d6+3 穿刺",
    "type": "item",
    "unique": false
  }
]
