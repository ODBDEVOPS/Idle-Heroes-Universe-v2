import { Specialization, SpecializationPath } from '../models/specialization.model';

export const ALL_SPECIALIZATIONS: Record<string, Specialization> = {
  // --- KNIGHT PATH ---
  // Promotion 1
  'knight_crusader': {
    id: 'knight_crusader',
    name: 'Crusader',
    description: 'A holy warrior who channels divine power into devastating strikes.',
    icon: '✝️',
    statBonuses: { dpsPercent: 0.10, skillDamagePercent: 0.15 },
    skillModification: { newDescription: 'Deals a massive burst of holy damage that also burns the enemy for a short time.' }
  },
  'knight_guardian': {
    id: 'knight_guardian',
    name: 'Guardian',
    description: 'An unshakeable bastion of defense, protecting allies by drawing enemy fire.',
    icon: '🛡️',
    roleOverride: 'Tank',
    statBonuses: { dpsPercent: -0.05 }, // Guardians trade some damage for immense durability (conceptual)
    skillModification: { newDescription: 'Hardens its armor, becoming nearly invulnerable and taunting the enemy.' }
  },

  // Promotion 2 (from Crusader)
  'crusader_zealot': {
    id: 'crusader_zealot',
    name: 'Zealot',
    description: 'A fanatical fighter who sacrifices all for pure, unadulterated holy damage.',
    icon: '🔥',
    statBonuses: { dpsPercent: 0.25, skillDamagePercent: 0.30 },
  },
  'crusader_templar': {
    id: 'crusader_templar',
    name: 'Templar',
    description: 'A balanced commander of the battlefield, blending damage with team-wide buffs.',
    icon: '⚜️',
    statBonuses: { dpsPercent: 0.15, skillDamagePercent: 0.15 },
  },

  // Promotion 2 (from Guardian)
  'guardian_paladin': {
    id: 'guardian_paladin',
    name: 'Paladin',
    description: 'A holy protector who defends allies and mends their wounds with divine light.',
    icon: '💖',
    roleOverride: 'Healer', // Becomes a Tank/Healer hybrid
    statBonuses: { dpsPercent: 0.05 },
    skillModification: { newDescription: 'Unleashes a wave of light that heals the team slightly and damages the enemy.' }
  },
  'guardian_juggernaut': {
    id: 'guardian_juggernaut',
    name: 'Juggernaut',
    description: 'An unstoppable force of nature, with unmatched defensive capabilities.',
    icon: '🧱',
    roleOverride: 'Tank',
    statBonuses: { dpsPercent: 0 },
  },
};

export const ALL_SPECIALIZATION_PATHS: Record<string, SpecializationPath> = {
  'Knight': {
    baseClass: 'Knight',
    promotion1: {
      levelReq: 50,
      cost: 1, // Essence of Loyalty
      options: ['knight_crusader', 'knight_guardian']
    },
    promotion2: {
      levelReq: 100,
      cost: 5, // Essence of Loyalty
      options: {
        'knight_crusader': ['crusader_zealot', 'crusader_templar'],
        'knight_guardian': ['guardian_paladin', 'guardian_juggernaut'],
      }
    },
  }
};
