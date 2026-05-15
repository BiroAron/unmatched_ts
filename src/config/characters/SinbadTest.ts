import { type CharacterData, createCards } from "../../types/Character.ts";

export const TEST_FIGHTER_DATA: CharacterData = {
  id: "test-fighter",
  name: "TestFighter",
  maxHp: 14,
  rangeType: "MELEE",
  registerHooks: () => {},
  deck: [
    ...createCards(
      {
        title: "Strike",
        type: "ATTACK",
        value: 3,
        boost: 1,
        characterName: "Any",
        tags: [],
        effects: [],
      },
      4,
      "tf-str",
    ),
    ...createCards(
      {
        title: "Block",
        type: "DEFENSE",
        value: 3,
        boost: 1,
        characterName: "Any",
        tags: [],
        effects: [],
      },
      4,
      "tf-blk",
    ),
    ...createCards(
      {
        title: "Feint",
        type: "VERSATILE",
        value: 2,
        boost: 1,
        characterName: "Any",
        tags: [],
        effects: [{ phase: "immediately", type: "cancel" }],
      },
      3,
      "tf-fnt",
    ),
    ...createCards(
      {
        title: "Regroup",
        type: "VERSATILE",
        value: 1,
        boost: 1,
        characterName: "Any",
        tags: [],
        effects: [
          { phase: "afterCombat", type: "draw", value: 1, condition: "won" },
          { phase: "afterCombat", type: "draw", value: 2, condition: "lost" },
        ],
      },
      4,
      "tf-reg",
    ),
  ],
};
