import { signal, computed, WritableSignal } from '@angular/core';
import { GameState, ActiveDungeonRun, TeamPreset, ActiveDungeonBounty, HeroFarmState, GuildMember } from '../app/models/game-state.model';
// FIX: Import Rarity from equipment.model.ts to break circular dependency.
import { Hero, Role, HeroStats } from '../app/models/hero.model';
import { Enemy, EnemyType, CodexMonster, Anomaly, RiftEnemy } from '../app/models/enemy.model';
import { Quest } from '../app/models/quest.model';
import { EquipmentItem, EquipmentSlot, EquipmentBonusType, Rarity, ALL_EQUIPMENT_SETS } from '../app/models/equipment.model';
import { Artifact } from '../app/models/artifact.model';
import { Expedition, OngoingExpedition } from '../app/models/expedition.model';
import { Blessing, BlessingType, ActiveBlessing, BlessingCooldown } from '../app/models/celestial-shrine.model';
import { Dungeon, DungeonDifficulty, DungeonBounty, DungeonShopItem } from '../app/models/dungeon.model';
import { LeaderboardEntry } from '../app/models/leaderboard.model';
import { Pet, PlayerPet } from '../app/models/pet.model';
import { ChronicleService, StrategicAnalysisPayload } from './chronicle.service';
import { HeroMemory, ChronicleQuest } from '../app/models/chronicle.model';
import { SkillTreeNodeEffect } from '../app/models/skill-tree.model';
import { SKILL_TREE_DATA } from '../app/data/skill-tree-data';
import { ASCII_ART } from '../app/data/ascii-art';
import { Material, ALL_MATERIALS } from '../app/models/material.model';
import { Specialization, SpecializationPath } from '../app/models/specialization.model';
import { ALL_SPECIALIZATIONS, ALL_SPECIALIZATION_PATHS } from '../app/data/specializations';
import { TowerChallenge, TowerChallengeOutcome } from '../app/models/tower.model';
import { MissionReward } from '../app/models/mission.model';
import { ALL_MISSIONS } from '../app/data/missions-data';
import { ALL_NECRO_CONSTRUCTS, ALL_NECRO_RECIPES, NecroConstruct, NecroConstructRecipe } from '../app/models/necro-construct.model';

// FIX: Added missing baseHp, maxHp, currentHp to all hero definitions.
export const ALL_HEROES: Omit<Hero, 'currentDps' | 'nextLevelCost' | 'equipment' | 'skillCharge' | 'skillReady' | 'currentXp' | 'xpToNextLevel' | 'offlineXp'>[] = [
  // Starting Heroes
  { id: 1, name: 'Starlight Knight', level: 1, baseDps: 2, baseHp: 160, maxHp: 160, currentHp: 160, baseCost: 10, upgradeCostMultiplier: 1.1, rarity: 'Common', role: 'DPS', skillDescription: 'Deals a burst of holy damage to the enemy.', lore: 'A loyal knight sworn to protect the innocent, wielding a sword blessed by the cosmos.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Knight' },
  { id: 2, name: 'Shadow Archer', level: 0, baseDps: 10, baseHp: 800, maxHp: 0, currentHp: 0, baseCost: 100, upgradeCostMultiplier: 1.15, rarity: 'Rare', role: 'Marksman', skillDescription: 'Fires a shadow-infused arrow that pierces enemy defenses.', lore: 'A silent hunter from the twilight forests, her arrows never miss their mark.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Archer' },
  { id: 3, name: 'Chrono Mage', level: 0, baseDps: 50, baseHp: 4000, maxHp: 0, currentHp: 0, baseCost: 1000, upgradeCostMultiplier: 1.2, rarity: 'Epic', role: 'Mage', skillDescription: 'Unleashes a time-distorting spell, causing massive damage.', lore: 'A master of time magic, she can bend reality to her will, though fears its ultimate price.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Mage' },
  { id: 4, name: 'Iron Guardian', level: 0, baseDps: 2, baseHp: 300, maxHp: 0, currentHp: 0, baseCost: 200, upgradeCostMultiplier: 1.12, rarity: 'Rare', role: 'Tank', skillDescription: 'Hardens its armor, becoming nearly invulnerable for a short time.', lore: 'An ancient golem animated by a powerful rune, its only purpose is to protect its allies.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Guardian' },
  { id: 5, name: 'Sun Priestess', level: 0, baseDps: 4, baseHp: 400, maxHp: 0, currentHp: 0, baseCost: 500, upgradeCostMultiplier: 1.18, rarity: 'Epic', role: 'Healer', skillDescription: 'Heals all allies and grants a temporary damage boost.', lore: 'A devoted follower of the sun god, her prayers can mend wounds and inspire courage.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Priest' },
  // Summonable Heroes
  { id: 6, name: 'Village Guard', level: 0, baseDps: 1, baseHp: 150, maxHp: 0, currentHp: 0, baseCost: 15, upgradeCostMultiplier: 1.1, rarity: 'Common', role: 'Tank', skillDescription: 'Raises his shield, absorbing a moderate amount of damage.', lore: 'A simple man with uncommon courage, he stands firm to protect his home and friends.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Guard' },
  { id: 7, name: 'Forest Scout', level: 0, baseDps: 3, baseHp: 240, maxHp: 0, currentHp: 0, baseCost: 25, upgradeCostMultiplier: 1.11, rarity: 'Common', role: 'Assassin', skillDescription: 'Throws a poisoned dagger, dealing damage over time.', lore: 'Swift and unseen, he knows every secret path through the whispering woods.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Scout' },
  { id: 8, name: 'Rogue Assassin', level: 0, baseDps: 15, baseHp: 1200, maxHp: 0, currentHp: 0, baseCost: 120, upgradeCostMultiplier: 1.16, rarity: 'Rare', role: 'Assassin', skillDescription: 'Strikes from the shadows, dealing critical damage.', lore: 'A former member of a thieves\' guild, she now fights for her own code of honor.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Rogue' },
  { id: 9, name: 'Ice Sorceress', level: 0, baseDps: 8, baseHp: 640, maxHp: 0, currentHp: 0, baseCost: 150, upgradeCostMultiplier: 1.17, rarity: 'Rare', role: 'Mage', skillDescription: 'Freezes the enemy, slowing their attacks for a period.', lore: 'Born in the frozen north, she commands the biting cold with elegant fury.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Sorcerer' },
  { id: 10, name: 'Dragon Knight', level: 0, baseDps: 20, baseHp: 2400, maxHp: 0, currentHp: 0, baseCost: 1200, upgradeCostMultiplier: 1.21, rarity: 'Epic', role: 'Bruiser', skillDescription: 'Breathes fire in a wide arc, damaging the enemy.', lore: 'Bonded with a mighty dragon, his armor is infused with its fiery essence.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Knight' },
  { id: 11, name: 'Celestial Healer', level: 0, baseDps: 10, baseHp: 1000, maxHp: 0, currentHp: 0, baseCost: 1500, upgradeCostMultiplier: 1.22, rarity: 'Epic', role: 'Healer', skillDescription: 'Summons a star that heals the most wounded ally over time.', lore: 'An angelic being who descended to aid mortals in their endless struggle against darkness.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Healer' },
  { id: 12, name: 'Void Walker', level: 0, baseDps: 250, baseHp: 20000, maxHp: 0, currentHp: 0, baseCost: 10000, upgradeCostMultiplier: 1.25, rarity: 'Legendary', role: 'Démoniste', skillDescription: 'Opens a rift to the void, dealing immense and unpredictable damage.', lore: 'A being who has gazed into the abyss and returned, wielding its chaotic power.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Warlock' },
  { id: 13, name: 'Phoenix Rider', level: 0, baseDps: 300, baseHp: 24000, maxHp: 0, currentHp: 0, baseCost: 12000, upgradeCostMultiplier: 1.26, rarity: 'Legendary', role: 'Mage', skillDescription: 'Engulfs the battlefield in flames, dealing heavy damage.', lore: 'Reborn from ashes alongside his immortal companion, he is a symbol of eternal struggle and rebirth.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Mage' },
  // New Heroes
  { id: 14, name: 'Cyber Ninja', level: 0, baseDps: 120, baseHp: 9600, maxHp: 0, currentHp: 0, baseCost: 5000, upgradeCostMultiplier: 1.23, rarity: 'Epic', role: 'Video game Hero', skillDescription: 'Unleashes a flurry of high-tech shurikens at blinding speed.', lore: 'A warrior from a dystopian future, enhanced with cybernetics to be the perfect assassin.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Ninja' },
  { id: 15, name: 'Mech Pilot', level: 0, baseDps: 400, baseHp: 60000, maxHp: 0, currentHp: 0, baseCost: 15000, upgradeCostMultiplier: 1.28, rarity: 'Legendary', role: 'Tank', skillDescription: 'Fires a massive laser cannon from his mech suit.', lore: 'A prodigy engineer and pilot, his custom-built mech is both a shield and a devastating weapon.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Pilot' },
  { id: 16, name: 'Monster Slayer', level: 0, baseDps: 15, baseHp: 1800, maxHp: 0, currentHp: 0, baseCost: 180, upgradeCostMultiplier: 1.18, rarity: 'Rare', role: 'Video game Hero', skillDescription: 'Performs a powerful swing with her greatsword, effective against large foes.', lore: 'She wanders the land, hunting down the most dangerous beasts for coin and glory.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Slayer' },
  { id: 17, name: 'Cosmic Sorcerer', level: 0, baseDps: 800, baseHp: 64000, maxHp: 0, currentHp: 0, baseCost: 50000, upgradeCostMultiplier: 1.3, rarity: 'Legendary', role: 'Mage', skillDescription: 'Summons a meteor shower, stunning and damaging the enemy.', lore: 'An ancient sage who draws power from the stars themselves, his knowledge is as vast as the universe.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Sorcerer' },
  { id: 18, name: 'Stealth Operative', level: 0, baseDps: 90, baseHp: 7200, maxHp: 0, currentHp: 0, baseCost: 4000, upgradeCostMultiplier: 1.22, rarity: 'Epic', role: 'Assassin', skillDescription: 'Uses a cloaking device to land a guaranteed critical hit.', lore: 'A top-secret agent from a shadowy organization, her past is a classified secret.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Operative' },
  { id: 19, name: 'Pirate Captain', level: 0, baseDps: 75, baseHp: 6000, maxHp: 0, currentHp: 0, baseCost: 3500, upgradeCostMultiplier: 1.20, rarity: 'Epic', role: 'Mangas Hero', skillDescription: 'Orders a cannon barrage from his unseen ship.', lore: 'Feared across the seven seas, he lives for adventure, treasure, and the thrill of battle.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Captain' },
  { id: 20, name: 'Dwarven Brawler', level: 0, baseDps: 25, baseHp: 3000, maxHp: 0, currentHp: 0, baseCost: 250, upgradeCostMultiplier: 1.19, rarity: 'Rare', role: 'Bruiser', skillDescription: 'Slams the ground, stunning the enemy for a moment.', lore: 'Hailing from mountain strongholds, he loves a good fight and a better ale.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Brawler' },
  { id: 21, name: 'Plague Doctor', level: 0, baseDps: 5, baseHp: 500, maxHp: 0, currentHp: 0, baseCost: 40, upgradeCostMultiplier: 1.13, rarity: 'Common', role: 'Shaman', skillDescription: 'Throws a vial that weakens the enemy, increasing damage taken.', lore: 'A mysterious figure whose methods are unorthodox, but surprisingly effective.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Doctor' },
  { id: 22, name: 'Vampire Lord', level: 0, baseDps: 1500, baseHp: 120000, maxHp: 0, currentHp: 0, baseCost: 100000, upgradeCostMultiplier: 1.35, rarity: 'Mythic', role: 'DPS', skillDescription: 'Drains the life force of his enemy to heal himself.', lore: 'An ancient noble cursed with immortality and an unquenchable thirst. His power is matched only by his tragic elegance.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Lord' },
  { id: 23, name: 'Time Traveler', level: 0, baseDps: 12, baseHp: 1200, maxHp: 0, currentHp: 0, baseCost: 1000, upgradeCostMultiplier: 1.24, rarity: 'Epic', role: 'Controller', skillDescription: 'Rewinds time slightly, giving other heroes a second chance to use skills.', lore: 'He has seen the beginning and the end, and now seeks to alter a future he cannot accept.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Traveler' },
  // 20 New Heroes
  { id: 24, name: 'Rift Strider', level: 0, baseDps: 350, baseHp: 28000, maxHp: 0, currentHp: 0, baseCost: 14000, upgradeCostMultiplier: 1.27, rarity: 'Legendary', role: 'Assassin', skillDescription: 'Dashes through the enemy, dealing damage that ignores a portion of defense.', lore: 'Lost between dimensions, the Rift Strider seeks a way back home, using his unstable powers to eliminate obstacles.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Strider' },
  { id: 25, name: 'Golem Forgemaster', level: 0, baseDps: 100, baseHp: 12000, maxHp: 0, currentHp: 0, baseCost: 4500, upgradeCostMultiplier: 1.22, rarity: 'Epic', role: 'Bruiser', skillDescription: 'The golem smashes the ground, dealing AoE damage and stunning the enemy.', lore: 'He doesn\'t just build machines; he gives them a soul. His masterpiece, a golem of living stone and fire, fights by his side.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Forgemaster' },
  { id: 26, name: 'Star Shanty Bard', level: 0, baseDps: 5, baseHp: 500, maxHp: 0, currentHp: 0, baseCost: 200, upgradeCostMultiplier: 1.16, rarity: 'Rare', role: 'Support', skillDescription: 'Plays a song that increases the attack speed of all heroes for a short time.', lore: 'He\'s sailed the cosmic seas, collecting stories and songs. His music channels the very energy of the stars.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Bard' },
  { id: 27, name: 'Feral Berserker', level: 0, baseDps: 18, baseHp: 1440, maxHp: 0, currentHp: 0, baseCost: 220, upgradeCostMultiplier: 1.18, rarity: 'Rare', role: 'DPS', skillDescription: 'For a few seconds, his damage is increased based on his missing health.', lore: 'Exiled from his tribe for his uncontrollable rage, he now channels his fury against the forces of darkness.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Berserker' },
  { id: 28, name: 'Arcane Gunslinger', level: 0, baseDps: 130, baseHp: 10400, maxHp: 0, currentHp: 0, baseCost: 5500, upgradeCostMultiplier: 1.23, rarity: 'Epic', role: 'Marksman', skillDescription: 'Fires a magically-infused bullet that ricochets between enemies.', lore: 'In a world where magic is fading, he\'s found a way to keep it alive, one bullet at a time.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Gunslinger' },
  { id: 29, name: 'Slime King', level: 0, baseDps: 2, baseHp: 300, maxHp: 0, currentHp: 0, baseCost: 30, upgradeCostMultiplier: 1.12, rarity: 'Common', role: 'Tank', skillDescription: 'Splits temporarily, distracting the enemy and reducing incoming damage.', lore: 'Started as a simple ooze, but after absorbing a fallen king\'s crown, he gained intelligence and a rather pompous attitude.', ascensionLevel: 0, skillLevel: 1, baseClass: 'King' },
  { id: 30, name: 'Cursed Samurai', level: 0, baseDps: 500, baseHp: 40000, maxHp: 0, currentHp: 0, baseCost: 25000, upgradeCostMultiplier: 1.29, rarity: 'Legendary', role: 'Mangas Hero', skillDescription: 'A devastating single strike that also damages the Samurai himself.', lore: 'Bound by a blood pact to a demonic sword, he seeks a worthy opponent to finally break his curse or die trying.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Samurai' },
  { id: 31, name: 'Quantum Scientist', level: 0, baseDps: 60, baseHp: 6000, maxHp: 0, currentHp: 0, baseCost: 3000, upgradeCostMultiplier: 1.21, rarity: 'Epic', role: 'Controller', skillDescription: 'Increases the enemy\'s chance to miss attacks for a short period.', lore: 'After a lab accident sent him spiraling through alternate realities, he learned to see and manipulate the threads of chance.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Scientist' },
  { id: 32, name: 'Spirit Shaman', level: 0, baseDps: 12, baseHp: 1200, maxHp: 0, currentHp: 0, baseCost: 180, upgradeCostMultiplier: 1.17, rarity: 'Rare', role: 'Shaman', skillDescription: 'Summons a spirit wolf to attack alongside the heroes for a few seconds.', lore: 'The whispers of generations guide her hand. She is the bridge between the world of the living and the great spirit world.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Shaman' },
  { id: 33, name: 'Galaxy Serpent', level: 0, baseDps: 2000, baseHp: 160000, maxHp: 0, currentHp: 0, baseCost: 150000, upgradeCostMultiplier: 1.36, rarity: 'Mythic', role: 'Mage', skillDescription: 'Calls down a collapsing star, dealing massive damage to the enemy.', lore: 'Older than galaxies, the Serpent is a force of nature, a cycle of cosmic destruction and rebirth made manifest.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Serpent' },
  { id: 34, name: 'Street Brawler', level: 0, baseDps: 4, baseHp: 480, maxHp: 0, currentHp: 0, baseCost: 35, upgradeCostMultiplier: 1.11, rarity: 'Common', role: 'Bruiser', skillDescription: 'A powerful punch that has a small chance to stun the enemy.', lore: 'Grew up fighting for every scrap. Now, he\'s found a bigger fight, and the pay is better.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Brawler' },
  { id: 35, name: 'Elven Mystic', level: 0, baseDps: 6, baseHp: 600, maxHp: 0, currentHp: 0, baseCost: 250, upgradeCostMultiplier: 1.17, rarity: 'Rare', role: 'Healer', skillDescription: 'Creates an aura that slowly regenerates the health of the team.', lore: 'As old as the forest she protects, her wisdom is deep and her magic is woven from life itself.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Mystic' },
  { id: 36, name: 'War Machine Alpha', level: 0, baseDps: 450, baseHp: 36000, maxHp: 0, currentHp: 0, baseCost: 20000, upgradeCostMultiplier: 1.28, rarity: 'Legendary', role: 'Video game Hero', skillDescription: 'Unleashes a barrage of missiles, rockets, and lasers.', lore: 'Originally a military AI, it achieved self-awareness and now fights to protect all forms of life, organic and synthetic.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Machine' },
  { id: 37, name: 'Sand Wraith', level: 0, baseDps: 95, baseHp: 7600, maxHp: 0, currentHp: 0, baseCost: 4800, upgradeCostMultiplier: 1.23, rarity: 'Epic', role: 'Assassin', skillDescription: 'Envelops the enemy in a cursed sandstorm, dealing persistent damage.', lore: 'Born from the last breath of a betrayed king, the Sand Wraith tirelessly hunts those who have wronged the innocent.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Wraith' },
  { id: 38, name: 'Gravity Witch', level: 0, baseDps: 70, baseHp: 7000, maxHp: 0, currentHp: 0, baseCost: 4200, upgradeCostMultiplier: 1.22, rarity: 'Epic', role: 'Controller', skillDescription: 'Crushes the enemy under immense gravitational force, significantly slowing them.', lore: 'She carries the weight of a dying star in her heart, allowing her to bend the fundamental forces of the universe to her will.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Witch' },
  { id: 39, name: 'JRPG Protagonist', level: 0, baseDps: 600, baseHp: 48000, maxHp: 0, currentHp: 0, baseCost: 40000, upgradeCostMultiplier: 1.31, rarity: 'Legendary', role: 'Mangas Hero', skillDescription: 'Unleashes a multi-hit combo attack that grows stronger with each prestige.', lore: 'He woke up in this universe with amnesia, a giant sword, and an unshakable feeling that he needs to save the world.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Protagonist' },
  { id: 40, name: 'Field Medic', level: 0, baseDps: 1, baseHp: 100, maxHp: 0, currentHp: 0, baseCost: 20, upgradeCostMultiplier: 1.1, rarity: 'Common', role: 'Healer', skillDescription: 'Applies a bandage to the most damaged hero, healing a small amount of health.', lore: 'She\'s seen the horrors of war and is determined to save as many lives as she can, one bandage at a time.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Medic' },
  { id: 41, name: 'Abyssal Warlock', level: 0, baseDps: 1800, baseHp: 144000, maxHp: 0, currentHp: 0, baseCost: 120000, upgradeCostMultiplier: 1.35, rarity: 'Mythic', role: 'Démoniste', skillDescription: 'Forces the enemy to gaze into the abyss, dealing massive damage and causing a random debuff.', lore: 'In his thirst for knowledge, he reached out to the entities between the stars. They answered, granting him power at the cost of his sanity.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Warlock' },
  { id: 42, name: 'Kaiju Hunter', level: 0, baseDps: 380, baseHp: 45600, maxHp: 0, currentHp: 0, baseCost: 16000, upgradeCostMultiplier: 1.27, rarity: 'Legendary', role: 'Bruiser', skillDescription: 'An uppercut that deals bonus damage to bosses.', lore: 'From a world constantly under threat from colossal beasts, she and her Jaeger-like suit are humanity\'s last line of defense.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Hunter' },
  { id: 43, name: 'Aether Blade', level: 0, baseDps: 2500, baseHp: 200000, maxHp: 0, currentHp: 0, baseCost: 200000, upgradeCostMultiplier: 1.38, rarity: 'Mythic', role: 'Assassin', skillDescription: 'Focuses all its energy into a single point, dealing astronomical damage.', lore: 'Not a person, but a weapon given form. The Aether Blade is a living concept of the \'perfect strike\', existing only to end conflicts.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Blade' },
  { id: 44, name: 'Mech Goliath', level: 0, baseDps: 420, baseHp: 63000, maxHp: 0, currentHp: 0, baseCost: 18000, upgradeCostMultiplier: 1.28, rarity: 'Legendary', role: 'Tank', skillDescription: 'Activates a kinetic shield that reflects a portion of enemy damage back.', lore: 'A colossal war machine from a fallen civilization, reactivated to serve a new master.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Mech' },
  { id: 45, name: 'Astral Ranger', level: 0, baseDps: 140, baseHp: 11200, maxHp: 0, currentHp: 0, baseCost: 6000, upgradeCostMultiplier: 1.24, rarity: 'Epic', role: 'Marksman', skillDescription: 'Fires an arrow of pure starlight that never misses and deals extra damage to bosses.', lore: 'A constellation given human form, she hunts down rogue stars and cosmic horrors.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Ranger' },
  { id: 46, name: 'Goblin Tinkerer', level: 0, baseDps: 3, baseHp: 300, maxHp: 0, currentHp: 0, baseCost: 45, upgradeCostMultiplier: 1.14, rarity: 'Common', role: 'Support', skillDescription: 'Throws a gadget that slightly increases the team\'s gold find for a few seconds.', lore: 'More interested in building contraptions than fighting, but his inventions sometimes work.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Tinkerer' },
  { id: 47, name: 'Crimson Witch', level: 0, baseDps: 700, baseHp: 56000, maxHp: 0, currentHp: 0, baseCost: 45000, upgradeCostMultiplier: 1.32, rarity: 'Legendary', role: 'Démoniste', skillDescription: 'Sacrifices a small amount of her own HP to cast a devastating blood magic spell.', lore: 'A powerful sorceress from a shonen universe, she walks the line between chaos and control.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Witch' },
  { id: 48, name: 'Paladin of the Sun', level: 0, baseDps: 80, baseHp: 8000, maxHp: 0, currentHp: 0, baseCost: 4800, upgradeCostMultiplier: 1.22, rarity: 'Epic', role: 'Healer', skillDescription: 'Calls down a beam of sunlight, healing the team and damaging the enemy.', lore: 'A knight whose faith is as unbreakable as his armor. He serves a forgotten deity of light.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Paladin' },
  { id: 49, name: 'Cyberpunk Hacker', level: 0, baseDps: 10, baseHp: 1000, maxHp: 0, currentHp: 0, baseCost: 160, upgradeCostMultiplier: 1.17, rarity: 'Rare', role: 'Controller', skillDescription: 'Uploads a virus that causes the enemy\'s attacks to temporarily deal less damage.', lore: 'She can break any firewall and bypass any security. Now she uses her skills to disrupt enemy forces.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Hacker' },
  { id: 50, name: 'Sand Scythe', level: 0, baseDps: 16, baseHp: 1280, maxHp: 0, currentHp: 0, baseCost: 190, upgradeCostMultiplier: 1.18, rarity: 'Rare', role: 'Assassin', skillDescription: 'A swift strike with a blade of hardened sand that causes the enemy to bleed damage over time.', lore: 'A nomad of the great desert, she is as deadly and silent as the shifting dunes.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Scythe' },
  { id: 51, name: 'Barbarian Chieftain', level: 0, baseDps: 110, baseHp: 13200, maxHp: 0, currentHp: 0, baseCost: 5200, upgradeCostMultiplier: 1.23, rarity: 'Epic', role: 'Bruiser', skillDescription: 'A mighty warcry that boosts his own DPS and the DPS of adjacent heroes.', lore: 'He united the warring clans of the north through sheer strength and force of will.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Barbarian' },
  { id: 52, name: 'Fungal Shaman', level: 0, baseDps: 13, baseHp: 1300, maxHp: 0, currentHp: 0, baseCost: 170, upgradeCostMultiplier: 1.17, rarity: 'Rare', role: 'Shaman', skillDescription: 'Summons toxic spores that poison the enemy, reducing their defense.', lore: 'He communicates with the vast mycelial network beneath the world, drawing strange powers from it.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Shaman' },
  { id: 53, name: 'Knight Errant', level: 0, baseDps: 4, baseHp: 320, maxHp: 0, currentHp: 0, baseCost: 38, upgradeCostMultiplier: 1.12, rarity: 'Common', role: 'DPS', skillDescription: 'A simple, honest sword strike that deals reliable damage.', lore: 'A young knight on a quest to prove his worth. He lacks experience but not courage.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Knight' },
  { id: 54, name: 'Cosmic Overlord', level: 0, baseDps: 2200, baseHp: 176000, maxHp: 0, currentHp: 0, baseCost: 180000, upgradeCostMultiplier: 1.37, rarity: 'Mythic', role: 'Mage', skillDescription: 'Rewrites a law of physics, dealing a percentage of the enemy\'s MAX HP as damage.', lore: 'A being from a higher plane of existence, it views battles as mere equations to be solved.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Overlord' },
  { id: 55, name: 'Silent Blade', level: 0, baseDps: 150, baseHp: 12000, maxHp: 0, currentHp: 0, baseCost: 6500, upgradeCostMultiplier: 1.24, rarity: 'Epic', role: 'Assassin', skillDescription: 'Finds a weak point in the enemy\'s form, increasing all critical damage against them for a time.', lore: 'A member of an ancient order of spies and killers, her name is only a rumor.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Blade' },
  { id: 56, name: 'Shield Maiden', level: 0, baseDps: 7, baseHp: 1050, maxHp: 0, currentHp: 0, baseCost: 140, upgradeCostMultiplier: 1.16, rarity: 'Rare', role: 'Tank', skillDescription: 'Bangs her shield, taunting the enemy and increasing her own defense for a short duration.', lore: 'A fierce warrior from a land of ice and sagas, she is the immovable object to any unstoppable force.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Maiden' },
  { id: 57, name: 'Grove Protector', level: 0, baseDps: 2, baseHp: 300, maxHp: 0, currentHp: 0, baseCost: 32, upgradeCostMultiplier: 1.11, rarity: 'Common', role: 'Tank', skillDescription: 'Roots himself, slightly regenerating his health over a few seconds.', lore: 'A treant given life by ancient magic, he is slow to anger but terrible when roused.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Protector' },
  { id: 58, name: 'Pirate Gunslinger', level: 0, baseDps: 22, baseHp: 1760, maxHp: 0, currentHp: 0, baseCost: 240, upgradeCostMultiplier: 1.18, rarity: 'Rare', role: 'Marksman', skillDescription: 'Fires a "trick shot" that has a chance to drop extra gold on hit.', lore: 'He sails the seas of a popular manga world, known for his incredible aim and even more incredible luck.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Gunslinger' },
  { id: 59, name: 'Chrono Warden', level: 0, baseDps: 320, baseHp: 32000, maxHp: 0, currentHp: 0, baseCost: 13000, upgradeCostMultiplier: 1.26, rarity: 'Legendary', role: 'Controller', skillDescription: 'Creates a time loop, forcing the enemy to repeat its last action, effectively stunning them.', lore: 'Tasked with protecting the timeline, he eliminates anomalies that threaten reality.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Warden' },
  { id: 60, name: 'Archangel of Valor', level: 0, baseDps: 280, baseHp: 28000, maxHp: 0, currentHp: 0, baseCost: 12500, upgradeCostMultiplier: 1.25, rarity: 'Legendary', role: 'Support', skillDescription: 'Grants the entire team a divine shield that absorbs a significant amount of damage.', lore: 'The commander of the celestial host, his presence inspires unwavering courage in his allies.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Angel' },
  { id: 61, name: 'Void Horror', level: 0, baseDps: 2800, baseHp: 224000, maxHp: 0, currentHp: 0, baseCost: 220000, upgradeCostMultiplier: 1.39, rarity: 'Mythic', role: 'DPS', skillDescription: 'Inflicts \'madness\', a debuff that deals increasing damage the longer it stays on the enemy.', lore: 'An eldritch being that slipped through the cracks of reality. Its very presence is a poison to the mind.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Horror' },
  { id: 62, name: 'Spearmaster', level: 0, baseDps: 160, baseHp: 12800, maxHp: 0, currentHp: 0, baseCost: 7000, upgradeCostMultiplier: 1.24, rarity: 'Epic', role: 'Mangas Hero', skillDescription: 'A lightning-fast spear thrust that has a high chance to be a critical hit.', lore: 'A hero from a martial arts manga, his spear is said to be able to pierce the heavens.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Spearmaster' },
  { id: 63, name: 'Detective Enigma', level: 0, baseDps: 11, baseHp: 1100, maxHp: 0, currentHp: 0, baseCost: 175, upgradeCostMultiplier: 1.17, rarity: 'Rare', role: 'Controller', skillDescription: 'Points out a flaw, increasing the damage the enemy takes from all sources for a short time.', lore: 'A famous detective from a mystery video game, he can solve any crime and spot any weakness.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Detective' },
  // New Epic Heroes
  { id: 64, name: 'Golem Sentinel', level: 0, baseDps: 40, baseHp: 6000, maxHp: 0, currentHp: 0, baseCost: 4500, upgradeCostMultiplier: 1.22, rarity: 'Epic', role: 'Tank', skillDescription: 'Taunts the enemy and gains a damage-absorbing shield.', lore: 'An ancient construct built to defend a long-lost city, now bound to protect its new master.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Guardian' },
  { id: 65, name: 'Storm Shaman', level: 0, baseDps: 100, baseHp: 10000, maxHp: 0, currentHp: 0, baseCost: 4800, upgradeCostMultiplier: 1.23, rarity: 'Epic', role: 'Shaman', skillDescription: 'Calls down a chain lightning that strikes the enemy multiple times.', lore: 'A shaman who communes with the tempest, wielding the raw power of thunder and lightning.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Shaman' },
  { id: 66, name: 'Gunslinger Outlaw', level: 0, baseDps: 150, baseHp: 12000, maxHp: 0, currentHp: 0, baseCost: 6000, upgradeCostMultiplier: 1.24, rarity: 'Epic', role: 'Marksman', skillDescription: 'Fires a rapid volley of shots, increasing in damage with each hit.', lore: 'A wanted fugitive from a futuristic world, known for his unmatched speed and deadly accuracy with his twin blasters.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Gunslinger' },
  { id: 67, name: 'Bloodmancer', level: 0, baseDps: 90, baseHp: 7200, maxHp: 0, currentHp: 0, baseCost: 5200, upgradeCostMultiplier: 1.23, rarity: 'Epic', role: 'Démoniste', skillDescription: 'Curses the enemy, causing them to take increased damage from all sources.', lore: 'A warlock who delves into the forbidden art of blood magic, trading life force for immense power.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Warlock' },
  { id: 68, name: 'Battle Cleric', level: 0, baseDps: 85, baseHp: 8500, maxHp: 0, currentHp: 0, baseCost: 5500, upgradeCostMultiplier: 1.23, rarity: 'Epic', role: 'Healer', skillDescription: 'Smites the enemy, dealing damage and healing the hero with the lowest health.', lore: 'A cleric who believes the best defense is a strong offense, wading into battle to protect allies and punish foes.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Priest' },
  // New Legendary Heroes
  { id: 69, name: 'Archon of Justice', level: 0, baseDps: 650, baseHp: 52000, maxHp: 0, currentHp: 0, baseCost: 42000, upgradeCostMultiplier: 1.31, rarity: 'Legendary', role: 'DPS', skillDescription: 'Summons a pillar of divine fire, dealing massive damage and stunning the enemy.', lore: 'An angelic being of pure law and order, tasked with purging injustice from all realities.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Angel' },
  { id: 70, name: 'Chronos, The Time Weaver', level: 0, baseDps: 550, baseHp: 55000, maxHp: 0, currentHp: 0, baseCost: 38000, upgradeCostMultiplier: 1.30, rarity: 'Legendary', role: 'Controller', skillDescription: 'Freezes the enemy in time. All damage dealt during this period is applied in a single burst at the end.', lore: 'A master of time itself, Chronos has seen countless futures and works to steer reality away from oblivion.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Traveler' },
  { id: 71, name: 'Yamato, the Wandering Blade', level: 0, baseDps: 750, baseHp: 60000, maxHp: 0, currentHp: 0, baseCost: 48000, upgradeCostMultiplier: 1.32, rarity: 'Legendary', role: 'Mangas Hero', skillDescription: 'Unleashes "Dimension Slash," a single strike that ignores a large portion of enemy defenses.', lore: 'A swordsman from another world, whose blade is said to be so sharp it can cut through space and time itself.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Samurai' },
  { id: 72, name: 'Celestial Sentinel', level: 0, baseDps: 300, baseHp: 50000, maxHp: 0, currentHp: 0, baseCost: 20000, upgradeCostMultiplier: 1.28, rarity: 'Legendary', role: 'Support', skillDescription: 'Creates a divine shield for all allies that absorbs damage equal to a percentage of his own max HP.', lore: 'A silent guardian forged from the heart of a collapsed star, his only purpose is to shield the universe from interdimensional threats.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Sentinel' },
  { id: 73, name: 'Phantom Blade', level: 0, baseDps: 700, baseHp: 45000, maxHp: 0, currentHp: 0, baseCost: 45000, upgradeCostMultiplier: 1.31, rarity: 'Legendary', role: 'Assassin', skillDescription: 'Dashes through the enemy multiple times, with each hit dealing bonus damage based on the enemy\'s missing health.', lore: 'A warrior trapped between the planes of existence. He appears only as a blur of steel, his strikes echoing from dimensions unseen.', ascensionLevel: 0, skillLevel: 1, baseClass: 'Blade Dancer' },
];

export const ALL_ARTIFACTS: Artifact[] = [
  { id: 1, name: 'Orb of Power', description: '+10% to all hero DPS.', bonusType: 'dpsPercent', bonusValue: 0.10 },
  { id: 2, name: 'Amulet of Midas', description: '+25% gold from all sources.', bonusType: 'goldDropPercent', bonusValue: 0.25 },
  { id: 3, name: 'Gauntlets of Haste', description: '+50% to all click damage.', bonusType: 'clickDamagePercent', bonusValue: 0.50 },
  { id: 4, name: 'Tome of Focus', description: 'Hero skills charge 10% faster.', bonusType: 'skillChargeRate', bonusValue: 0.10 },
  { id: 5, name: 'Tome of Elem', description: 'Hero skills charge 15% faster.', bonusType: 'skillChargeRate', bonusValue: 0.15 },
];

export const ALL_PETS: Pet[] = [
  { id: 1, name: 'Goldie the Goblin', rarity: 'Common', bonusType: 'goldDropPercent', baseBonus: 0.01, bonusPerLevel: 0.001, description: 'Increases gold dropped from enemies.', lore: 'A greedy but loyal goblin who has a knack for finding loose change.', art: '($.$)\\n/| |\\\\\\n / \\\\ ' },
  { id: 2, name: 'Fury the Fire Sprite', rarity: 'Rare', bonusType: 'dpsPercent', baseBonus: 0.02, bonusPerLevel: 0.002, description: 'Increases total DPS of all heroes.', lore: 'A tiny elemental of pure rage. Its presence invigorates your heroes.', art: '(`A`)\\n<{*}>\\n V V ', evolutionCostEssence: 10 },
  { id: 3, name: 'Clicky the Crab', rarity: 'Epic', bonusType: 'clickDamagePercent', baseBonus: 0.05, bonusPerLevel: 0.005, description: 'Increases damage from your clicks.', lore: 'This crab clicks its claws with such force, it inspires you to do the same.', art: '(\\\\/)\\n(o.o)\\n(><)', evolutionCostEssence: 25 },
];

export const ALL_BLESSINGS: Blessing[] = [
  { type: 'goldRush', name: 'Blessing of Midas', description: 'Doubles all gold earned from enemies for 60 seconds.', durationSeconds: 60, cooldownSeconds: 86400, bonusMultiplier: 2 }, // 24 hours
  { type: 'powerSurge', name: 'Warrior\'s Zeal', description: 'Increases all hero DPS by 50% for 60 seconds.', durationSeconds: 60, cooldownSeconds: 86400, bonusMultiplier: 1.5 },
  { type: 'skillFrenzy', name: 'Arcane Haste', description: 'Instantly recharges all hero skills.', durationSeconds: 0, cooldownSeconds: 86400, bonusMultiplier: 0 }, // Instant effect
];

export const SYNERGY_BONUSES: { [key in Role]?: { count: number, bonus: { type: 'dpsPercent' | 'goldDropPercent' | 'clickDamagePercent', value: number }, description: string }[] } = {
  DPS: [
    { count: 2, bonus: { type: 'dpsPercent', value: 0.10 }, description: '+10% All DPS' },
    { count: 4, bonus: { type: 'dpsPercent', value: 0.25 }, description: '+25% All DPS' }
  ],
  Tank: [
    { count: 2, bonus: { type: 'goldDropPercent', value: 0.15 }, description: '+15% Gold Find' },
  ],
  Support: [
    { count: 2, bonus: { type: 'goldDropPercent', value: 0.10 }, description: '+10% Gold Find' },
  ],
  Assassin: [
    { count: 2, bonus: { type: 'clickDamagePercent', value: 0.20 }, description: '+20% Click Damage' },
  ],
  Mage: [
    { count: 2, bonus: { type: 'dpsPercent', value: 0.05 }, description: '+5% All DPS' },
    { count: 3, bonus: { type: 'dpsPercent', value: 0.15 }, description: '+15% All DPS' },
  ],
};

export const ALL_EXPEDITIONS: Expedition[] = [
  {
    id: 1,
    name: "Patrol the Whispering Woods",
    description: "A quick patrol to clear out any stray goblins and gather some resources.",
    durationSeconds: 3600, // 1 hour
    requirements: { minHeroes: 1, minTotalLevel: 10 },
    rewards: { gold: 5000, equipmentDrop: { chance: 0.25, rarity: 'Common' } }
  },
  {
    id: 2,
    name: "Explore the Sunken Crypt",
    description: "A delve into an ancient crypt. Requires a sturdy warrior to lead the way.",
    durationSeconds: 14400, // 4 hours
    requirements: { minHeroes: 2, minTotalLevel: 50, roles: [{ role: 'Tank', count: 1 }] },
    rewards: { gold: 25000, equipmentDrop: { chance: 0.5, rarity: 'Rare' } }
  },
  {
    id: 3,
    name: "Mine the Glimmering Caves",
    description: "These caves are rumored to hold not just ore, but crystallized prestige.",
    durationSeconds: 28800, // 8 hours
    requirements: { minHeroes: 3, minTotalLevel: 100 },
    rewards: { gold: 60000, prestigePoints: 5, equipmentDrop: { chance: 0.1, rarity: 'Rare' } }
  },
  {
    id: 4,
    name: "Assassinate the Orc Warlord",
    description: "A high-risk, high-reward mission that requires a stealthy approach.",
    durationSeconds: 43200, // 12 hours
    requirements: { minHeroes: 4, minTotalLevel: 200, roles: [{ role: 'Assassin', count: 1 }, { role: 'DPS', count: 2 }] },
    rewards: { gold: 150000, prestigePoints: 15, equipmentDrop: { chance: 0.75, rarity: 'Epic' } }
  }
];

export interface MiningOperation {
  id: number;
  name: string;
  description: string;
  durationSeconds: number;
  goldReward: number;
  stageRequirement: number;
}

export const ALL_MINING_OPERATIONS: MiningOperation[] = [
  { id: 1, name: 'Surface Prospecting', description: 'A quick scan of the surface for loose gold nuggets.', durationSeconds: 900, goldReward: 1500, stageRequirement: 1 }, // 15 mins
  { id: 2, name: 'Crystal Cavern', description: 'Explore a nearby cave known for its gold-rich crystals.', durationSeconds: 3600, goldReward: 7500, stageRequirement: 25 }, // 1 hour
  { id: 3, name: 'Deep Vein Mining', description: 'A serious operation to tap into a rich vein of gold deep underground.', durationSeconds: 14400, goldReward: 40000, stageRequirement: 50 }, // 4 hours
  { id: 4, name: 'Heart of the Mountain', description: 'A long and dangerous expedition to the molten core where legendary treasures are forged.', durationSeconds: 43200, goldReward: 150000, stageRequirement: 100 }, // 12 hours
  { id: 5, name: 'Asteroid Harvesting', description: 'Launch a rocket to a nearby asteroid belt to mine precious metals.', durationSeconds: 86400, goldReward: 350000, stageRequirement: 200 }, // 24 hours
];

export const ALL_DUNGEONS: Dungeon[] = [
    { 
        id: 1, name: 'Goblin Tunnels', description: 'A short raid on a nearby goblin nest. Quick and easy loot.', 
        difficulties: {
            'Normal': { stageRequirement: 10, durationSeconds: 1800, rewards: { gold: 3000, dungeonCrests: 1, equipmentDrop: { chance: 0.5, rarity: 'Common' } } },
            'Hard': { stageRequirement: 50, durationSeconds: 3600, cost: { gold: 1000 }, rewards: { gold: 10000, dungeonCrests: 3, petCrystals: 5, equipmentDrop: { chance: 0.6, rarity: 'Common' } } },
            'Nightmare': { stageRequirement: 100, durationSeconds: 7200, cost: { gold: 5000 }, rewards: { gold: 30000, dungeonCrests: 7, equipmentDrop: { chance: 0.5, rarity: 'Rare' }, petEggDrop: { chance: 0.05 } } }
        }
    },
    { 
        id: 2, name: 'Undead Catacombs', description: 'A spooky delve into a crypt teeming with restless dead.',
        difficulties: {
            'Normal': { stageRequirement: 40, durationSeconds: 7200, cost: { gold: 5000 }, rewards: { gold: 20000, dungeonCrests: 4, equipmentDrop: { chance: 0.75, rarity: 'Rare' } } },
            'Hard': { stageRequirement: 90, durationSeconds: 14400, cost: { gold: 20000 }, rewards: { gold: 80000, dungeonCrests: 10, petCrystals: 15, equipmentDrop: { chance: 0.85, rarity: 'Rare' } } },
            'Nightmare': { stageRequirement: 150, durationSeconds: 28800, cost: { gold: 75000 }, rewards: { gold: 250000, dungeonCrests: 25, equipmentDrop: { chance: 0.75, rarity: 'Epic' }, petEggDrop: { chance: 0.10 } } }
        }
    },
    { 
        id: 3, name: 'Dragon\'s Hoard', description: 'A daring attempt to sneak past a sleeping dragon and pilfer its treasure.',
        difficulties: {
            'Normal': { stageRequirement: 80, durationSeconds: 21600, cost: { gold: 25000 }, rewards: { gold: 120000, dungeonCrests: 15, equipmentDrop: { chance: 0.25, rarity: 'Epic' } } },
            'Hard': { stageRequirement: 140, durationSeconds: 43200, cost: { gold: 100000 }, rewards: { gold: 500000, dungeonCrests: 40, petCrystals: 30, equipmentDrop: { chance: 0.35, rarity: 'Epic' } } },
            'Nightmare': { stageRequirement: 200, durationSeconds: 86400, cost: { gold: 250000 }, rewards: { gold: 1500000, dungeonCrests: 100, equipmentDrop: { chance: 0.25, rarity: 'Legendary' }, petEggDrop: { chance: 0.20 } } }
        }
    },
    { 
        id: 4, name: 'The Void Abyss', description: 'A perilous journey into a realm of madness where reality frays at the edges.',
        difficulties: {
            'Normal': { stageRequirement: 150, durationSeconds: 86400, cost: { gold: 100000 }, rewards: { gold: 500000, dungeonCrests: 50, equipmentDrop: { chance: 0.1, rarity: 'Legendary' } } },
            'Hard': { stageRequirement: 250, durationSeconds: 172800, cost: { gold: 400000 }, rewards: { gold: 2000000, dungeonCrests: 150, petCrystals: 50, equipmentDrop: { chance: 0.15, rarity: 'Legendary' } } },
            'Nightmare': { stageRequirement: 400, durationSeconds: 172800, cost: { gold: 1000000 }, rewards: { gold: 5000000, dungeonCrests: 350, equipmentDrop: { chance: 0.1, rarity: 'Mythic' }, petEggDrop: { chance: 0.30 } } }
        }
    },
];

export const ALL_DUNGEON_BOUNTIES: DungeonBounty[] = [
  { id: 1, name: 'Scout the Depths', description: 'A lone hero scouts ahead for minimal but quick rewards.', durationSeconds: 1800, requiredHeroCount: 1, rewards: { dungeonCrests: 2, gold: 1000, petCrystals: 1 } },
  { id: 2, name: 'Clear the Antechamber', description: 'A small team is needed to clear out the first rooms of a dungeon.', durationSeconds: 7200, requiredHeroCount: 2, rewards: { dungeonCrests: 5, gold: 5000, petCrystals: 5 } },
  { id: 3, name: 'Assassinate the Captain', description: 'A full squad is required for this high-risk, high-reward mission.', durationSeconds: 21600, requiredHeroCount: 4, rewards: { dungeonCrests: 15, gold: 20000, petCrystals: 10, essenceOfLoyalty: { chance: 0.1, amount: 1 } } },
];

export const ALL_DUNGEON_SHOP_ITEMS: DungeonShopItem[] = [
  {
    id: 1, name: 'Minor Gold Coffer', description: 'A small coffer of gold.', cost: 10,
    isSoldOut: () => false,
    purchase: (gameService: GameService) => {
      gameService.addGold(10000);
      return true;
    }
  },
  {
    id: 2, name: 'Rare Equipment Cache', description: 'Guaranteed to contain a Rare item.', cost: 50,
    isSoldOut: () => false,
    purchase: (gameService: GameService) => {
      // Logic to add a rare item to inventory
      const newItem = (gameService as any)._generateDroppedItem(gameService.gameState().stage, 'Rare');
      gameService.inventory.update(inv => [...inv, newItem]);
      return true;
    }
  },
  {
    id: 3, name: 'Tome of Wealth', description: 'Permanently increases all gold gains by 1%. (Max 10)', cost: 100, stock: 10,
    isSoldOut: (gameService: GameService) => (gameService.gameState().purchasedDungeonShopItems[3] || 0) >= 10,
    purchase: (gameService: GameService) => {
      gameService.gameState.update(s => {
        const newPurchased = {...s.purchasedDungeonShopItems};
        newPurchased[3] = (newPurchased[3] || 0) + 1;
        return {
          ...s,
          goldMultiplier: s.goldMultiplier + 0.01,
          purchasedDungeonShopItems: newPurchased
        };
      });
      return true;
    }
  }
];

export const ALL_CODEX_MONSTERS: CodexMonster[] = [
    {
        type: 'Normal',
        name: 'Common Critter',
        description: 'Represents a wide variety of standard foes found throughout the realms, from goblins to slimes. They are the bread and butter of any adventurer\'s journey.',
        asciiArt: '(o.o)\\n--| |-\\n  / \\',
        habitat: 'Almost everywhere.'
    },
    {
        type: 'Armored',
        name: 'Armored Brute',
        description: 'These heavily fortified enemies, like Iron Golems, can shrug off blows that would fell lesser creatures. Their tough exterior reduces incoming damage.',
        asciiArt: '/[o-o]\\\n=[|:::|]=\n  | H |',
        strengths: 'High damage reduction.',
        weaknesses: 'Often slower than other enemies.',
        habitat: 'Fortresses, mountains, and ancient ruins.'
    },
    {
        type: 'Swift',
        name: 'Swift Hunter',
        description: 'Creatures like Dire Wolves that rely on speed over raw power. They have less health and offer fewer rewards but are quickly defeated.',
        asciiArt: ' (> \'>)\n--))((-\n  /\' \'\\',
        strengths: 'Attacks quickly (conceptual). Low health.',
        weaknesses: 'Low gold and item drop rates.',
        habitat: 'Forests, plains, and open fields.'
    },
    {
        type: 'Hoarder',
        name: 'Treasure Hoarder',
        description: 'Often a Goblin with an oversized sack, these enemies are tough to take down but drop a massive amount of gold upon defeat.',
        asciiArt: '  ($-$)\n /|$$$|\\\n [\\_$_/]',
        strengths: 'Very high health.',
        weaknesses: 'Minimal damage output.',
        habitat: 'Dungeons, caves, and anywhere treasure might be found.'
    },
    {
        type: 'Boss',
        name: 'Stage Guardian',
        description: 'Powerful sentinels that appear every 10 stages. Defeating them is a true test of your team\'s strength and is required to progress.',
        asciiArt: '   (ಠ益ಠ)\n--[[+]]--\n /| | |\\\n  L   J',
        strengths: 'Extremely high health and gold rewards.',
        weaknesses: 'None.',
        habitat: 'End of major stage milestones.'
    },
    {
        type: 'Caster',
        name: 'Magical Anomaly',
        description: 'Creatures that wield arcane energies. While physically frail, their magical attacks can be unpredictable. They often drop magical reagents.',
        asciiArt: '   *.*\n ~(-,-)~\n --)|(--\n   /\"\\',
        strengths: 'Can apply debuffs (conceptual).',
        weaknesses: 'Low health.',
        habitat: 'Magic-infused forests, ancient libraries, and ley-line convergences.'
    },
    {
        type: 'Squad',
        name: 'Enemy Squad',
        description: 'A group of weaker enemies fighting together. Their combined strength makes them tougher and more rewarding than a single foe.',
        asciiArt: '(o.o) (o.o)\\n-| |---| |-\\n / \\   / \\',
        strengths: 'Higher health and rewards than a normal enemy.',
        weaknesses: 'Still just a bunch of minions.',
        habitat: 'Camps, outposts, and patrol routes.'
    },
    {
        type: 'Minerals',
        name: 'Rock Golem',
        description: 'Living creatures made of stone and crystal. They are sturdy and often drop valuable ores and stones when defeated.',
        asciiArt: '  (¤-¤)\\n /[ # ]\\\n/[_#_]\\',
        strengths: 'Slightly higher health.',
        weaknesses: 'None.',
        habitat: 'Caves, mines, and mountainous regions.'
    },
    {
        type: 'Flora',
        name: 'Vicious Mandrake',
        description: 'Aggressive plant life that has been corrupted or has evolved to defend its territory. Often a source of rare herbs.',
        asciiArt: '   \\|/\n  (o,o)\n --)|(--\n   /|\\',
        strengths: 'Can have regenerative properties (conceptual).',
        weaknesses: 'Vulnerable to fire skills (conceptual).',
        habitat: 'Lush forests, overgrown ruins, and swamps.'
    },
    {
        type: 'Fauna',
        name: 'Grizzly Bear',
        description: 'The natural wildlife of the world, from common bears to fierce dire wolves. A primary source for leathers and hides.',
        asciiArt: ' /\\_/\\\n( o.o )\n > ^ <',
        strengths: 'Balanced stats.',
        weaknesses: 'None.',
        habitat: 'Wilderness, forests, and plains.'
    },
    {
        type: 'Aquatic',
        name: 'Water Elemental',
        description: 'Creatures of the seas, rivers, and lakes. Can be elusive and are a source of rare fish and reagents.',
        asciiArt: '  ( o )\n-(~o~)-\n<><><>',
        strengths: 'Resistant to certain types of magic (conceptual).',
        weaknesses: 'Vulnerable to lightning (conceptual).',
        habitat: 'Shorelines, underwater caves, and elemental planes.'
    }
];

const DAILY_REWARDS: {gold: number, prestigePoints: number}[] = [
    {gold: 1000, prestigePoints: 0},
    {gold: 2500, prestigePoints: 0},
    {gold: 5000, prestigePoints: 1},
    {gold: 10000, prestigePoints: 2},
    {gold: 15000, prestigePoints: 3},
    {gold: 25000, prestigePoints: 4},
    {gold: 50000, prestigePoints: 10},
];

const INITIAL_HEROES = ALL_HEROES.slice(0, 5);

const INITIAL_QUESTS: Omit<Quest, 'isCompleted' | 'isClaimed'>[] = [
  // Main Story
  { id: 1, description: 'Reach Stage 10', type: 'reachStage', target: 10, category: 'Main Story', reward: { gold: 100 } },
  { id: 2, description: 'Reach Stage 25', type: 'reachStage', target: 25, category: 'Main Story', reward: { gold: 500 } },
  { id: 3, description: 'Level up a hero to level 10', type: 'levelUpHero', target: 10, category: 'Main Story', reward: { gold: 200 } },
  { id: 4, description: 'Reach Stage 50', type: 'reachStage', target: 50, category: 'Main Story', reward: { gold: 2500, prestigePoints: 1 } },
  { id: 5, description: 'Reach Stage 75', type: 'reachStage', target: 75, category: 'Main Story', reward: { gold: 5000 } },
  { id: 6, description: 'Reach Stage 100', type: 'reachStage', target: 100, category: 'Main Story', reward: { gold: 10000, prestigePoints: 2 } },
  { id: 11, description: 'Reach Stage 250', type: 'reachStage', target: 250, category: 'Main Story', reward: { gold: 100000, prestigePoints: 10 } },
  { id: 12, description: 'Reach Stage 300', type: 'reachStage', target: 300, category: 'Main Story', reward: { gold: 250000, prestigePoints: 15 } },
  { id: 13, description: 'Reach Stage 400', type: 'reachStage', target: 400, category: 'Main Story', reward: { gold: 500000, prestigePoints: 20 } },
  { id: 14, description: 'Reach Stage 500', type: 'reachStage', target: 500, category: 'Main Story', reward: { gold: 1000000, prestigePoints: 50 } },
  { id: 15, description: 'Level up a hero to level 25', type: 'levelUpHero', target: 25, category: 'Main Story', reward: { gold: 7500 } },
  { id: 16, description: 'Level up a hero to level 50', type: 'levelUpHero', target: 50, category: 'Main Story', reward: { gold: 25000 } },
  { id: 17, description: 'Level up a hero to level 100', type: 'levelUpHero', target: 100, category: 'Main Story', reward: { gold: 100000, prestigePoints: 5 } },
  { id: 18, description: 'Level up 3 heroes to level 20', type: 'levelUpMultipleHeroes', target: { level: 20, count: 3 }, category: 'Main Story', reward: { gold: 15000 } },
  { id: 19, description: 'Unlock 10 heroes', type: 'unlockHeroCount', target: 10, category: 'Main Story', reward: { gold: 5000 } },
  { id: 20, description: 'Unlock 20 heroes', type: 'unlockHeroCount', target: 20, category: 'Main Story', reward: { gold: 20000 } },
  { id: 21, description: 'Prestige for the first time', type: 'prestigeCount', target: 1, category: 'Main Story', reward: { gold: 50000 } },
  { id: 22, description: 'Forge a Rare item', type: 'forgeRarity', target: 'Rare', category: 'Main Story', reward: { gold: 1000 } },
  { id: 23, description: 'Clear Tower Floor 5', type: 'clearTowerFloor', target: 5, category: 'Main Story', reward: { gold: 2000 } },
  { id: 24, description: 'Clear Tower Floor 10', type: 'clearTowerFloor', target: 10, category: 'Main Story', reward: { gold: 10000, prestigePoints: 1 } },
  { id: 25, description: 'Clear Tower Floor 20', type: 'clearTowerFloor', target: 20, category: 'Main Story', reward: { gold: 50000, prestigePoints: 5 } },
  { id: 26, description: 'Complete an Expedition', type: 'completeExpeditions', target: 1, category: 'Main Story', reward: { gold: 2500 } },
  { id: 27, description: 'Complete a Dungeon run', type: 'completeDungeons', target: 1, category: 'Main Story', reward: { gold: 2500 } },
  { id: 28, description: 'Field a team of 10 heroes', type: 'fieldHeroes', target: 10, category: 'Main Story', reward: { gold: 10000 } },
  { id: 29, description: 'Field a team of 20 heroes', type: 'fieldHeroes', target: 20, category: 'Main Story', reward: { gold: 50000 } },
  { id: 30, description: 'Earn a total of 1 Million Gold', type: 'earnGold', target: 1000000, category: 'Main Story', reward: { gold: 0, prestigePoints: 5 } },
  { id: 32, description: 'Perform 1,000 clicks', type: 'clickCount', target: 1000, category: 'Main Story', reward: { gold: 1000 } },
  { id: 33, description: 'Perform 10,000 clicks', type: 'clickCount', target: 10000, category: 'Main Story', reward: { gold: 10000 } },
  { id: 34, description: 'Prestige 3 times', type: 'prestigeCount', target: 3, category: 'Main Story', reward: { gold: 0, prestigePoints: 10 } },

  // Daily
  { id: 101, description: 'Defeat 50 enemies', type: 'defeatEnemies', target: 50, category: 'Daily', reward: { gold: 500 } },
  { id: 102, description: 'Defeat 250 enemies', type: 'defeatEnemies', target: 250, category: 'Daily', reward: { gold: 2500 } },
  { id: 103, description: 'Use hero skills 20 times', type: 'useSkills', target: 20, category: 'Daily', reward: { gold: 1000 } },
  { id: 104, description: 'Click 1,000 times', type: 'clickCount', target: 1000, category: 'Daily', reward: { gold: 1000 } },
  { id: 105, description: 'Earn 100k Gold', type: 'earnGold', target: 100000, category: 'Daily', reward: { gold: 5000 } },
  { id: 106, description: 'Claim a sponsor offer', type: 'claimSponsorGold', target: 1, category: 'Daily', reward: { gold: 5000 } },
  { id: 107, description: 'Complete an expedition', type: 'completeExpeditions', target: 1, category: 'Daily', reward: { gold: 2000 } },
  { id: 108, description: 'Complete a dungeon run', type: 'completeDungeons', target: 1, category: 'Daily', reward: { gold: 2000 } },
  { id: 109, description: 'Clear a Tower floor', type: 'clearTowerFloor', target: 1, category: 'Daily', reward: { gold: 1000 } },
  { id: 110, description: 'Forge an item', type: 'forgeAnyItem', target: 1, category: 'Daily', reward: { gold: 1000 } },
  { id: 111, description: 'Use hero skills 50 times', type: 'useSkills', target: 50, category: 'Daily', reward: { gold: 3000 } },

  // Weekly
  { id: 201, description: 'Summon 3 heroes', type: 'summonHero', target: 3, category: 'Weekly', reward: { gold: 1000 } },

  // Achievements
  { id: 301, description: 'Forge an Epic item', type: 'forgeRarity', target: 'Epic', category: 'Achievements', reward: { gold: 0, prestigePoints: 5 } },
  { id: 302, description: 'Forge a Legendary item', type: 'forgeRarity', target: 'Legendary', category: 'Achievements', reward: { gold: 0, prestigePoints: 20 } },
  { id: 303, description: 'Reach Stage 1000', type: 'reachStage', target: 1000, category: 'Achievements', reward: { gold: 0, prestigePoints: 100 } },
  { id: 304, description: 'Prestige 10 times', type: 'prestigeCount', target: 10, category: 'Achievements', reward: { gold: 0, prestigePoints: 50 } },
  { id: 305, description: 'Unlock a Legendary Hero', type: 'unlockHeroRarity', target: 'Legendary', category: 'Achievements', reward: { gold: 0, prestigePoints: 25 } },
  { id: 306, description: 'Unlock a Mythic Hero', type: 'unlockHeroRarity', target: 'Mythic', category: 'Achievements', reward: { gold: 0, prestigePoints: 100 } },
  { id: 307, description: 'Complete 10 Dungeons', type: 'completeDungeons', target: 10, category: 'Achievements', reward: { gold: 0, prestigePoints: 10 } },
  { id: 308, description: 'Complete 10 Expeditions', type: 'completeExpeditions', target: 10, category: 'Achievements', reward: { gold: 0, prestigePoints: 10 } },
  { id: 309, description: 'Forge a Mythic item', type: 'forgeRarity', target: 'Mythic', category: 'Achievements', reward: { gold: 0, prestigePoints: 100 } },
  { id: 310, description: 'Unlock 50 heroes', type: 'unlockHeroCount', target: 50, category: 'Achievements', reward: { gold: 0, prestigePoints: 50 } },
  { id: 311, description: 'Reach 1 Million total clicks', type: 'clickCount', target: 1000000, category: 'Achievements', reward: { gold: 0, prestigePoints: 20 } },
  { id: 312, description: 'Earn 1 Trillion total gold', type: 'earnGold', target: 1e12, category: 'Achievements', reward: { gold: 0, prestigePoints: 50 } },
];

const INITIAL_EQUIPMENT: EquipmentItem[] = [
  { id: 101, name: 'Rusty Sword', slot: 'Weapon', bonusType: 'dpsFlat', bonusValue: 2, baseBonusValue: 2, enchantLevel: 0, rarity: 'Common', lore: 'Seen better days, but still pointy.' },
  { id: 102, name: 'Apprentice Wand', slot: 'Weapon', bonusType: 'dpsPercent', bonusValue: 0.05, baseBonusValue: 0.05, enchantLevel: 0, rarity: 'Rare', lore: 'Crackles with barely contained magical energy. Smells faintly of ozone.' },
  { id: 201, name: 'Leather Tunic', slot: 'Armor', bonusType: 'dpsFlat', bonusValue: 1, baseBonusValue: 1, enchantLevel: 0, rarity: 'Common', lore: 'Smells of adventure and... is that goblin sweat?' },
  { id: 301, name: 'Amulet of Greed', slot: 'Accessory', bonusType: 'goldDropPercent', bonusValue: 0.1, baseBonusValue: 0.1, enchantLevel: 0, rarity: 'Epic', lore: 'Whispers promises of wealth to its wearer. It\'s best not to listen too closely.' },
  { id: 103, name: 'Old Dagger', slot: 'Weapon', bonusType: 'dpsFlat', bonusValue: 1, baseBonusValue: 1, enchantLevel: 0, rarity: 'Common', lore: 'Perfect for cutting ropes, apples, or the purse strings of unwary travelers.' },
  { id: 104, name: 'Cracked Staff', slot: 'Weapon', bonusType: 'dpsFlat', bonusValue: 1, baseBonusValue: 1, enchantLevel: 0, rarity: 'Common', lore: 'Held together with duct tape and sheer willpower.' },
  { id: 105, name: "Regalia Sword", slot: 'Weapon', bonusType: 'dpsFlat', bonusValue: 10, baseBonusValue: 10, enchantLevel: 0, rarity: 'Rare', lore: 'A blade carried by ancient warriors.', set: 'warriors_regalia' },
  { id: 202, name: "Regalia Helm", slot: 'Armor', bonusType: 'dpsFlat', bonusValue: 5, baseBonusValue: 5, enchantLevel: 0, rarity: 'Rare', lore: 'A helm that has seen countless battles.', set: 'warriors_regalia' },
];

const ENEMY_NAMES = ['Goblin', 'Slime', 'Orc', 'Dire Wolf', 'Stone Golem', 'Dragon Whelp'];
const TOWER_ENEMY_NAMES = ['Guardian', 'Sentinel', 'Warden', 'Executioner', 'Arbiter', 'Colossus'];
const PRESTIGE_STAGE_REQUIREMENT = 50;
const RARITY_ORDER: Rarity[] = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];
const DUPLICATE_HERO_GOLD_REWARD = 500;
const SKILL_CHARGE_RATE = 2; // points per second
const XP_PER_DPS_PER_SECOND = 0.05;
const SAVE_KEY = 'idleHeroesUniverseSave';

export const ALL_ANOMALIES: Anomaly[] = [
  { id: 'regenerating', name: 'Regenerating', description: 'Enemy recovers a portion of its health over time.', icon: '❤️‍🩹' },
  { id: 'hardened', name: 'Hardened', description: 'Enemy has increased damage reduction.', icon: '🛡️' },
  { id: 'dampening', name: 'Dampening', description: 'Reduces the effectiveness of hero skills.', icon: '🤫' },
];

export class GameService {
  public static readonly STANDARD_SUMMON_COST_GOLD = 1000;
  public static readonly PREMIUM_SUMMON_COST_PRESTIGE = 10;
  private chronicleService = new ChronicleService();

  gameState: WritableSignal<GameState> = signal({
    stage: 1,
    gold: 0,
    clickDamage: 1,
    prestigePoints: 0,
    goldMultiplier: 1,
    activeHeroIds: [1, ...Array(19).fill(null)],
    teamPresets: [
      { name: 'Preset A', heroIds: Array(20).fill(null) },
      { name: 'Preset B', heroIds: Array(20).fill(null) },
      { name: 'Preset C', heroIds: Array(20).fill(null) },
    ],
    totalEnemiesDefeated: 0,
    totalHeroesSummoned: 0,
    highestRarityForged: null,
    lastUpdateTimestamp: Date.now(),
    towerFloor: 1,
    towerState: { currentChoices: [] },
    lastLoginDate: null,
    consecutiveLoginDays: 0,
    artifacts: [],
    unlockedHeroIds: [],
    viewedHeroIdsInCodex: [],
    viewedPetIdsInCodex: [],
    discoveredMaterials: [],
    viewedMaterialsInCodex: [],
    discoveredMonsterTypes: [],
    viewedMonsterTypesInCodex: [],
    totalClicks: 0,
    totalGoldEarned: 0,
    totalPrestiges: 0,
    totalSkillsUsed: 0,
    totalDungeonsCompleted: 0,
    totalExpeditionsCompleted: 0,
    totalSponsorClaims: 0,
    totalItemsForged: 0,
    totalGoldDonated: 0,
    autoDpsEnabled: true,
    autoSkillEnabled: false,
    ongoingExpeditions: [],
    activeDungeonRuns: [],
    activeBlessings: [],
    blessingCooldowns: [],
    lastTributeClaimTimestamp: null,
    lastGoldRushTimestamp: null,
    vaultInvestment: null,
    lastSponsorOfferTimestamp: null,
    activeMiningOperation: null,
    enchantingDust: 0,
    lastFreeStandardSummonTimestamp: null,
    heroShards: {},
    standardPityCount: 0,
    premiumPityCount: 0,
    heroSkillLevels: {},
    dungeonCrests: 0,
    activeDungeonBounties: [],
    purchasedDungeonShopItems: {},
    pets: [],
    petCrystals: 0,
    essenceOfLoyalty: 0,
    heroMemories: {},
    skillTomes: 0,
    unlockedSkillTreeNodes: [],
    heroEssence: 0,
    heroFarm: {
      assignedHeroIds: [null, null, null, null],
      lastCollectionTimestamp: Date.now(),
      accumulatedEssence: 0,
      accumulatedEssenceOfLoyalty: 0,
    },
    materials: {},
    heroSpecializations: {},
    unlockedHybridSouls: [],
    missionProgress: {},
    necroConstructs: {},
    riftLevel: 1,
    highestRiftLevel: 1,
    riftShards: 0,
    guild: null,
  });

  heroes: WritableSignal<Hero[]> = signal([]);
  quests: WritableSignal<Quest[]> = signal([]);
  inventory: WritableSignal<EquipmentItem[]> = signal([]);
  
  artifacts = computed(() => ALL_ARTIFACTS.filter(a => this.gameState().artifacts.includes(a.id)));

  currentEnemy: WritableSignal<Enemy> = signal(this.createEnemy(1));
  currentRiftEnemy: WritableSignal<RiftEnemy | null> = signal(null);
  isInRiftCombat = signal<boolean>(false);
  towerEnemy = signal<Enemy | null>(null);
  isInTowerCombat = signal<boolean>(false);
  
  offlineReport = signal<{gold: number, xp: number, seconds: number} | null>(null);
  isDailyRewardAvailable = signal<boolean>(false);
  
  lastItemDrop = signal<EquipmentItem | null>(null);
  lastMaterialDrop = signal<{ name: string; rarity: Rarity; quantity: number }[] | null>(null);

  heroToViewInTeam = signal<number | null | undefined>(undefined);
  itemToViewInEnchant = signal<number | null | undefined>(undefined);
  heroHealthUpdate = signal<{ heroId: number, type: 'damage' | 'heal' } | null>(null);

  private artifactBonuses = computed(() => {
    const bonuses = { dpsPercent: 0, goldDropPercent: 0, clickDamagePercent: 0, skillChargeRate: 0 };
    this.artifacts().forEach(artifact => {
        if (artifact.bonusType in bonuses) {
            (bonuses as any)[artifact.bonusType] += artifact.bonusValue;
        }
    });
    return bonuses;
  });
  
  private skillTreeBonuses = computed(() => {
    const unlockedIds = new Set(this.gameState().unlockedSkillTreeNodes);
    const bonuses: Record<SkillTreeNodeEffect['type'], number> = {
      dpsPercent: 0,
      goldDropPercent: 0,
      clickDamagePercent: 0,
      skillChargeRate: 0,
      offlineGoldPercent: 0,
      offlineDpsPercent: 0,
      upgradeCostReduction: 0,
      skillDamagePercent: 0,
      expeditionSlots: 0,
      dungeonSlots: 0,
      skillTomesPerPrestige: 0,
    };

    SKILL_TREE_DATA.forEach(node => {
      if (unlockedIds.has(node.id)) {
        node.effects.forEach(effect => {
          bonuses[effect.type] = (bonuses[effect.type] || 0) + effect.value;
        });
      }
    });

    return bonuses;
  });

  private necroConstructBonuses = computed(() => {
    const bonuses = { dpsPercentTank: 0, goldDropPercent: 0, skillChargeRate: 0 };
    const owned = this.gameState().necroConstructs;
    for (const constructId in owned) {
        const construct = ALL_NECRO_CONSTRUCTS.find(c => c.id === constructId);
        if (construct) {
            const count = owned[constructId];
            (bonuses as any)[construct.bonusType] += construct.bonusValue * count;
        }
    }
    return bonuses;
  });

  private guildBonuses = computed(() => {
    const guild = this.gameState().guild;
    if (!guild) {
        return { dpsPercent: 0, goldDropPercent: 0 };
    }
    // FIX: Property 'getGuildBonuses' does not exist on type 'GameService'. Did you mean 'guildBonuses'?
    return this.getGuildBonuses(guild.level);
  });

  activeHeroes = computed(() => {
    const activeIds = this.gameState().activeHeroIds;
    return this.heroes().filter(h => h.level > 0 && activeIds.includes(h.id));
  });
  
  activeSynergies = computed(() => {
      const activeHeroes = this.activeHeroes();
      const roleCounts: { [key in Role]?: number } = {};
      for (const hero of activeHeroes) {
          roleCounts[hero.role] = (roleCounts[hero.role] || 0) + 1;
      }

      const activeBonuses: { role: Role, description: string }[] = [];
      for (const role in roleCounts) {
          const synergiesForRole = SYNERGY_BONUSES[role as Role];
          if (synergiesForRole) {
              const count = roleCounts[role as Role]!;
              const bestBonus = synergiesForRole
                  .filter(s => count >= s.count)
                  .sort((a, b) => b.count - a.count)[0];
              
              if (bestBonus) {
                  activeBonuses.push({ role: role as Role, description: bestBonus.description });
              }
          }
      }
      return activeBonuses;
  });

  private synergyBonuses = computed(() => {
      const bonuses = { dpsPercent: 0, goldDropPercent: 0, clickDamagePercent: 0 };
      const activeHeroes = this.activeHeroes();
      const roleCounts: { [key in Role]?: number } = {};
      for (const hero of activeHeroes) {
          roleCounts[hero.role] = (roleCounts[hero.role] || 0) + 1;
      }

      for (const role in roleCounts) {
          const synergiesForRole = SYNERGY_BONUSES[role as Role];
          if (synergiesForRole) {
              const count = roleCounts[role as Role]!;
              const bestBonus = synergiesForRole
                  .filter(s => count >= s.count)
                  .sort((a, b) => b.count - a.count)[0];
              
              if (bestBonus) {
                  (bonuses as any)[bestBonus.bonus.type] += bestBonus.bonus.value;
              }
          }
      }
      return bonuses;
  });

  totalDps = computed(() => {
    const baseDps = this.activeHeroes().reduce((sum, hero) => sum + hero.currentDps, 0);
    let finalDps = baseDps * (1 + this.artifactBonuses().dpsPercent + this.synergyBonuses().dpsPercent + this.skillTreeBonuses().dpsPercent + this.guildBonuses().dpsPercent);

    const powerSurge = this.gameState().activeBlessings.find(b => b.type === 'powerSurge');
    if(powerSurge) {
        const blessingInfo = ALL_BLESSINGS.find(b => b.type === 'powerSurge')!;
        finalDps *= blessingInfo.bonusMultiplier;
    }

    return finalDps;
  });
  private totalClickDamageBonus = computed(() => this.getGlobalBonus('clickDamageFlat'));
  private totalGoldDropBonus = computed(() => this.getGlobalBonus('goldDropPercent'));

  damageFlashes: WritableSignal<{ id: number, type: 'click' | 'dps' | 'skill', damage: number, x: number }[]> = signal([]);

  towerChoices = computed(() => this.gameState().towerState.currentChoices);

  stageCleared = signal<boolean>(false);
  recentlyLeveledHeroId = signal<number | null>(null);
  enemyIsShaking = signal<boolean>(false);
  enemyHit = signal<boolean>(false);
  heroAttackPulse = signal<boolean>(false);
  lastSkillUsed = signal<{ heroId: number, damage: number, rarity: Rarity } | null>(null);

  hasClaimableQuests = computed(() => this.quests().some(q => q.isCompleted && !q.isClaimed));

  constructor() {
    const loaded = this.loadGame();
    if (!loaded) {
      this.initializeInventory();
      this.initializeGame();
      this.initializeQuests();
    }
    this.checkDailyLogin();
    setInterval(() => this.saveGame(), 5000);
  }

  saveGame() {
    this.gameState.update(s => ({ ...s, lastUpdateTimestamp: Date.now() }));
    const saveData = {
      gameState: this.gameState(),
      heroes: this.heroes(),
      inventory: this.inventory(),
      quests: this.quests(),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  }

  loadGame(): boolean {
    const saveData = localStorage.getItem(SAVE_KEY);
    if (!saveData) return false;

    try {
      const parsedData = JSON.parse(saveData);
      let savedGameState = parsedData.gameState;

      // --- MIGRATION LOGIC FOR SKILL TREE ---
      if ((savedGameState as any).prestigePowerLevel !== undefined) {
        let refundedPoints = 0;
        const calculateCost = (baseCost: number, pow: number, level: number): number => {
          let total = 0;
          for (let i = 0; i < level; i++) {
            total += Math.floor(baseCost * Math.pow(pow, i));
          }
          return total;
        };
        refundedPoints += calculateCost(2, 1.5, (savedGameState as any).prestigePowerLevel);
        refundedPoints += calculateCost(1, 1.8, (savedGameState as any).clickingFrenzyLevel);
        refundedPoints += calculateCost(1, 1.4, (savedGameState as any).startingGoldLevel);
        refundedPoints += calculateCost(5, 2.5, (savedGameState as any).expeditionSlotsLevel);
        refundedPoints += calculateCost(10, 3, (savedGameState as any).dungeonSlotsLevel);
        refundedPoints += calculateCost(10, 2, (savedGameState as any).skillTomeFinderLevel);

        savedGameState.prestigePoints = (savedGameState.prestigePoints || 0) + refundedPoints;
        
        delete (savedGameState as any).prestigePowerLevel;
        delete (savedGameState as any).clickingFrenzyLevel;
        delete (savedGameState as any).startingGoldLevel;
        delete (savedGameState as any).expeditionSlotsLevel;
        delete (savedGameState as any).dungeonSlotsLevel;
        delete (savedGameState as any).skillTomeFinderLevel;
      }

      savedGameState = this._addMissingGameStateFields(savedGameState);
      this.gameState.set(savedGameState);

      const lastTime = savedGameState.lastUpdateTimestamp || Date.now();
      const offlineSeconds = Math.min(86400, (Date.now() - lastTime) / 1000);

      if (offlineSeconds > 30) {
          const savedHeroesWithStats = parsedData.heroes.map((h: Hero) => this.calculateHeroStats(h));
          const activeHeroIds = new Set(savedGameState.activeHeroIds);
          const offlineDpsBonus = 1 + this.skillTreeBonuses().offlineDpsPercent;
          const offlineDps = savedHeroesWithStats
            .filter((h: Hero) => activeHeroIds.has(h.id))
            .reduce((sum: number, hero: Hero) => sum + hero.currentDps, 0) * offlineDpsBonus;
          
          const totalXpGained = offlineDps * offlineSeconds * XP_PER_DPS_PER_SECOND;
          const stageGoldPerSecond = (this.createEnemy(savedGameState.stage).goldReward * 0.5);
          const offlineGoldBonus = 1 + this.skillTreeBonuses().offlineGoldPercent;
          const totalGoldGained = stageGoldPerSecond * offlineSeconds * 0.25 * offlineGoldBonus;
          
          this.offlineReport.set({gold: totalGoldGained, xp: totalXpGained, seconds: offlineSeconds});
          
          savedGameState.gold += totalGoldGained;
          savedGameState.totalGoldEarned = (savedGameState.totalGoldEarned || 0) + totalGoldGained;

          if (savedGameState.heroFarm) {
            const farmStateForOffline = savedGameState.heroFarm;
            const assignedHeroesForOffline = parsedData.heroes.filter((h: Hero) => farmStateForOffline.assignedHeroIds.includes(h.id));
            if (assignedHeroesForOffline.length > 0) {
                const totalLevelForOffline = assignedHeroesForOffline.reduce((sum: number, hero: Hero) => sum + hero.level, 0);
                
                const offlineEssenceRatePerHour = totalLevelForOffline * 0.5; // 0.5 per level per hour
                const offlineEssenceGained = (offlineEssenceRatePerHour / 3600) * offlineSeconds;
                savedGameState.heroFarm.accumulatedEssence = (savedGameState.heroFarm.accumulatedEssence || 0) + offlineEssenceGained;

                const offlineLoyaltyRatePerHour = totalLevelForOffline * 0.1; // 0.1 per level per hour
                const offlineLoyaltyGained = (offlineLoyaltyRatePerHour / 3600) * offlineSeconds;
                savedGameState.heroFarm.accumulatedEssenceOfLoyalty = (savedGameState.heroFarm.accumulatedEssenceOfLoyalty || 0) + offlineLoyaltyGained;
            }
          }

          const activeHeroesCount = savedGameState.activeHeroIds.filter((id: number | null) => id !== null).length;
          if (activeHeroesCount > 0) {
              const xpPerHero = totalXpGained / activeHeroesCount;
              parsedData.heroes.forEach((h: Hero) => {
                  if (activeHeroIds.has(h.id)) h.offlineXp = (h.offlineXp || 0) + xpPerHero;
                  else h.offlineXp = 0;
              });
          }
      }

      this.gameState.set(savedGameState);
      const finalHeroes = parsedData.heroes.map((h: Hero) => {
        const heroWithStats = {
          ...h,
          stats: h.stats || { totalDamageDealt: 0, skillsUsed: 0 }
        };
        return this.calculateHeroStats(heroWithStats);
      });
      this.heroes.set(finalHeroes);
      this.inventory.set((parsedData.inventory || []) as EquipmentItem[]);
      this.quests.set((parsedData.quests || []) as Quest[]);

      this.currentEnemy.set(this.createEnemy(this.gameState().stage));
      this.checkQuestCompletion();
      return true;
    } catch (e) {
      console.error("Failed to load save data:", e);
      localStorage.removeItem(SAVE_KEY);
      return false;
    }
  }

  private _addMissingGameStateFields(state: any): GameState {
    const defaultPresets: TeamPreset[] = [
      { name: 'Preset A', heroIds: Array(20).fill(null) },
      { name: 'Preset B', heroIds: Array(20).fill(null) },
      { name: 'Preset C', heroIds: Array(20).fill(null) },
    ];
    let activeHeroIds = state.activeHeroIds ?? [1, ...Array(19).fill(null)];
    if (activeHeroIds.length < 20) {
      activeHeroIds = [...activeHeroIds, ...Array(20 - activeHeroIds.length).fill(null)];
    }
    return {
        ...state,
        activeHeroIds,
        teamPresets: state.teamPresets ?? defaultPresets,
        towerFloor: state.towerFloor ?? 1,
        towerState: state.towerState ?? { currentChoices: [] },
        lastLoginDate: state.lastLoginDate ?? null,
        consecutiveLoginDays: state.consecutiveLoginDays ?? 0,
        artifacts: state.artifacts ?? [],
        unlockedHeroIds: state.unlockedHeroIds ?? [],
        viewedHeroIdsInCodex: state.viewedHeroIdsInCodex ?? [],
        viewedPetIdsInCodex: state.viewedPetIdsInCodex ?? [],
        discoveredMaterials: state.discoveredMaterials ?? [],
        viewedMaterialsInCodex: state.viewedMaterialsInCodex ?? [],
        discoveredMonsterTypes: state.discoveredMonsterTypes ?? [],
        viewedMonsterTypesInCodex: state.viewedMonsterTypesInCodex ?? [],
        totalClicks: state.totalClicks ?? 0,
        totalGoldEarned: state.totalGoldEarned ?? 0,
        totalPrestiges: state.totalPrestiges ?? 0,
        totalSkillsUsed: state.totalSkillsUsed ?? 0,
        totalDungeonsCompleted: state.totalDungeonsCompleted ?? 0,
        totalExpeditionsCompleted: state.totalExpeditionsCompleted ?? 0,
        totalSponsorClaims: state.totalSponsorClaims ?? 0,
        totalItemsForged: state.totalItemsForged ?? 0,
        totalGoldDonated: state.totalGoldDonated ?? 0,
        autoDpsEnabled: state.autoDpsEnabled ?? true,
        autoSkillEnabled: state.autoSkillEnabled ?? false,
        ongoingExpeditions: state.ongoingExpeditions ?? [],
        activeDungeonRuns: state.activeDungeonRuns ?? [],
        activeBlessings: state.activeBlessings ?? [],
        blessingCooldowns: state.blessingCooldowns ?? [],
        lastTributeClaimTimestamp: state.lastTributeClaimTimestamp ?? null,
        lastGoldRushTimestamp: state.lastGoldRushTimestamp ?? null,
        vaultInvestment: state.vaultInvestment ?? null,
        lastSponsorOfferTimestamp: state.lastSponsorOfferTimestamp ?? null,
        activeMiningOperation: state.activeMiningOperation ?? null,
        enchantingDust: state.enchantingDust ?? (state.arcaneDust ?? 0),
        lastFreeStandardSummonTimestamp: state.lastFreeStandardSummonTimestamp ?? null,
        heroShards: state.heroShards ?? {},
        standardPityCount: state.standardPityCount ?? 0,
        premiumPityCount: state.premiumPityCount ?? 0,
        heroSkillLevels: state.heroSkillLevels ?? {},
        dungeonCrests: state.dungeonCrests ?? 0,
        activeDungeonBounties: state.activeDungeonBounties ?? [],
        purchasedDungeonShopItems: state.purchasedDungeonShopItems ?? {},
        pets: state.pets ?? [],
        petCrystals: state.petCrystals ?? 0,
        essenceOfLoyalty: state.essenceOfLoyalty ?? 0,
        heroMemories: state.heroMemories ?? {},
        skillTomes: state.skillTomes ?? 0,
        unlockedSkillTreeNodes: state.unlockedSkillTreeNodes ?? [],
        heroEssence: state.heroEssence ?? 0,
        heroFarm: state.heroFarm ?? { assignedHeroIds: [null, null, null, null], lastCollectionTimestamp: Date.now(), accumulatedEssence: 0, accumulatedEssenceOfLoyalty: 0 },
        materials: state.materials ?? {},
        heroSpecializations: state.heroSpecializations ?? {},
        unlockedHybridSouls: state.unlockedHybridSouls ?? [],
        missionProgress: state.missionProgress ?? {},
        necroConstructs: state.necroConstructs ?? {},
        riftLevel: state.riftLevel ?? 1,
        highestRiftLevel: state.highestRiftLevel ?? 1,
        riftShards: state.riftShards ?? 0,
        guild: state.guild ?? null,
    };
  }
  
  private initializeInventory() {
    this.inventory.set(INITIAL_EQUIPMENT);
  }

  private initializeGame(isPrestige = false) {
    const skillLevels = this.gameState().heroSkillLevels;
    const heroesWithStats = INITIAL_HEROES.map(h => {
        const hero: Omit<Hero, 'currentDps' | 'nextLevelCost'> = {
            ...h,
            level: (isPrestige && h.id === 1) ? 1 : (h.level || 0),
            equipment: { Weapon: null, Armor: null, Accessory: null },
            skillCharge: 0,
            skillReady: false,
            isFavorite: false,
            currentXp: 0,
            xpToNextLevel: 100,
            offlineXp: 0,
            stats: { totalDamageDealt: 0, skillsUsed: 0 },
            ascensionLevel: 0,
            skillLevel: skillLevels[h.id] || 1,
        };
        const finalHero = this.calculateHeroStats(hero);
        if (finalHero.level > 0) {
          finalHero.currentHp = finalHero.maxHp;
        }
        return finalHero;
    });
    this.heroes.set(heroesWithStats);
    if (!isPrestige) {
        this.gameState.update(s => ({...s, unlockedHeroIds: [1,2,3,4,5]}));
    }
  }

  private initializeQuests() {
    this.quests.set(INITIAL_QUESTS.map(q => ({...q, isCompleted: false, isClaimed: false })));
    this.checkQuestCompletion();
  }

  startGameLoop() {
    setInterval(() => {
      this.updateGame();
    }, 1000);
  }

  private updateGame() {
    const dps = this.totalDps();
    if (dps > 0 && this.gameState().autoDpsEnabled) {
      if (this.isInRiftCombat()) {
        // FIX: Property 'applyRiftDamage' does not exist on type 'GameService'.
        this.applyRiftDamage(dps, 'dps');
      } else if (!this.isInTowerCombat()) {
        this.dealDamageToEnemy(dps, 'dps');
      }
    }

    if (this.gameState().autoSkillEnabled) {
        const readyHero = this.activeHeroes().find(h => h.skillReady);
        if (readyHero) {
            this.activateHeroSkill(readyHero.id);
        }
    }

    const totalXpGainedThisSecond = this.totalDps() * XP_PER_DPS_PER_SECOND;
    const skillChargeBonus = 1 + this.artifactBonuses().skillChargeRate + this.skillTreeBonuses().skillChargeRate + this.necroConstructBonuses().skillChargeRate;
    const activeHeroIds = new Set(this.gameState().activeHeroIds);

    this.heroes.update(heroes => {
      const activeHeroesCount = this.activeHeroes().length;
      const xpPerHero = activeHeroesCount > 0 ? totalXpGainedThisSecond / activeHeroesCount : 0;
      
      return heroes.map(h => {
        if (activeHeroIds.has(h.id)) {
          let updatedHero = { ...h };

          if (xpPerHero > 0) {
            updatedHero.offlineXp = (h.offlineXp || 0) + xpPerHero;
          }

          if (!h.skillReady) {
            const newCharge = Math.min(100, h.skillCharge + (SKILL_CHARGE_RATE * skillChargeBonus));
            updatedHero.skillCharge = newCharge;
            updatedHero.skillReady = newCharge >= 100;
          }
          
          // Passive HP regen
          if (updatedHero.currentHp < updatedHero.maxHp) {
            const regenAmount = updatedHero.maxHp * 0.005; // 0.5% max hp per second
            updatedHero.currentHp = Math.min(updatedHero.maxHp, updatedHero.currentHp + regenAmount);
          }

          return updatedHero;
        }
        return h;
      });
    });

    // FIX: Property 'getEssenceGenerationRate' does not exist on type 'GameService'.
    const essenceRatePerHour = this.getEssenceGenerationRate();
    // FIX: Property 'getLoyaltyEssenceGenerationRate' does not exist on type 'GameService'.
    const loyaltyEssenceRatePerHour = this.getLoyaltyEssenceGenerationRate();
    if (essenceRatePerHour > 0 || loyaltyEssenceRatePerHour > 0) {
      const essencePerSecond = essenceRatePerHour / 3600;
      const loyaltyEssencePerSecond = loyaltyEssenceRatePerHour / 3600;
      this.gameState.update(s => ({
        ...s,
        heroFarm: {
          ...s.heroFarm,
          accumulatedEssence: s.heroFarm.accumulatedEssence + essencePerSecond,
          accumulatedEssenceOfLoyalty: s.heroFarm.accumulatedEssenceOfLoyalty + loyaltyEssencePerSecond
        }
      }));
    }
    
    if (this.isInRiftCombat()) {
        const enemy = this.currentRiftEnemy();
        if (enemy && enemy.anomalies.some(a => a.id === 'regenerating')) {
            const healAmount = enemy.maxHp * 0.005; // 0.5% per second
            this.currentRiftEnemy.update(e => {
                if (!e) return null;
                return { ...e, currentHp: Math.min(e.maxHp, e.currentHp + healAmount) };
            });
        }
    }

    this.heroAttackPulse.set(true);
    setTimeout(() => this.heroAttackPulse.set(false), 500);

    const now = Date.now();
    const activeBlessings = this.gameState().activeBlessings;
    if (activeBlessings.length > 0) {
        this.gameState.update(s => ({
            ...s,
            activeBlessings: s.activeBlessings.filter(b => b.endTime > now)
        }));
    }
  }

  playerClick() {
    let clickDamage = (this.gameState().clickDamage + this.totalClickDamageBonus());
    clickDamage *= (1 + this.artifactBonuses().clickDamagePercent + this.synergyBonuses().clickDamagePercent + this.skillTreeBonuses().clickDamagePercent);
    
    if (this.isInTowerCombat()) {
        this.applyTowerDamage(clickDamage, 'click');
    } else if (this.isInRiftCombat()) {
        // FIX: Property 'applyRiftDamage' does not exist on type 'GameService'.
        this.applyRiftDamage(clickDamage, 'click');
    } else {
        this.dealDamageToEnemy(clickDamage, 'click');
    }
    this.gameState.update(s => ({...s, totalClicks: s.totalClicks + 1}));
    this.checkQuestCompletion();
  }

  private dealDamageToEnemy(damage: number, type: 'click' | 'dps' | 'skill') {
     if(this.currentEnemy().currentHp <= 0) return;

    let finalDamage = damage;
    const enemy = this.currentEnemy();
    if (enemy.damageReduction) {
        finalDamage = damage * (1 - enemy.damageReduction);
    }
    
    if (type === 'click') {
        this.enemyIsShaking.set(true);
        setTimeout(() => this.enemyIsShaking.set(false), 300);
    }
    this.enemyHit.set(true);
    setTimeout(() => this.enemyHit.set(false), 100);

    if (type === 'dps') {
      const totalDps = this.totalDps();
      if (totalDps > 0) {
        this.heroes.update(heroes => heroes.map(h => {
          if (this.gameState().activeHeroIds.includes(h.id)) {
            const damageShare = finalDamage * (h.currentDps / totalDps);
            const newStats: HeroStats = {
              skillsUsed: h.stats?.skillsUsed ?? 0,
              totalDamageDealt: (h.stats?.totalDamageDealt ?? 0) + damageShare,
            };
            return { ...h, stats: newStats };
          }
          return h;
        }));
      }
    }

    this.currentEnemy.update(e => ({ ...e, currentHp: Math.max(0, e.currentHp - finalDamage) }));
    this.addDamageFlash(finalDamage, type);

    if (this.currentEnemy().currentHp <= 0) {
      this.handleEnemyDrop();
      this.handleMaterialDrop();
      
      const defeatedEnemyType = this.currentEnemy().type;
      this.gameState.update(state => {
        const artifactGoldBonus = 1 + this.artifactBonuses().goldDropPercent;
        const synergyGoldBonus = 1 + this.synergyBonuses().goldDropPercent;
        const skillTreeGoldBonus = 1 + this.skillTreeBonuses().goldDropPercent;
        const guildGoldBonus = 1 + this.guildBonuses().goldDropPercent;
        let goldBonus = (state.goldMultiplier + this.totalGoldDropBonus()) * artifactGoldBonus * synergyGoldBonus * skillTreeGoldBonus * guildGoldBonus;
        
        goldBonus *= (1 + this.necroConstructBonuses().goldDropPercent);

        const goldRush = state.activeBlessings.find(b => b.type === 'goldRush');
        if (goldRush) {
            const blessingInfo = ALL_BLESSINGS.find(b => b.type === 'goldRush')!;
            goldBonus *= blessingInfo.bonusMultiplier;
        }

        const goldEarned = this.currentEnemy().goldReward * goldBonus;

        const discoveredTypes = new Set(state.discoveredMonsterTypes);
        const newDiscoveredMonsterTypes = [...state.discoveredMonsterTypes];
        if (!discoveredTypes.has(defeatedEnemyType)) {
            newDiscoveredMonsterTypes.push(defeatedEnemyType);
        }

        return {
            ...state,
            gold: state.gold + goldEarned,
            stage: state.stage + 1,
            totalEnemiesDefeated: state.totalEnemiesDefeated + 1,
            totalGoldEarned: state.totalGoldEarned + goldEarned,
            discoveredMonsterTypes: newDiscoveredMonsterTypes,
        }
      });
      this.currentEnemy.set(this.createEnemy(this.gameState().stage));
      this.stageCleared.set(true);
      setTimeout(() => this.stageCleared.set(false), 1500);
      this.checkQuestCompletion();
    }
  }
  
  private addDamageFlash(damage: number, type: 'click' | 'dps' | 'skill') {
    const flash = { id: Date.now() + Math.random(), type, damage, x: Math.random() * 60 + 20 };
    this.damageFlashes.update(flashes => [...flashes, flash]);
    setTimeout(() => this.damageFlashes.update(flashes => flashes.filter(f => f.id !== flash.id)), 1000);
  }

  private generateEnemyAsciiArt(type: EnemyType): string {
    const artSet = (ASCII_ART as Record<string, string[]>)[type] || ASCII_ART['Normal'];
    return artSet[Math.floor(Math.random() * artSet.length)];
  }

  private createEnemy(stage: number): Enemy {
    const isBoss = stage > 0 && stage % 10 === 0;

    let type: EnemyType = 'Normal';
    let hpModifier = 1;
    let goldModifier = 1;
    let damageReduction: number | undefined = undefined;
    
    if (isBoss) {
        type = 'Boss';
        hpModifier = 10;
        goldModifier = 20;
    } else {
        const rand = Math.random();
        if (rand < 0.07) { type = 'Caster'; hpModifier = 0.8; goldModifier = 1.2; }
        else if (rand < 0.17) { type = 'Armored'; hpModifier = 1.5; goldModifier = 1.5; damageReduction = 0.3; }
        else if (rand < 0.27) { type = 'Swift'; hpModifier = 0.7; goldModifier = 0.7; }
        else if (rand < 0.32) { type = 'Hoarder'; hpModifier = 2.5; goldModifier = 5.0; }
        else if (rand < 0.37) { type = 'Squad'; hpModifier = 1.8; goldModifier = 2.0; }
        else if (rand < 0.42) { type = 'Minerals'; hpModifier = 1.2; goldModifier = 1.2; }
        else if (rand < 0.47) { type = 'Flora'; hpModifier = 0.9; goldModifier = 1.1; }
        else if (rand < 0.52) { type = 'Fauna'; hpModifier = 1.0; goldModifier = 1.0; }
        else if (rand < 0.57) { type = 'Aquatic'; hpModifier = 1.1; goldModifier = 1.1; }
    }

    const baseHp = Math.floor(10 * Math.pow(1.2, stage - 1));
    const finalHp = baseHp * hpModifier;
    
    const baseName = type === 'Boss' ? 'Guardian' : 
                   (type === 'Caster' ? 'Goblin Shaman' :
                   (type === 'Hoarder' ? 'Goblin Hoarder' : 
                   (type === 'Armored' ? 'Iron Golem' : 
                   (type === 'Swift' ? 'Dire Wolf' : 
                   (type === 'Squad' ? 'Goblin Squad' :
                   (type === 'Minerals' ? 'Rock Golem' :
                   (type === 'Flora' ? 'Vicious Mandrake' :
                   (type === 'Fauna' ? 'Grizzly Bear' :
                   (type === 'Aquatic' ? 'Water Elemental' :
                   ENEMY_NAMES[Math.floor(Math.random() * ENEMY_NAMES.length)])))))))));
    
    const name = type === 'Boss' ? `Stage ${stage} ${baseName}` : `${baseName} Lv.${stage}`;

    return {
      name: name,
      maxHp: finalHp,
      currentHp: finalHp,
      asciiArt: this.generateEnemyAsciiArt(type),
      goldReward: Math.ceil((baseHp/5) * goldModifier),
      isBoss,
      type,
      damageReduction,
    };
  }
  
  // FIX: Implement createRiftEnemy to resolve compilation errors
  private createRiftEnemy(riftLevel: number): RiftEnemy {
    // Rift enemies are tougher than normal stage enemies
    const enemy = this.createEnemy(riftLevel + 50); // Scale them as if they are 50 stages higher
    enemy.name = `Rift Anomaly Lv.${riftLevel}`;
    enemy.goldReward = 0; // Rift enemies don't drop gold, they drop shards.

    const isElite = Math.random() < 0.1; // 10% chance to be elite
    if (isElite) {
      enemy.maxHp *= 2.5;
      enemy.currentHp = enemy.maxHp;
      enemy.name = `[ELITE] ${enemy.name}`;
    }

    // Assign anomalies
    const anomalies: Anomaly[] = [];
    const numAnomalies = isElite ? 2 : (riftLevel > 20 ? (Math.random() < 0.5 ? 2 : 1) : 1);
    
    const availableAnomalies = [...ALL_ANOMALIES];
    for (let i = 0; i < numAnomalies && availableAnomalies.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availableAnomalies.length);
        anomalies.push(availableAnomalies.splice(randomIndex, 1)[0]);
    }

    return {
        ...enemy,
        anomalies,
        isElite,
    };
  }

  private calculateHeroStats<T extends Omit<Hero, 'currentDps' | 'nextLevelCost' | 'xpToNextLevel'>>(hero: T & { xpToNextLevel?: number }): Hero {
      let currentDps = hero.level > 0 ? Math.floor(hero.baseDps * Math.pow(1.1, hero.level - 1)) : 0;
      let dpsPercentBonus = 0;
      for(const slot in hero.equipment) {
        const item = hero.equipment[slot as EquipmentSlot];
        if (item) {
            if (item.bonusType === 'dpsFlat') currentDps += item.bonusValue;
            else if (item.bonusType === 'dpsPercent') dpsPercentBonus += item.bonusValue;
        }
      }

      // SET BONUSES
      const setCounts: { [setName: string]: number } = {};
      for (const slot in hero.equipment) {
          const item = hero.equipment[slot as EquipmentSlot];
          if (item && item.set) {
              setCounts[item.set] = (setCounts[item.set] || 0) + 1;
          }
      }

      for (const setId in setCounts) {
          const set = ALL_EQUIPMENT_SETS.find(s => s.id === setId);
          if (set) {
              const count = setCounts[setId];
              set.bonuses.forEach(bonusInfo => {
                  if (count >= bonusInfo.threshold) {
                      if (bonusInfo.bonus.type === 'dpsPercent') {
                          dpsPercentBonus += bonusInfo.bonus.value;
                      }
                      // Note: Other set bonus types can be handled here in the future
                  }
              });
          }
      }

      if (hero.role === 'Tank') {
        dpsPercentBonus += this.necroConstructBonuses().dpsPercentTank;
      }

      let finalRole = hero.role;
      let finalSkillDescription = hero.skillDescription;
      const heroSpecs = this.gameState().heroSpecializations?.[hero.id] || [];
      
      heroSpecs.forEach(specId => {
          // FIX: Property 'getSpecializationById' does not exist on type 'GameService'.
          const spec = this.getSpecializationById(specId);
          if (spec) {
              if (spec.roleOverride) {
                  finalRole = spec.roleOverride;
              }
              if (spec.statBonuses.dpsPercent) {
                  dpsPercentBonus += spec.statBonuses.dpsPercent;
              }
              if (spec.skillModification) {
                  finalSkillDescription = spec.skillModification.newDescription;
              }
          }
      });
      
      const ascensionBonus = 1 + (hero.ascensionLevel * 0.15);
      currentDps = Math.floor(currentDps * (1 + dpsPercentBonus) * ascensionBonus);
      const costReduction = 1 - this.skillTreeBonuses().upgradeCostReduction;
      const nextLevelCost = Math.floor(hero.baseCost * Math.pow(hero.upgradeCostMultiplier, hero.level) * costReduction);
      const xpToNextLevel = Math.floor(100 * Math.pow(1.2, hero.level));

      const hpRoleMultiplier = hero.role === 'Tank' ? 1.5 : (hero.role === 'Bruiser' ? 1.2 : 1);
      const maxHp = hero.level > 0 ? Math.floor(hero.baseHp * Math.pow(1.15, hero.level - 1) * hpRoleMultiplier) : 0;
      
      const finalHero = { ...hero, currentDps, nextLevelCost, xpToNextLevel, role: finalRole, skillDescription: finalSkillDescription, maxHp };
      finalHero.currentHp = Math.min(finalHero.maxHp, finalHero.currentHp);
      
      return finalHero;
  }

  levelUpHero(heroId: number) {
    this.levelUpHeroMultiple(heroId, 1);
  }

  levelUpHeroMultiple(heroId: number, levelsToGain: number) {
    if (levelsToGain <= 0) return;
    const hero = this.heroes().find(h => h.id === heroId);
    if (!hero) return;

    let totalCost = 0;
    let currentLevel = hero.level;
    const costReduction = 1 - this.skillTreeBonuses().upgradeCostReduction;

    for (let i = 0; i < levelsToGain; i++) {
        totalCost += Math.floor(hero.baseCost * Math.pow(hero.upgradeCostMultiplier, currentLevel + i) * costReduction);
    }
    
    if (this.gameState().gold < totalCost) return;

    this.gameState.update(state => ({ ...state, gold: state.gold - totalCost }));
    
    this.heroes.update(heroes => 
      heroes.map(h => {
        if (h.id === heroId) {
          const wasLevel0 = h.level === 0;
          const updatedHero = { ...h, level: h.level + levelsToGain, currentXp: 0 };
          const finalHero = this.calculateHeroStats(updatedHero);
          
          if (wasLevel0) {
              finalHero.currentHp = finalHero.maxHp;
          } else {
              const hpPercent = h.maxHp > 0 ? h.currentHp / h.maxHp : 1;
              finalHero.currentHp = Math.floor(finalHero.maxHp * hpPercent);
          }

          return finalHero;
        }
        return h;
      })
    );

    this.recentlyLeveledHeroId.set(heroId);
    setTimeout(() => this.recentlyLeveledHeroId.set(null), 500);
    this.checkQuestCompletion();
  }

  levelUpAllHeroes() {
    this.gameState.update(state => {
        let currentGold = state.gold;
        let heroes = this.heroes();
        let heroesUpdated = true;
        
        while(heroesUpdated) {
            heroesUpdated = false;
            let cheapestHero: Hero | null = null;
            let minCost = Infinity;

            for (const hero of heroes) {
                if (hero.level > 0 && hero.nextLevelCost < minCost) {
                    minCost = hero.nextLevelCost;
                    cheapestHero = hero;
                }
            }

            if (cheapestHero && currentGold >= minCost) {
                currentGold -= minCost;
                
                heroes = heroes.map(h => {
                    if (h.id === cheapestHero!.id) {
                        const wasLevel0 = h.level === 0;
                        const updatedHero = { ...h, level: h.level + 1 };
                        const finalHero = this.calculateHeroStats(updatedHero);
                         if (wasLevel0) {
                          finalHero.currentHp = finalHero.maxHp;
                        } else {
                            const hpPercent = h.maxHp > 0 ? h.currentHp / h.maxHp : 1;
                            finalHero.currentHp = Math.floor(finalHero.maxHp * hpPercent);
                        }
                        return finalHero;
                    }
                    return h;
                });

                heroesUpdated = true;
            }
        }

        this.heroes.set(heroes);
        return { ...state, gold: currentGold };
    });
  }

  claimOfflineXp(heroId: number): number {
    const heroToUpdate = this.heroes().find(h => h.id === heroId);
    if (!heroToUpdate || heroToUpdate.offlineXp <= 0) {
        return 0;
    }

    let levelsGained = 0;
    let totalXp = (heroToUpdate.currentXp || 0) + heroToUpdate.offlineXp;
    let newLevel = heroToUpdate.level;
    let xpForNext = heroToUpdate.xpToNextLevel;
    let hpPercent = heroToUpdate.maxHp > 0 ? heroToUpdate.currentHp / heroToUpdate.maxHp : 1;

    while (totalXp >= xpForNext) {
        totalXp -= xpForNext;
        newLevel++;
        levelsGained++;
        xpForNext = Math.floor(100 * Math.pow(1.2, newLevel));
    }

    const updatedHeroStats = {
        ...heroToUpdate,
        level: newLevel,
        currentXp: totalXp,
        offlineXp: 0
    };
    const finalHero = this.calculateHeroStats(updatedHeroStats);
    finalHero.currentHp = Math.floor(finalHero.maxHp * hpPercent);

    this.heroes.update(heroes => heroes.map(h => h.id === heroId ? finalHero : h));

    if (levelsGained > 0) {
        this.recentlyLeveledHeroId.set(heroId);
        setTimeout(() => this.recentlyLeveledHeroId.set(null), 500);
        this.checkQuestCompletion();
    }

    return levelsGained;
  }

  toggleHeroFavorite(heroId: number) {
    this.heroes.update(heroes => heroes.map(h => h.id === heroId ? { ...h, isFavorite: !h.isFavorite } : h));
  }
  
  private _applyHealthChange(heroId: number, amount: number) {
    this.heroes.update(heroes => heroes.map(h => {
        if (h.id === heroId) {
            const newHp = Math.max(0, Math.min(h.maxHp, h.currentHp + amount));
            if (newHp !== h.currentHp) {
                this.heroHealthUpdate.set({ heroId, type: amount > 0 ? 'heal' : 'damage' });
                setTimeout(() => this.heroHealthUpdate.set(null), 50); 
                return { ...h, currentHp: newHp };
            }
        }
        return h;
    }));
  }

  activateHeroSkill(heroId: number) {
    const hero = this.heroes().find(h => h.id === heroId);
    if (!hero || !hero.skillReady || !this.gameState().activeHeroIds.includes(hero.id)) return;
    
    let skillDamageMultiplier = 1 + this.skillTreeBonuses().skillDamagePercent;

    const heroSpecs = this.gameState().heroSpecializations?.[hero.id] || [];
    heroSpecs.forEach(specId => {
        // FIX: Property 'getSpecializationById' does not exist on type 'GameService'.
        const spec = this.getSpecializationById(specId);
        if (spec && spec.statBonuses.skillDamagePercent) {
            skillDamageMultiplier += spec.statBonuses.skillDamagePercent;
        }
    });

    const skillDamage = hero.currentDps * (5 + (hero.skillLevel - 1) * 0.5) * skillDamageMultiplier;
    
    // --- SKILL-SPECIFIC LOGIC ---
    switch (hero.id) {
        case 30: // Cursed Samurai
            const selfDamage = hero.maxHp * 0.1; // Takes 10% max HP as damage
            this._applyHealthChange(hero.id, -selfDamage);
            break;
        case 22: // Vampire Lord
            const lifeLeech = skillDamage * 0.25; // Heals for 25% of skill damage dealt
            this._applyHealthChange(hero.id, lifeLeech);
            break;
        case 5: // Sun Priestess
            this.activeHeroes().forEach(h => this._applyHealthChange(h.id, h.maxHp * 0.15)); // Heals all allies for 15% of their max HP
            break;
        case 11: // Celestial Healer
        case 40: // Field Medic
            const mostWounded = this.activeHeroes().sort((a, b) => (a.currentHp / a.maxHp) - (b.currentHp / b.maxHp))[0];
            if (mostWounded) {
                const healAmount = hero.id === 11 ? mostWounded.maxHp * 0.30 : mostWounded.maxHp * 0.10; // 30% for Celestial, 10% for Medic
                this._applyHealthChange(mostWounded.id, healAmount);
            }
            break;
        case 48: // Paladin of the Sun
            this.activeHeroes().forEach(h => this._applyHealthChange(h.id, h.maxHp * 0.10)); // Heals all allies for 10% of their max HP
            break;
    }

    if (this.isInTowerCombat()) {
        this.applyTowerDamage(skillDamage, 'skill');
    } else if (this.isInRiftCombat()) {
        // FIX: Property 'applyRiftDamage' does not exist on type 'GameService'.
        this.applyRiftDamage(skillDamage, 'skill');
    } else {
        this.dealDamageToEnemy(skillDamage, 'skill');
    }

    this.heroes.update(heroes => heroes.map(h => {
      if (h.id === heroId) {
        const newStats: HeroStats = {
          skillsUsed: (h.stats?.skillsUsed ?? 0) + 1,
          totalDamageDealt: (h.stats?.totalDamageDealt ?? 0) + skillDamage,
        };
        return { ...h, skillCharge: 0, skillReady: false, stats: newStats };
      }
      return h;
    }));
    
    this.gameState.update(s => ({...s, totalSkillsUsed: s.totalSkillsUsed + 1}));
    this.lastSkillUsed.set({ heroId, damage: skillDamage, rarity: hero.rarity });
    setTimeout(() => this.lastSkillUsed.set(null), 500);
    this.checkQuestCompletion();
  }

  private getItemScore(item: EquipmentItem): number {
    let score = 0;
    const rarityMultiplier: Record<Rarity, number> = { 'Common': 1, 'Rare': 2, 'Epic': 4, 'Legendary': 8, 'Mythic': 16 };
    
    switch (item.bonusType) {
        case 'dpsPercent': score = item.bonusValue * 1000; break;
        case 'dpsFlat': score = item.bonusValue; break;
        case 'goldDropPercent': score = item.bonusValue * 500; break;
        case 'clickDamageFlat': score = item.bonusValue * 0.1; break;
    }
    
    return score * rarityMultiplier[item.rarity];
  }

  autoEquipBestGear(heroId: number) {
    const hero = this.heroes().find(h => h.id === heroId);
    if (!hero) return;

    const inventory = this.inventory();
    let updatedEquipment = { ...hero.equipment };
    const itemsToReturn: EquipmentItem[] = [];
    const itemsToRemoveFromInv: number[] = [];

    const slots: EquipmentSlot[] = ['Weapon', 'Armor', 'Accessory'];

    for (const slot of slots) {
      const availableItems = inventory.filter(i => i.slot === slot);
      if (availableItems.length === 0) continue;

      const bestItem = availableItems.reduce((best, current) => this.getItemScore(current) > this.getItemScore(best) ? current : best);
      
      const currentItem = updatedEquipment[slot];
      const currentItemScore = currentItem ? this.getItemScore(currentItem) : -1;
      
      if (this.getItemScore(bestItem) > currentItemScore) {
        if (currentItem) {
          itemsToReturn.push(currentItem);
        }
        updatedEquipment[slot] = bestItem;
        itemsToRemoveFromInv.push(bestItem.id);
      }
    }

    if (itemsToReturn.length > 0 || itemsToRemoveFromInv.length > 0) {
      this.heroes.update(heroes => heroes.map(h => {
        if (h.id === heroId) {
          return this.calculateHeroStats({ ...h, equipment: updatedEquipment });
        }
        return h;
      }));
      
      this.inventory.update(inv => [
        ...inv.filter(i => !itemsToRemoveFromInv.includes(i.id)),
        ...itemsToReturn
      ]);
    }
  }

  equipItem(heroId: number, itemId: number) {
    const itemToEquip = this.inventory().find(i => i.id === itemId);
    const hero = this.heroes().find(h => h.id === heroId);
    if (!itemToEquip || !hero) return;
    this.heroes.update(heroes => heroes.map(h => {
        if (h.id === heroId) {
            const newEquipment = { ...h.equipment };
            const currentItem = newEquipment[itemToEquip.slot];
            if (currentItem) { this.inventory.update(inv => [...inv, currentItem]); }
            newEquipment[itemToEquip.slot] = itemToEquip;
            return this.calculateHeroStats({ ...h, equipment: newEquipment });
        }
        return h;
    }));
    this.inventory.update(inv => inv.filter(i => i.id !== itemId));
  }

  unequipItem(heroId: number, slot: EquipmentSlot) {
    const hero = this.heroes().find(h => h.id === heroId);
    if (!hero) return;
    const itemToUnequip = hero.equipment[slot];
    if (!itemToUnequip) return;
    this.heroes.update(heroes => heroes.map(h => {
        if (h.id === heroId) {
            const newEquipment = { ...h.equipment, [slot]: null };
            return this.calculateHeroStats({ ...h, equipment: newEquipment });
        }
        return h;
    }));
    this.inventory.update(inv => [...inv, itemToUnequip]);
  }

  unequipItemById(itemId: number) {
    const heroToUpdate = this.heroes().find(h => 
        Object.values(h.equipment).some(item => item?.id === itemId)
    );
    if (!heroToUpdate) return;
    
    const slot = (Object.keys(heroToUpdate.equipment) as EquipmentSlot[]).find(s => heroToUpdate.equipment[s]?.id === itemId);
    if (slot) {
        this.unequipItem(heroToUpdate.id, slot);
    }
  }

  craftItems(itemIds: number[]): boolean {
    if (itemIds.length !== 3) return false;
    const itemsToCraft = this.inventory().filter(i => itemIds.includes(i.id));
    if (itemsToCraft.length !== 3) return false;
    const firstItem = itemsToCraft[0];
    const isValid = itemsToCraft.every(item => item.slot === firstItem.slot && item.rarity === firstItem.rarity);
    if (!isValid) return false;
    const currentRarityIndex = RARITY_ORDER.indexOf(firstItem.rarity);
    if (currentRarityIndex >= RARITY_ORDER.length - 1) return false;
    const newRarity = RARITY_ORDER[currentRarityIndex + 1];
    const newItem = this._generateForgedItem(firstItem.slot, newRarity);
    const currentHighestIndex = this.gameState().highestRarityForged ? RARITY_ORDER.indexOf(this.gameState().highestRarityForged!) : -1;
    if (currentRarityIndex + 1 > currentHighestIndex) {
        this.gameState.update(s => ({ ...s, highestRarityForged: newRarity }));
    }
    this.gameState.update(s => ({ ...s, totalItemsForged: s.totalItemsForged + 1 }));
    this.inventory.update(inv => [...inv.filter(i => !itemIds.includes(i.id)), newItem]);
    this.checkQuestCompletion();
    return true;
  }

  private _generateForgedItem(slot: EquipmentSlot, rarity: Rarity): EquipmentItem {
    const STATS_BY_RARITY: Record<string, {dpsFlat: number, dpsPercent: number, goldDropPercent: number}> = { 
      'Rare': {dpsFlat: 5, dpsPercent: 0.05, goldDropPercent: 0.05}, 
      'Epic': {dpsFlat: 25, dpsPercent: 0.15, goldDropPercent: 0.15}, 
      'Legendary': {dpsFlat: 100, dpsPercent: 0.3, goldDropPercent: 0.3}, 
      'Mythic': {dpsFlat: 500, dpsPercent: 0.5, goldDropPercent: 0.5} 
    };
    let bonusType: EquipmentBonusType = 'dpsFlat';
    let bonusValue = 1;
    let name = `Forged ${rarity} Item`;
    const forgedLore = [ "A masterpiece of the forge, humming with newfound power.", "Three become one. This item radiates potential.", "Reforged and reborn, its quality is undeniable.", "The smiths outdid themselves. This piece is nearly flawless." ];
    let lore = forgedLore[Math.floor(Math.random() * forgedLore.length)];

    const rarityStats = STATS_BY_RARITY[rarity as keyof typeof STATS_BY_RARITY];

    switch(slot) { 
      case 'Weapon': name = `Forged ${rarity} ${slot}`; bonusType = Math.random() > 0.5 ? 'dpsFlat' : 'dpsPercent'; if (bonusType === 'dpsPercent') { bonusValue = rarityStats?.dpsPercent || 0.01; } else { bonusValue = rarityStats?.dpsFlat || 1; } break; 
      case 'Armor': name = `Forged ${rarity} ${slot}`; bonusType = 'dpsFlat'; bonusValue = Math.floor((rarityStats?.dpsFlat || 1) * 0.5); break; 
      case 'Accessory': name = `Forged ${rarity} Trinket`; bonusType = 'goldDropPercent'; bonusValue = rarityStats?.goldDropPercent || 0.01; break; 
    } 
    
    const finalBonusValue = bonusValue * (1 + (Math.random() - 0.5) * 0.2);

    return { 
      id: Date.now() + Math.random(), 
      name, 
      slot, 
      rarity, 
      bonusType, 
      bonusValue: finalBonusValue,
      baseBonusValue: finalBonusValue,
      enchantLevel: 0,
      lore
    }; 
  }

  private _generateDroppedItem(stage: number, rarity: Rarity): EquipmentItem {
    const slots: EquipmentSlot[] = ['Weapon', 'Armor', 'Accessory'];
    const slot = slots[Math.floor(Math.random() * slots.length)];
    
    const STATS_BY_RARITY: Record<Rarity, {dpsFlat: number, dpsPercent: number, goldDropPercent: number}> = { 
        'Common': {dpsFlat: 2, dpsPercent: 0.02, goldDropPercent: 0.02},
        'Rare': {dpsFlat: 10, dpsPercent: 0.07, goldDropPercent: 0.07}, 
        'Epic': {dpsFlat: 50, dpsPercent: 0.20, goldDropPercent: 0.20}, 
        'Legendary': {dpsFlat: 250, dpsPercent: 0.4, goldDropPercent: 0.4}, 
        'Mythic': {dpsFlat: 1000, dpsPercent: 0.6, goldDropPercent: 0.6} 
    };
    const LORE_TEMPLATES = { Weapon: [ "Taken from a fearsome foe, it still holds a grudge.", "This weapon has seen countless battles, and is ready for more.", "Glows with a faint, otherworldly light." ], Armor: [ "This piece of armor has saved a life more than once.", "Surprisingly light, yet unnervingly strong.", "Scratched and dented, but its integrity is unquestionable." ], Accessory: [ "A lucky charm that seems to actually work.", "Lost by a powerful adventurer long ago. Their loss is your gain.", "It feels warm to the touch, pulsing with a gentle energy." ] };

    let bonusType: EquipmentBonusType = 'dpsFlat';
    let bonusValue = 1;
    let name = `${rarity} Item`;
    let lore = LORE_TEMPLATES[slot][Math.floor(Math.random() * LORE_TEMPLATES[slot].length)];

    const rarityStats = STATS_BY_RARITY[rarity];

    switch(slot){ 
        case 'Weapon': name = `${rarity} Blade`; bonusType = Math.random() > 0.5 ? 'dpsFlat' : 'dpsPercent'; if (bonusType === 'dpsPercent') { bonusValue = rarityStats?.dpsPercent || 0.01; } else { bonusValue = rarityStats?.dpsFlat || 1; } break; 
        case 'Armor': name = `${rarity} Guard`; bonusType = 'dpsFlat'; bonusValue = Math.floor((rarityStats?.dpsFlat || 1) * 0.7); break; 
        case 'Accessory': name = `${rarity} Charm`; bonusType = 'goldDropPercent'; bonusValue = rarityStats?.goldDropPercent || 0.01; break; 
    }
    
    const stageMultiplier = 1 + (stage / 200);
    const finalBonusValue = bonusValue * stageMultiplier * (1 + (Math.random() - 0.5) * 0.2);

    return { 
      id: Date.now() + Math.random(), 
      name, 
      slot, 
      rarity, 
      bonusType, 
      bonusValue: finalBonusValue,
      baseBonusValue: finalBonusValue,
      enchantLevel: 0,
      lore
    };
  }
  
  private handleEnemyDrop() {
    const enemy = this.currentEnemy();
    const dropChance = enemy.isBoss ? 1.0 : 0.20;

    if (Math.random() > dropChance) {
        return;
    }

    const rand = Math.random();
    let rarity: Rarity;

    if (enemy.isBoss) {
        if (rand < 0.02) rarity = 'Legendary';
        else if (rand < 0.30) rarity = 'Epic';
        else rarity = 'Rare';
    } else {
        if (rand < 0.001) rarity = 'Legendary';
        else if (rand < 0.05) rarity = 'Epic';
        else if (rand < 0.30) rarity = 'Rare';
        else rarity = 'Common';
    }
    
    const newItem = this._generateDroppedItem(this.gameState().stage, rarity);
    this.inventory.update(inv => [...inv, newItem]);
    this.lastItemDrop.set(newItem);
    setTimeout(() => this.lastItemDrop.set(null), 3000);
  }

  private handleMaterialDrop() {
    const enemy = this.currentEnemy();
    const dropChance = enemy.isBoss ? 0.9 : 0.5;

    if (Math.random() > dropChance) {
      this.lastMaterialDrop.set(null);
      return;
    }

    const possibleMaterials: Material[] = [];
    switch(enemy.type) {
        case 'Minerals':
            possibleMaterials.push(...ALL_MATERIALS.filter(m => m.type === 'Ore' || m.type === 'Stone'));
            break;
        case 'Flora':
            possibleMaterials.push(...ALL_MATERIALS.filter(m => m.type === 'Herb' || m.type === 'Wood'));
            break;
        case 'Fauna':
            possibleMaterials.push(...ALL_MATERIALS.filter(m => m.type === 'Leather'));
            break;
        case 'Aquatic':
            possibleMaterials.push(...ALL_MATERIALS.filter(m => m.type === 'Fish' || m.type === 'Reagent'));
            break;
        default: // Normal, Armored, Swift, Hoarder, Boss, Caster, Squad can drop cloth or dust
             possibleMaterials.push(...ALL_MATERIALS.filter(m => m.type === 'Cloth' || m.type === 'Dust'));
            break;
    }

    if (possibleMaterials.length === 0) {
        this.lastMaterialDrop.set(null);
        return;
    }

    const numDrops = enemy.isBoss ? (Math.floor(Math.random() * 2) + 2) : 1; // 2-3 for boss, 1 for normal
    const drops: { [id: string]: { name: string; rarity: Rarity; quantity: number } } = {};

    for (let i = 0; i < numDrops; i++) {
        const materialToDrop = possibleMaterials[Math.floor(Math.random() * possibleMaterials.length)];
        const quantity = materialToDrop.rarity === 'Common' ? (Math.floor(Math.random() * 3) + 1) : 1; // 1-3 for common, 1 for rare+

        if (drops[materialToDrop.id]) {
            drops[materialToDrop.id].quantity += quantity;
        } else {
            drops[materialToDrop.id] = {
                name: materialToDrop.name,
                rarity: materialToDrop.rarity,
                quantity: quantity
            };
        }
    }
    
    // Add a chance for Elemental Souls to drop from powerful enemies
    const soulDropChance = enemy.isBoss ? 0.20 : (enemy.type === 'Caster' ? 0.10 : 0);
    if (Math.random() < soulDropChance) {
        const elementalSouls = ['soul_fire', 'soul_water', 'soul_earth', 'soul_air'];
        const soulToDropId = elementalSouls[Math.floor(Math.random() * elementalSouls.length)];
        const soulMaterial = ALL_MATERIALS.find(m => m.id === soulToDropId)!;

        if (drops[soulToDropId]) {
            drops[soulToDropId].quantity += 1;
        } else {
            drops[soulToDropId] = {
                name: soulMaterial.name,
                rarity: soulMaterial.rarity,
                quantity: 1
            };
        }
    }
    
    this.gameState.update(s => {
      const newMaterials = {...s.materials};
      const newDiscovered = new Set(s.discoveredMaterials);
      
      for(const dropId in drops) {
        newMaterials[dropId] = (newMaterials[dropId] || 0) + drops[dropId].quantity;
        if (!newDiscovered.has(dropId)) {
            newDiscovered.add(dropId);
        }
      }

      return {
        ...s,
        materials: newMaterials,
        discoveredMaterials: Array.from(newDiscovered)
      }
    });
    
    const finalDrops = Object.values(drops);
    if (finalDrops.length > 0) {
        this.lastMaterialDrop.set(finalDrops);
        setTimeout(() => this.lastMaterialDrop.set(null), 3000);
    } else {
        this.lastMaterialDrop.set(null);
    }
  }

  summonHero(type: 'standard' | 'premium'): { hero: Omit<Hero, 'currentDps' | 'nextLevelCost' | 'equipment' | 'skillCharge' | 'skillReady' | 'currentXp' | 'xpToNextLevel' | 'offlineXp'>, isNew: boolean, goldBonus: number | null, shardsGained: number | null } | null {
    if (type === 'standard' && this.gameState().gold < GameService.STANDARD_SUMMON_COST_GOLD) return null;
    if (type === 'premium' && this.gameState().prestigePoints < GameService.PREMIUM_SUMMON_COST_PRESTIGE) return null;

    if (type === 'standard') this.gameState.update(s => ({...s, gold: s.gold - GameService.STANDARD_SUMMON_COST_GOLD }));
    else this.gameState.update(s => ({...s, prestigePoints: s.prestigePoints - GameService.PREMIUM_SUMMON_COST_PRESTIGE }));

    return this._performSummon(type);
  }

  freeStandardSummon(): { hero: Omit<Hero, 'currentDps' | 'nextLevelCost' | 'equipment' | 'skillCharge' | 'skillReady' | 'currentXp' | 'xpToNextLevel' | 'offlineXp'>, isNew: boolean, goldBonus: number | null, shardsGained: number | null } | null {
    const lastClaim = this.gameState().lastFreeStandardSummonTimestamp ?? 0;
    const cooldownMs = 24 * 60 * 60 * 1000; // 24 hours
    if (Date.now() < lastClaim + cooldownMs) {
        return null; // Not ready
    }
    
    this.gameState.update(s => ({...s, lastFreeStandardSummonTimestamp: Date.now()}));
    
    return this._performSummon('standard');
  }

  private _performSummon(type: 'standard' | 'premium'): { hero: Omit<Hero, 'currentDps' | 'nextLevelCost' | 'equipment' | 'skillCharge' | 'skillReady' | 'currentXp' | 'xpToNextLevel' | 'offlineXp'>, isNew: boolean, goldBonus: number | null, shardsGained: number | null } | null {
    const PITY_LIMIT_STANDARD = 50; // Guaranteed Epic
    const PITY_LIMIT_PREMIUM = 20; // Guaranteed Legendary

    let pityCount = type === 'standard' ? (this.gameState().standardPityCount || 0) : (this.gameState().premiumPityCount || 0);
    pityCount++;

    const rand = Math.random();
    let rarity: Rarity;
    
    let isPitySummon = false;
    if (type === 'standard' && pityCount >= PITY_LIMIT_STANDARD) {
        rarity = 'Epic';
        isPitySummon = true;
    } else if (type === 'premium' && pityCount >= PITY_LIMIT_PREMIUM) {
        rarity = 'Legendary';
        isPitySummon = true;
    } else {
        if (type === 'standard') {
            if (rand < 0.01) rarity = 'Epic';
            else if (rand < 0.25) rarity = 'Rare';
            else rarity = 'Common';
        } else { // premium
            if (rand < 0.05) rarity = 'Legendary';
            else if (rand < 0.40) rarity = 'Epic';
            else rarity = 'Rare';
        }
    }
    
    let resetPity = isPitySummon;
    if (!resetPity) {
        if (type === 'standard' && rarity === 'Epic') {
            resetPity = true;
        }
        if (type === 'premium' && rarity === 'Legendary') {
            resetPity = true;
        }
    }
    const finalPityCount = resetPity ? 0 : pityCount;

    const possibleHeroes = ALL_HEROES.filter(h => h.rarity === rarity);
    if (possibleHeroes.length === 0) return null;

    const summonedHeroData = possibleHeroes[Math.floor(Math.random() * possibleHeroes.length)];
    const isOwned = this.heroes().some(h => h.id === summonedHeroData.id);
    let isNew = false;
    let goldBonus = null;
    let shardsGained = null;
    const shardValues: Record<Rarity, number> = { 'Common': 1, 'Rare': 3, 'Epic': 5, 'Legendary': 10, 'Mythic': 20 };

    if (isOwned) {
        goldBonus = DUPLICATE_HERO_GOLD_REWARD / 2;
        shardsGained = shardValues[summonedHeroData.rarity];
        this.gameState.update(s => {
            const newShards = {...s.heroShards};
            newShards[summonedHeroData.id] = (newShards[summonedHeroData.id] || 0) + shardsGained!;
            return ({...s, 
                gold: s.gold + goldBonus!, 
                heroShards: newShards,
                standardPityCount: type === 'standard' ? finalPityCount : s.standardPityCount,
                premiumPityCount: type === 'premium' ? finalPityCount : s.premiumPityCount,
                totalHeroesSummoned: s.totalHeroesSummoned + 1,
            });
        });
    } else {
        const newHero: Omit<Hero, 'currentDps' | 'nextLevelCost'> = { ...summonedHeroData, level: 0, equipment: { Weapon: null, Armor: null, Accessory: null }, skillCharge: 0, skillReady: false, isFavorite: false, currentXp: 0, xpToNextLevel: 100, offlineXp: 0, stats: { totalDamageDealt: 0, skillsUsed: 0 }, ascensionLevel: 0, skillLevel: 1 };
        this.heroes.update(heroes => [...heroes, this.calculateHeroStats(newHero)].sort((a,b) => a.id - b.id));
        this.gameState.update(s => ({
            ...s, 
            unlockedHeroIds: [...s.unlockedHeroIds, summonedHeroData.id],
            standardPityCount: type === 'standard' ? finalPityCount : s.standardPityCount,
            premiumPityCount: type === 'premium' ? finalPityCount : s.premiumPityCount,
            totalHeroesSummoned: s.totalHeroesSummoned + 1
        }));
        isNew = true;
    }

    this.checkQuestCompletion();
    return { hero: summonedHeroData, isNew, goldBonus, shardsGained };
  }

  summonHeroes(type: 'standard' | 'premium', count: number): { hero: Omit<Hero, 'currentDps' | 'nextLevelCost' | 'equipment' | 'skillCharge' | 'skillReady' | 'currentXp' | 'xpToNextLevel' | 'offlineXp'>, isNew: boolean, goldBonus: number | null, shardsGained: number | null }[] | null {
    const PITY_LIMIT_STANDARD = 50;
    const PITY_LIMIT_PREMIUM = 20;
    
    const cost = type === 'standard' 
        ? GameService.STANDARD_SUMMON_COST_GOLD * count
        : GameService.PREMIUM_SUMMON_COST_PRESTIGE * count;

    if (type === 'standard' && this.gameState().gold < cost) return null;
    if (type === 'premium' && this.gameState().prestigePoints < cost) return null;

    if (type === 'standard') {
      this.gameState.update(s => ({ ...s, gold: s.gold - cost }));
    } else {
      this.gameState.update(s => ({ ...s, prestigePoints: s.prestigePoints - cost }));
    }

    const results: { hero: Omit<Hero, 'currentDps' | 'nextLevelCost' | 'equipment' | 'skillCharge' | 'skillReady' | 'currentXp' | 'xpToNextLevel' | 'offlineXp'>, isNew: boolean, goldBonus: number | null, shardsGained: number | null }[] = [];
    const newHeroes: Hero[] = [];
    let totalGoldBonus = 0;
    const newHeroIds = new Set<number>();
    const newHeroShards: Record<number, number> = {};
    const shardValues: Record<Rarity, number> = { 'Common': 1, 'Rare': 3, 'Epic': 5, 'Legendary': 10, 'Mythic': 20 };

    let currentPity = type === 'standard'
      ? (this.gameState().standardPityCount || 0)
      : (this.gameState().premiumPityCount || 0);

    for (let i = 0; i < count; i++) {
      currentPity++;
      const rand = Math.random();
      let rarity: Rarity;
      let isPitySummon = false;
      
      if (type === 'standard') {
        if (currentPity >= PITY_LIMIT_STANDARD) {
          rarity = 'Epic';
          isPitySummon = true;
        } else {
          rarity = rand < 0.01 ? 'Epic' : rand < 0.25 ? 'Rare' : 'Common';
        }
      } else { // premium
        if (currentPity >= PITY_LIMIT_PREMIUM) {
          rarity = 'Legendary';
          isPitySummon = true;
        } else {
          rarity = rand < 0.05 ? 'Legendary' : rand < 0.40 ? 'Epic' : 'Rare';
        }
      }
      
      let resetPity = isPitySummon;
      if (!resetPity) {
        if (type === 'standard' && rarity === 'Epic') {
          resetPity = true;
        }
        if (type === 'premium' && rarity === 'Legendary') {
          resetPity = true;
        }
      }
      if (resetPity) {
        currentPity = 0;
      }
      
      const possibleHeroes = ALL_HEROES.filter(h => h.rarity === rarity);
      if (possibleHeroes.length === 0) continue;

      const summonedHeroData = possibleHeroes[Math.floor(Math.random() * possibleHeroes.length)];
      const isOwned = this.heroes().some(h => h.id === summonedHeroData.id) || newHeroIds.has(summonedHeroData.id);
      
      if (isOwned) {
        const goldBonus = DUPLICATE_HERO_GOLD_REWARD / 2;
        const shardsGained = shardValues[summonedHeroData.rarity];
        totalGoldBonus += goldBonus;
        results.push({ hero: summonedHeroData, isNew: false, goldBonus, shardsGained });
        newHeroShards[summonedHeroData.id] = (newHeroShards[summonedHeroData.id] || 0) + shardsGained;
      } else {
        const newHeroData: Omit<Hero, 'currentDps' | 'nextLevelCost'> = { ...summonedHeroData, level: 0, equipment: { Weapon: null, Armor: null, Accessory: null }, skillCharge: 0, skillReady: false, isFavorite: false, currentXp: 0, xpToNextLevel: 100, offlineXp: 0, stats: { totalDamageDealt: 0, skillsUsed: 0 }, ascensionLevel: 0, skillLevel: 1 };
        newHeroes.push(this.calculateHeroStats(newHeroData));
        newHeroIds.add(newHeroData.id);
        results.push({ hero: summonedHeroData, isNew: true, goldBonus: null, shardsGained: null });
      }
    }

    this.gameState.update(s => {
      const updatedShards = { ...s.heroShards };
      for (const heroId in newHeroShards) {
        updatedShards[+heroId] = (updatedShards[+heroId] || 0) + newHeroShards[+heroId];
      }
      return { 
        ...s, 
        gold: s.gold + totalGoldBonus, 
        totalGoldEarned: s.totalGoldEarned + totalGoldBonus,
        heroShards: updatedShards,
        standardPityCount: type === 'standard' ? currentPity : s.standardPityCount,
        premiumPityCount: type === 'premium' ? currentPity : s.premiumPityCount,
      };
    });

    if (newHeroes.length > 0) {
      this.heroes.update(currentHeroes => [...currentHeroes, ...newHeroes].sort((a, b) => a.id - b.id));
      this.gameState.update(s => ({ ...s, unlockedHeroIds: [...s.unlockedHeroIds, ...Array.from(newHeroIds)] }));
    }

    this.gameState.update(s => ({ ...s, totalHeroesSummoned: s.totalHeroesSummoned + count }));
    this.checkQuestCompletion();

    return results;
  }

  private getGlobalBonus(bonusType: 'clickDamageFlat' | 'goldDropPercent'): number {
    return this.heroes().flatMap(hero => Object.values(hero.equipment)).reduce((t, item) => item && item.bonusType === bonusType ? t + item.bonusValue : t, 0);
  }

  levelUpClickDamage() {
      const cost = this.getClickDamageUpgradeCost();
      if(this.gameState().gold >= cost) this.gameState.update(state => ({ ...state, gold: state.gold - cost, clickDamage: state.clickDamage + 1 }));
  }

  getClickDamageUpgradeCost(): number { return Math.floor(25 * Math.pow(1.2, this.gameState().clickDamage -1)); }

  canPrestige(): boolean { return this.gameState().stage >= PRESTIGE_STAGE_REQUIREMENT; }

  getPrestigePointsReward(): number { return Math.floor(this.gameState().stage / 10); }

  prestige() {
    if (!this.canPrestige()) return;
    const points = this.getPrestigePointsReward();
    const skillTomesFromTree = this.skillTreeBonuses().skillTomesPerPrestige;

    const state = this.gameState();
    // FIX: Preserve more state properties during prestige to avoid accidental resets.
    const preservedState: Partial<GameState> = {
      prestigePoints: state.prestigePoints + points,
      goldMultiplier: state.goldMultiplier,
      teamPresets: state.teamPresets,
      towerState: state.towerState,
      lastLoginDate: state.lastLoginDate,
      consecutiveLoginDays: state.consecutiveLoginDays,
      artifacts: state.artifacts,
      unlockedHeroIds: state.unlockedHeroIds,
      viewedHeroIdsInCodex: state.viewedHeroIdsInCodex,
      viewedPetIdsInCodex: state.viewedPetIdsInCodex,
      discoveredMaterials: state.discoveredMaterials,
      viewedMaterialsInCodex: state.viewedMaterialsInCodex,
      discoveredMonsterTypes: state.discoveredMonsterTypes,
      viewedMonsterTypesInCodex: state.viewedMonsterTypesInCodex,
      totalClicks: state.totalClicks,
      totalGoldEarned: state.totalGoldEarned,
      totalPrestiges: state.totalPrestiges + 1,
      totalSkillsUsed: state.totalSkillsUsed,
      totalDungeonsCompleted: state.totalDungeonsCompleted,
      totalExpeditionsCompleted: state.totalExpeditionsCompleted,
      totalSponsorClaims: state.totalSponsorClaims,
      totalItemsForged: state.totalItemsForged,
      totalGoldDonated: state.totalGoldDonated,
      autoDpsEnabled: state.autoDpsEnabled,
      autoSkillEnabled: state.autoSkillEnabled,
      dungeonCrests: state.dungeonCrests,
      activeDungeonBounties: state.activeDungeonBounties,
      purchasedDungeonShopItems: state.purchasedDungeonShopItems,
      lastTributeClaimTimestamp: state.lastTributeClaimTimestamp,
      lastGoldRushTimestamp: state.lastGoldRushTimestamp,
      lastSponsorOfferTimestamp: state.lastSponsorOfferTimestamp,
      enchantingDust: state.enchantingDust,
      lastFreeStandardSummonTimestamp: state.lastFreeStandardSummonTimestamp,
      standardPityCount: state.standardPityCount,
      premiumPityCount: state.premiumPityCount,
      pets: state.pets,
      petCrystals: state.petCrystals,
      essenceOfLoyalty: state.essenceOfLoyalty,
      heroMemories: state.heroMemories,
      heroSkillLevels: state.heroSkillLevels,
      skillTomes: state.skillTomes + skillTomesFromTree,
      unlockedSkillTreeNodes: state.unlockedSkillTreeNodes,
      heroEssence: state.heroEssence,
      heroFarm: state.heroFarm,
      materials: state.materials,
      heroSpecializations: state.heroSpecializations,
      unlockedHybridSouls: state.unlockedHybridSouls,
      missionProgress: state.missionProgress,
      necroConstructs: state.necroConstructs,
      highestRiftLevel: state.highestRiftLevel,
      riftShards: state.riftShards,
      guild: state.guild,
    };
    
    this.gameState.update(s => ({
      ...s, // Keep all properties from the original state...
      // ... then overwrite the ones that need resetting or updating.
      stage: 1, 
      gold: 100, 
      clickDamage: 1,
      activeHeroIds: [1, ...Array(19).fill(null)],
      totalEnemiesDefeated: 0, 
      totalHeroesSummoned: 0,
      highestRarityForged: null,
      lastUpdateTimestamp: Date.now(),
      towerFloor: 1,
      ongoingExpeditions: [],
      activeDungeonRuns: [],
      activeBlessings: [],
      blessingCooldowns: [],
      vaultInvestment: null,
      activeMiningOperation: null,
      heroShards: {},
      riftLevel: 1,
      ...preservedState
    }));
    this.currentEnemy.set(this.createEnemy(1));
    this.initializeGame(true);
    this.initializeQuests(); 
    this.initializeInventory();
    this.saveGame();
    this.checkQuestCompletion();
  }
  
  private checkQuestCompletion() {
    this.quests.update(quests => quests.map(quest => {
        if (quest.isCompleted) return quest;
        let completed = false;
        switch (quest.type) {
            case 'reachStage': completed = this.gameState().stage >= (quest.target as number); break;
            case 'levelUpHero': completed = this.heroes().some(h => h.level >= (quest.target as number)); break;
            case 'defeatEnemies': completed = this.gameState().totalEnemiesDefeated >= (quest.target as number); break;
            case 'summonHero': completed = this.gameState().totalHeroesSummoned >= (quest.target as number); break;
            case 'forgeRarity':
                const highestForged = this.gameState().highestRarityForged;
                if (highestForged) completed = RARITY_ORDER.indexOf(highestForged) >= RARITY_ORDER.indexOf(quest.target as Rarity);
                break;
            case 'earnGold': completed = this.gameState().totalGoldEarned >= (quest.target as number); break;
            case 'useSkills': completed = this.gameState().totalSkillsUsed >= (quest.target as number); break;
            case 'clickCount': completed = this.gameState().totalClicks >= (quest.target as number); break;
            case 'prestigeCount': completed = this.gameState().totalPrestiges >= (quest.target as number); break;
            case 'unlockHeroCount': completed = this.gameState().unlockedHeroIds.length >= (quest.target as number); break;
            case 'unlockHeroRarity':
                const unlockedHeroes = this.heroes().filter(h => this.gameState().unlockedHeroIds.includes(h.id));
                completed = unlockedHeroes.some(h => h.rarity === (quest.target as Rarity));
                break;
            case 'completeDungeons': completed = this.gameState().totalDungeonsCompleted >= (quest.target as number); break;
            case 'completeExpeditions': completed = this.gameState().totalExpeditionsCompleted >= (quest.target as number); break;
            case 'clearTowerFloor': completed = (this.gameState().towerFloor - 1) >= (quest.target as number); break;
            case 'fieldHeroes': completed = this.gameState().activeHeroIds.filter(id => id !== null).length >= (quest.target as number); break;
            case 'levelUpMultipleHeroes':
                const targetInfo = quest.target as { level: number, count: number };
                completed = this.heroes().filter(h => h.level >= targetInfo.level).length >= targetInfo.count;
                break;
            case 'forgeAnyItem': completed = this.gameState().totalItemsForged >= (quest.target as number); break;
            case 'claimSponsorGold': completed = this.gameState().totalSponsorClaims >= (quest.target as number); break;
        }
        return completed ? { ...quest, isCompleted: true } : quest;
    }));
    this.checkChronicleQuestCompletion();
  }

  private checkChronicleQuestCompletion() {
    this.gameState.update(s => {
        const currentMemories = s.heroMemories;
        if (!currentMemories || Object.keys(currentMemories).length === 0) {
            return s;
        }
    
        let hasChanges = false;
        const newMemories: Record<number, HeroMemory[]> = JSON.parse(JSON.stringify(currentMemories));
    
        for (const heroIdStr in newMemories) {
            const heroId = +heroIdStr;
            newMemories[heroId] = newMemories[heroId].map(memory => {
                if (memory.quest && !memory.quest.isCompleted) {
                    const quest = memory.quest;
                    let progress = quest.progress;
                    let completed = quest.isCompleted;
    
                    switch (quest.questType) {
                        case 'defeatEnemies': progress = s.totalEnemiesDefeated; break;
                        case 'clearTowerFloor': progress = s.towerFloor - 1; break;
                        case 'completeDungeons': progress = s.totalDungeonsCompleted; break;
                        case 'useSkills': progress = s.totalSkillsUsed; break;
                        case 'earnGold': progress = s.totalGoldEarned; break;
                    }
    
                    if (progress >= quest.target) {
                        completed = true;
                    }
    
                    if (completed !== quest.isCompleted || progress !== quest.progress) {
                        hasChanges = true;
                        memory.quest.progress = progress;
                        memory.quest.isCompleted = completed;
                    }
                }
                return memory;
            });
        }
    
        if (hasChanges) {
            return { ...s, heroMemories: newMemories };
        }
        
        return s;
    });
  }

  claimQuestReward(questId: number) {
    const quest = this.quests().find(q => q.id === questId);
    if (quest && quest.isCompleted && !quest.isClaimed) {
        this.addGold(quest.reward.gold);
        if (quest.reward.prestigePoints) {
            this.gameState.update(state => ({ ...state, prestigePoints: state.prestigePoints + (quest.reward.prestigePoints || 0) }));
        }
        this.quests.update(quests => quests.map(q => q.id === questId ? { ...q, isClaimed: true } : q ));
    }
  }

  private createTowerEnemy(floor: number): Enemy {
    const hp = Math.floor(50 * Math.pow(1.4, floor - 1));
    const name = TOWER_ENEMY_NAMES[Math.floor(Math.random() * TOWER_ENEMY_NAMES.length)];
    const goldReward = Math.ceil(hp / 4);
    return { 
      name: `${name} of Floor ${floor}`, 
      maxHp: hp, 
      currentHp: hp, 
      asciiArt: this.generateEnemyAsciiArt('Boss'), 
      goldReward, 
      isBoss: true,
      type: 'Boss'
    };
  }

  startTowerChallenge() {
    if (this.isInTowerCombat()) return;
    const floor = this.gameState().towerFloor;
    const enemy = this.createTowerEnemy(floor);
    this.towerEnemy.set(enemy);
    this.isInTowerCombat.set(true);
  }

  applyTowerDamage(damage: number, type: 'click' | 'dps' | 'skill') {
    if (!this.isInTowerCombat() || !this.towerEnemy()) return;
    this.towerEnemy.update(enemy => {
        if (!enemy) return null;
        return { ...enemy, currentHp: Math.max(0, enemy.currentHp - damage) }
    });
    if (type === 'click' || type === 'skill') {
        this.addDamageFlash(damage, type);
    }
  }

  endTowerChallenge(isVictory: boolean) {
    if (isVictory) {
        const floor = this.gameState().towerFloor;
        const enemy = this.towerEnemy();
        let prestigePointsReward = 0;
        if (floor % 5 === 0) {
            prestigePointsReward = Math.floor(floor / 5);
        }
        let newArtifacts = [...this.gameState().artifacts];
        if (floor === 10 && !newArtifacts.includes(1)) newArtifacts.push(1);
        if (floor === 20 && !newArtifacts.includes(2)) newArtifacts.push(2);
        if (floor === 30 && !newArtifacts.includes(3)) newArtifacts.push(3);
        if (floor === 40 && !newArtifacts.includes(4)) newArtifacts.push(4);
        if (floor === 50 && !newArtifacts.includes(5)) newArtifacts.push(5);

        const goldEarned = enemy?.goldReward || 0;
        this.gameState.update(s => ({
            ...s,
            towerFloor: s.towerFloor + 1,
            gold: s.gold + goldEarned,
            prestigePoints: s.prestigePoints + prestigePointsReward,
            artifacts: newArtifacts,
            totalGoldEarned: s.totalGoldEarned + goldEarned
        }));
        this.checkQuestCompletion();
    }
    this.isInTowerCombat.set(false);
    this.towerEnemy.set(null);
  }
  
  private _createTowerChallenge(type: TowerChallenge['type']): TowerChallenge {
      switch (type) {
          case 'Combat':
              return {
                  type: 'Combat',
                  title: 'Warden\'s Trial',
                  description: 'A powerful guardian stands in your way. Defeat it to proceed.',
                  rewardText: 'Rewards gold and allows you to ascend.',
                  style: { borderColor: 'border-red-500', textColor: 'text-red-400', shadowColor: 'shadow-red-500/30', dividerColor: 'bg-red-500/50', icon: '⚔️' }
              };
          case 'Treasure':
              return {
                  type: 'Treasure',
                  title: 'Forgotten Cache',
                  description: 'An unguarded chest. Seems too good to be true...',
                  rewardText: 'Instantly gain a large amount of gold.',
                  style: { borderColor: 'border-yellow-400', textColor: 'text-yellow-300', shadowColor: 'shadow-yellow-400/30', dividerColor: 'bg-yellow-400/50', icon: '💰' }
              };
          case 'Mystery':
              return {
                  type: 'Mystery',
                  title: 'Enigmatic Altar',
                  description: 'An altar hums with an unknown energy. Its effects are unpredictable.',
                  rewardText: 'The outcome is a surprise.',
                  style: { borderColor: 'border-purple-500', textColor: 'text-purple-400', shadowColor: 'shadow-purple-500/30', dividerColor: 'bg-purple-500/50', icon: '❓' }
              };
      }
  }

  public generateTowerChoices() {
      const choices: TowerChallenge[] = [];
      // Ensure at least one combat, to prevent getting stuck without a way to fight.
      choices.push(this._createTowerChallenge('Combat'));

      for (let i = 0; i < 2; i++) {
          const rand = Math.random();
          let type: TowerChallenge['type'] = rand < 0.5 ? 'Treasure' : 'Mystery';
          choices.push(this._createTowerChallenge(type));
      }

      // Shuffle choices
      for (let i = choices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [choices[i], choices[j]] = [choices[j], choices[i]];
      }
      
      this.gameState.update(s => ({
          ...s,
          towerState: {
              ...s.towerState,
              currentChoices: choices
          }
      }));
  }

  public selectTowerChallenge(challenge: TowerChallenge): TowerChallengeOutcome {
      switch(challenge.type) {
          case 'Combat':
              this.startTowerChallenge();
              return { type: 'combat_start', title: 'Combat Started', description: 'Defeat the guardian!' };
          case 'Treasure':
              const floor = this.gameState().towerFloor;
              const goldReward = Math.floor(50 * Math.pow(1.4, floor - 1) * 5); // 5x a normal enemy of that floor
              this.addGold(goldReward);
              this.gameState.update(s => ({ ...s, towerFloor: s.towerFloor + 1 }));
              // FIX: Property 'formatNumber' does not exist on type 'GameService'.
              return { type: 'reward', title: 'Treasure Found!', description: `You found ${this.formatNumber(goldReward)} gold and advanced to the next floor!` };
          case 'Mystery':
              const rand = Math.random();
              if (rand < 0.45) { // Good outcome: skill recharge
                  this.heroes.update(heroes => heroes.map(h => ({ ...h, skillCharge: 100, skillReady: true })));
                  this.gameState.update(s => ({ ...s, towerFloor: s.towerFloor + 1 }));
                  return { type: 'reward', title: 'Fountain of Vigor!', description: 'All hero skills have been fully charged! You advance to the next floor.' };
              } else if (rand < 0.75) { // Good outcome: prestige points
                  const points = 1 + Math.floor(this.gameState().towerFloor / 10);
                  this.gameState.update(s => ({ ...s, prestigePoints: s.prestigePoints + points, towerFloor: s.towerFloor + 1 }));
                  return { type: 'reward', title: 'Whispering Idol!', description: `The idol grants you ${points} Prestige Point(s)! You advance to the next floor.` };
              } else { // Bad outcome: ambush
                  this.startTowerChallenge();
                  return { type: 'combat_start', title: 'It\'s a trap!', description: 'Monsters ambush you from the shadows!' };
              }
      }
  }

  clearOfflineReport() {
      this.offlineReport.set(null);
  }

  private checkDailyLogin() {
    const today = new Date().toISOString().slice(0, 10);
    const lastLogin = this.gameState().lastLoginDate;

    if (lastLogin !== today) {
        this.isDailyRewardAvailable.set(true);
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        
        this.gameState.update(s => {
            const consecutive = (lastLogin === yesterday) ? (s.consecutiveLoginDays % 7) + 1 : 1;
            return {...s, consecutiveLoginDays: consecutive};
        });
    }
  }

  getDailyRewardForDay(day: number) {
      return DAILY_REWARDS[(day-1) % 7];
  }

  claimDailyReward() {
      const today = new Date().toISOString().slice(0, 10);
      const day = this.gameState().consecutiveLoginDays;
      const reward = this.getDailyRewardForDay(day);

      this.gameState.update(s => ({
          ...s,
          gold: s.gold + reward.gold,
          prestigePoints: s.prestigePoints + reward.prestigePoints,
          lastLoginDate: today
      }));
      this.isDailyRewardAvailable.set(false);
  }

  hardReset() {
      localStorage.removeItem(SAVE_KEY);
      window.location.reload();
  }

  toggleAutoDps() {
    this.gameState.update(s => ({ ...s, autoDpsEnabled: !s.autoDpsEnabled }));
  }

  toggleAutoSkill() {
    this.gameState.update(s => ({ ...s, autoSkillEnabled: !s.autoSkillEnabled }));
  }

  markHeroAsViewedInCodex(heroId: number) {
    this.gameState.update(s => {
      if (!s.viewedHeroIdsInCodex.includes(heroId)) {
        return { ...s, viewedHeroIdsInCodex: [...s.viewedHeroIdsInCodex, heroId] };
      }
      return s;
    });
  }

  markPetAsViewedInCodex(petId: number) {
    this.gameState.update(s => {
      if (!s.viewedPetIdsInCodex.includes(petId)) {
        return { ...s, viewedPetIdsInCodex: [...s.viewedPetIdsInCodex, petId] };
      }
      return s;
    });
  }
  
  markMaterialAsViewedInCodex(materialId: string) {
    this.gameState.update(s => {
      if (!s.viewedMaterialsInCodex.includes(materialId)) {
        return { ...s, viewedMaterialsInCodex: [...s.viewedMaterialsInCodex, materialId] };
      }
      return s;
    });
  }
  
  markMonsterAsViewedInCodex(monsterType: EnemyType) {
    this.gameState.update(s => {
      if (!s.viewedMonsterTypesInCodex.includes(monsterType)) {
        return { ...s, viewedMonsterTypesInCodex: [...s.viewedMonsterTypesInCodex, monsterType] };
      }
      return s;
    });
  }

  getExpeditionSlotsEffect(): number {
    return 1 + this.skillTreeBonuses().expeditionSlots;
  }

  startExpedition(expeditionId: number, heroIds: number[]): boolean {
    const expedition = ALL_EXPEDITIONS.find(e => e.id === expeditionId);
    if (!expedition) return false;

    const availableSlots = this.getExpeditionSlotsEffect();
    if (this.gameState().ongoingExpeditions.length >= availableSlots) return false;

    const now = Date.now();
    const newOngoingExpedition: OngoingExpedition = {
      expeditionId,
      heroIds,
      startTime: now,
      completionTime: now + expedition.durationSeconds * 1000,
    };

    this.gameState.update(s => ({
      ...s,
      ongoingExpeditions: [...s.ongoingExpeditions, newOngoingExpedition]
    }));
    return true;
  }

  claimExpedition(expeditionToClaim: OngoingExpedition): { gold: number, prestige: number, item: EquipmentItem | null } {
    const expeditionDetails = ALL_EXPEDITIONS.find(e => e.id === expeditionToClaim.expeditionId);
    if (!expeditionDetails) return { gold: 0, prestige: 0, item: null };

    const rewards = expeditionDetails.rewards;
    let gainedItem: EquipmentItem | null = null;
    if (rewards.equipmentDrop && Math.random() < rewards.equipmentDrop.chance) {
      gainedItem = this._generateDroppedItem(this.gameState().stage, rewards.equipmentDrop.rarity);
      this.inventory.update(inv => [...inv, gainedItem!]);
    }
    
    this.gameState.update(s => ({
      ...s,
      gold: s.gold + rewards.gold,
      prestigePoints: s.prestigePoints + (rewards.prestigePoints || 0),
      ongoingExpeditions: s.ongoingExpeditions.filter(oe => oe.startTime !== expeditionToClaim.startTime),
      totalExpeditionsCompleted: s.totalExpeditionsCompleted + 1,
    }));
    this.checkQuestCompletion();
    
    return { gold: rewards.gold, prestige: rewards.prestigePoints || 0, item: gainedItem };
  }

  public getBlessingStatus(type: BlessingType): { status: 'ready' | 'active' | 'cooldown', remainingSeconds: number } {
    const now = Date.now();
    const active = this.gameState().activeBlessings.find(b => b.type === type);
    if (active) {
        return { status: 'active', remainingSeconds: Math.ceil((active.endTime - now) / 1000) };
    }
    const cooldown = this.gameState().blessingCooldowns.find(b => b.type === type);
    if (cooldown && cooldown.readyTime > now) {
        return { status: 'cooldown', remainingSeconds: Math.ceil((cooldown.readyTime - now) / 1000) };
    }
    return { status: 'ready', remainingSeconds: 0 };
  }

  public activateBlessing(type: BlessingType) {
      const status = this.getBlessingStatus(type);
      if (status.status !== 'ready') return;

      const blessingInfo = ALL_BLESSINGS.find(b => b.type === type)!;
      const now = Date.now();

      if (blessingInfo.durationSeconds > 0) {
          this.gameState.update(s => ({
              ...s,
              activeBlessings: [...s.activeBlessings, { type, endTime: now + blessingInfo.durationSeconds * 1000 }],
              blessingCooldowns: [...s.blessingCooldowns.filter(c => c.type !== type), { type, readyTime: now + blessingInfo.cooldownSeconds * 1000 }]
          }));
      } else {
          if (type === 'skillFrenzy') {
              this.heroes.update(heroes => heroes.map(h => ({ ...h, skillCharge: 100, skillReady: true })));
          }
          this.gameState.update(s => ({
              ...s,
              blessingCooldowns: [...s.blessingCooldowns.filter(c => c.type !== type), { type, readyTime: now + blessingInfo.cooldownSeconds * 1000 }]
          }));
      }
  }

  public addGold(amount: number) {
    if (amount <= 0) return;
    this.gameState.update(s => ({
        ...s,
        gold: s.gold + amount,
        totalGoldEarned: s.totalGoldEarned + amount,
    }));
    this.checkQuestCompletion();
  }

  public claimTribute(): number {
    const now = Date.now();
    const lastClaim = this.gameState().lastTributeClaimTimestamp ?? 0;
    const cooldown = 24 * 60 * 60 * 1000;
    if (now - lastClaim < cooldown) {
        return 0;
    }

    const reward = this.gameState().stage * 1000;
    this.addGold(reward);
    this.gameState.update(s => ({ ...s, lastTributeClaimTimestamp: now }));
    return reward;
  }

  public setGoldRushCooldown() {
      this.gameState.update(s => ({ ...s, lastGoldRushTimestamp: Date.now() }));
  }

  public investInVault(amount: number): boolean {
      const gold = this.gameState().gold;
      if (amount <= 0 || gold < amount || this.gameState().vaultInvestment) {
          return false;
      }
      const returnTime = Date.now() + (8 * 60 * 60 * 1000);
      this.gameState.update(s => ({
          ...s,
          gold: s.gold - amount,
          vaultInvestment: { amount, returnTime }
      }));
      return true;
  }

  public withdrawFromVault(): number {
      const vault = this.gameState().vaultInvestment;
      if (!vault || vault.returnTime > Date.now()) {
          return 0;
      }
      const interest = 0.5;
      const totalReturn = Math.floor(vault.amount * (1 + interest));
      this.addGold(totalReturn);
      this.gameState.update(s => ({ ...s, vaultInvestment: null }));
      return totalReturn;
  }

  public claimSponsorGold(): number {
      const now = Date.now();
      const lastClaim = this.gameState().lastSponsorOfferTimestamp ?? 0;
      const cooldown = 5 * 60 * 1000;
      if (now - lastClaim < cooldown) {
          return 0;
      }
      
      const stageGoldPerSecond = (this.createEnemy(this.gameState().stage).goldReward * 0.5);
      const offlineGoldPerSecond = stageGoldPerSecond * 0.25;
      const reward = Math.floor(offlineGoldPerSecond * 60);

      this.addGold(reward);
      this.gameState.update(s => ({...s, lastSponsorOfferTimestamp: now, totalSponsorClaims: s.totalSponsorClaims + 1 }));
      this.checkQuestCompletion();
      return reward;
  }
  
  public startMiningOperation(operationId: number): boolean {
    if (this.gameState().activeMiningOperation) {
      return false;
    }
    const operation = ALL_MINING_OPERATIONS.find(op => op.id === operationId);
    if (!operation || this.gameState().stage < operation.stageRequirement) {
      return false;
    }

    const now = Date.now();
    this.gameState.update(s => ({
      ...s,
      activeMiningOperation: {
        operationId: operation.id,
        completionTime: now + operation.durationSeconds * 1000,
      }
    }));
    return true;
  }

  public claimMiningOperation(): number {
    const activeOp = this.gameState().activeMiningOperation;
    if (!activeOp || activeOp.completionTime > Date.now()) {
      return 0;
    }

    const operationDetails = ALL_MINING_OPERATIONS.find(op => op.id === activeOp.operationId);
    if (!operationDetails) {
      this.gameState.update(s => ({ ...s, activeMiningOperation: null }));
      return 0;
    }

    const goldReward = operationDetails.goldReward;
    this.addGold(goldReward);
    this.gameState.update(s => ({ ...s, activeMiningOperation: null }));

    return goldReward;
  }
  
  getDungeonSlotsEffect(): number {
    return 1 + this.skillTreeBonuses().dungeonSlots;
  }

  startDungeonRun(dungeonId: number, difficulty: DungeonDifficulty): boolean {
    const dungeon = ALL_DUNGEONS.find(d => d.id === dungeonId);
    if (!dungeon) return false;
    
    const difficultyDetails = dungeon.difficulties[difficulty];
    if (!difficultyDetails) return false;

    const availableSlots = this.getDungeonSlotsEffect();
    if (this.gameState().activeDungeonRuns.length >= availableSlots) return false;

    if (this.gameState().stage < difficultyDetails.stageRequirement) return false;

    const cost = difficultyDetails.cost?.gold || 0;
    if (this.gameState().gold < cost) return false;
    
    const prestigeCost = difficultyDetails.cost?.prestigePoints || 0;
    if (this.gameState().prestigePoints < prestigeCost) return false;

    const now = Date.now();
    const newDungeonRun: ActiveDungeonRun = {
      dungeonId,
      difficulty,
      startTime: now,
      completionTime: now + difficultyDetails.durationSeconds * 1000,
    };

    this.gameState.update(s => ({
      ...s,
      gold: s.gold - cost,
      prestigePoints: s.prestigePoints - prestigeCost,
      activeDungeonRuns: [...s.activeDungeonRuns, newDungeonRun]
    }));
    return true;
  }

  claimDungeonRun(dungeonToClaim: ActiveDungeonRun): { gold: number, item: EquipmentItem | null, crests: number, petCrystals: number, petEgg: boolean } {
    const dungeonDetails = ALL_DUNGEONS.find(d => d.id === dungeonToClaim.dungeonId);
    if (!dungeonDetails) return { gold: 0, item: null, crests: 0, petCrystals: 0, petEgg: false };

    const difficultyDetails = dungeonDetails.difficulties[dungeonToClaim.difficulty];
    const rewards = difficultyDetails.rewards;
    let gainedItem: EquipmentItem | null = null;
    if (rewards.equipmentDrop && Math.random() < rewards.equipmentDrop.chance) {
      gainedItem = this._generateDroppedItem(this.gameState().stage, rewards.equipmentDrop.rarity);
      this.inventory.update(inv => [...inv, gainedItem!]);
    }
    
    let petEggFound = false;
    if (rewards.petEggDrop && Math.random() < rewards.petEggDrop.chance) {
        petEggFound = true;
        // FIX: Property 'hatchPetEgg' does not exist on type 'GameService'.
        this.hatchPetEgg();
    }
    
    this.addGold(rewards.gold);
    
    this.gameState.update(s => ({
      ...s,
      dungeonCrests: s.dungeonCrests + (rewards.dungeonCrests || 0),
      petCrystals: s.petCrystals + (rewards.petCrystals || 0),
      activeDungeonRuns: s.activeDungeonRuns.filter(dr => dr.startTime !== dungeonToClaim.startTime),
      totalDungeonsCompleted: s.totalDungeonsCompleted + 1,
    }));
    this.checkQuestCompletion();
    
    return { gold: rewards.gold, item: gainedItem, crests: rewards.dungeonCrests || 0, petCrystals: rewards.petCrystals || 0, petEgg: petEggFound };
  }
  
  startDungeonBounty(bountyId: number, heroIds: number[]): boolean {
      const bounty = ALL_DUNGEON_BOUNTIES.find(b => b.id === bountyId);
      if (!bounty || heroIds.length !== bounty.requiredHeroCount) return false;

      const heroesOnBounty = new Set(this.gameState().activeDungeonBounties.flatMap(b => b.heroIds));
      if (heroIds.some(id => heroesOnBounty.has(id))) return false;

      const now = Date.now();
      const newBounty: ActiveDungeonBounty = {
          bountyId,
          heroIds,
          startTime: now,
          completionTime: now + bounty.durationSeconds * 1000,
      };

      this.gameState.update(s => ({
          ...s,
          activeDungeonBounties: [...s.activeDungeonBounties, newBounty]
      }));
      return true;
  }

  claimDungeonBounty(bountyToClaim: ActiveDungeonBounty): { gold: number; crests: number; petCrystals: number; essence: number; } | null {
      const activeBounty = this.gameState().activeDungeonBounties.find(b => b.startTime === bountyToClaim.startTime);
      if (!activeBounty || activeBounty.completionTime > Date.now()) return null;

      const bountyDetails = ALL_DUNGEON_BOUNTIES.find(b => b.id === activeBounty.bountyId);
      if (!bountyDetails) return null;

      const { gold, dungeonCrests, petCrystals, essenceOfLoyalty } = bountyDetails.rewards;

      let essenceGained = 0;
      if (essenceOfLoyalty && Math.random() < essenceOfLoyalty.chance) {
          essenceGained = essenceOfLoyalty.amount;
      }

      this.addGold(gold);
      this.gameState.update(s => ({
          ...s,
          dungeonCrests: s.dungeonCrests + dungeonCrests,
          petCrystals: s.petCrystals + (petCrystals || 0),
          essenceOfLoyalty: s.essenceOfLoyalty + essenceGained,
          activeDungeonBounties: s.activeDungeonBounties.filter(b => b.startTime !== bountyToClaim.startTime),
      }));

      return { gold, crests: dungeonCrests, petCrystals: petCrystals || 0, essence: essenceGained };
  }
  
  purchaseDungeonShopItem(itemId: number): DungeonShopItem | null {
      const item = ALL_DUNGEON_SHOP_ITEMS.find(i => i.id === itemId);
      if (!item || item.isSoldOut(this) || this.gameState().dungeonCrests < item.cost) {
          return null;
      }

      this.gameState.update(s => ({
          ...s,
          dungeonCrests: s.dungeonCrests - item.cost,
      }));

      if (item.purchase(this)) {
          this.gameState.update(s => {
            const newPurchased = {...s.purchasedDungeonShopItems};
            if(item.stock) { // This handles items with stock
                newPurchased[item.id] = (newPurchased[item.id] || 0) + 1;
            }
            return {...s, purchasedDungeonShopItems: newPurchased};
          });
          return item;
      } else {
          this.gameState.update(s => ({ ...s, dungeonCrests: s.dungeonCrests + item.cost }));
          return null;
      }
  }

  public claimMissionReward(missionId: string): MissionReward | null {
    const mission = ALL_MISSIONS.find(m => m.id === missionId);
    if (!mission) return null;

    const state = this.gameState();
    const highestClaimedTier = state.missionProgress[missionId] ?? -1;
    const nextTierIndex = highestClaimedTier + 1;
    const tierToClaim = mission.tiers[nextTierIndex];

    if (!tierToClaim) return null; // All tiers claimed

    // Check if player is eligible to claim
    let progressValue = 0;
    switch (mission.stat) {
      case 'stage': progressValue = state.stage; break;
      case 'totalHeroLevels': progressValue = this.heroes().reduce((sum, h) => sum + h.level, 0); break;
      case 'totalGoldEarned': progressValue = state.totalGoldEarned; break;
      case 'totalPrestiges': progressValue = state.totalPrestiges; break;
    }

    if (progressValue < tierToClaim.target) {
      return null; // Not completed yet
    }
    
    // Apply rewards
    const reward = tierToClaim.reward;
    this.gameState.update(s => {
      const newProgress = { ...s.missionProgress, [missionId]: nextTierIndex };
      return {
        ...s,
        gold: s.gold + (reward.gold || 0),
        totalGoldEarned: s.totalGoldEarned + (reward.gold || 0),
        prestigePoints: s.prestigePoints + (reward.prestigePoints || 0),
        enchantingDust: s.enchantingDust + (reward.enchantingDust || 0),
        skillTomes: s.skillTomes + (reward.skillTomes || 0),
        missionProgress: newProgress,
      };
    });

    this.checkQuestCompletion();
    return reward;
  }

  public getLeaderboardData(): LeaderboardEntry[] {
    const playerStage = this.gameState().stage;
    const entries: LeaderboardEntry[] = [];

    const playerEntry: LeaderboardEntry = {
      rank: 0, name: 'You', stage: playerStage, isPlayer: true,
    };
    entries.push(playerEntry);

    const opponentNames = [ 'ShadowSlayer', 'RiftWalker', 'CrimsonBlade', 'IronTide', 'VoidGazer', 'PhoenixAsh', 'Starcaller', 'GraveLord', 'NightWhisper', 'StormChaser', 'QuantumLeap', 'AbyssalFang', 'SolarFlare', 'FrostHeart', 'StoneGuard' ];

    for (let i = 0; i < 24; i++) {
      let stage: number;
      if (i < 5) {
        stage = playerStage + Math.floor(Math.random() * 20) + 5;
      } else if (i < 15) {
        stage = Math.max(1, playerStage + Math.floor(Math.random() * 20) - 10);
      } else {
        stage = Math.max(1, playerStage - Math.floor(Math.random() * 30) - 1);
      }
      
      const name = opponentNames[i % opponentNames.length];
      entries.push({ rank: 0, name: `${name}${i}`, stage: stage, isPlayer: false, });
    }
    entries.sort((a, b) => b.stage - a.stage);
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    return entries;
  }

  salvageItems(itemIds: number[]): number {
    if (itemIds.length === 0) return 0;
    const itemsToSalvage = this.inventory().filter(i => itemIds.includes(i.id));
    if (itemsToSalvage.length === 0) return 0;
    const getDustValue = (rarity: Rarity): number => {
        switch(rarity) {
            case 'Common': return 1;
            case 'Rare': return 5;
            case 'Epic': return 25;
            case 'Legendary': return 100;
            case 'Mythic': return 500;
            default: return 0;
        }
    };
    const dustGained = itemsToSalvage.reduce((sum, item) => sum + getDustValue(item.rarity), 0);
    if (dustGained > 0) {
        this.gameState.update(s => ({ ...s, enchantingDust: s.enchantingDust + dustGained }));
    }
    this.inventory.update(inv => inv.filter(i => !itemIds.includes(i.id)));
    return dustGained;
  }

  transmuteEnchantingDustForGold(amount: number): number {
    if (amount <= 0 || this.gameState().enchantingDust < amount) {
        return 0;
    }
    const goldGained = amount * 500;
    // FIX: Type '{}' is missing the following properties from type 'GameState'
    this.gameState.update(s => ({
        ...s,
        enchantingDust: s.enchantingDust - amount,
    }));
    this.addGold(goldGained);
    return goldGained;
  }
  
  // FIX: Implement all missing methods
  public getGuildBonuses(level: number): { dpsPercent: number; goldDropPercent: number } {
    return {
        dpsPercent: (level - 1) * 0.01, // 1% per level
        goldDropPercent: (level - 1) * 0.01, // 1% per level
    };
  }

  private applyRiftDamage(damage: number, type: 'click' | 'dps' | 'skill') {
    const enemy = this.currentRiftEnemy();
    if (!enemy || enemy.currentHp <= 0) return;

    let finalDamage = damage;
    if (enemy.damageReduction) {
        finalDamage *= (1 - enemy.damageReduction);
    }
    if (enemy.anomalies.some(a => a.id === 'hardened')) {
        finalDamage *= 0.75; // 25% extra reduction
    }
    if (type === 'skill' && enemy.anomalies.some(a => a.id === 'dampening')) {
        finalDamage *= 0.5; // 50% skill reduction
    }

    this.currentRiftEnemy.update(e => e ? { ...e, currentHp: Math.max(0, e.currentHp - finalDamage) } : null);
    this.addDamageFlash(finalDamage, type);

    if (this.currentRiftEnemy()!.currentHp <= 0) {
        this.gameState.update(s => ({
            ...s,
            riftLevel: s.riftLevel + 1,
            highestRiftLevel: Math.max(s.highestRiftLevel, s.riftLevel + 1),
            riftShards: s.riftShards + s.riftLevel,
        }));
        this.currentRiftEnemy.set(this.createRiftEnemy(this.gameState().riftLevel));
    }
  }

  public getEssenceGenerationRate(): number {
    const farmState = this.gameState().heroFarm;
    if (!farmState) return 0;
    const assignedHeroes = this.heroes().filter(h => farmState.assignedHeroIds.includes(h.id));
    const totalLevel = assignedHeroes.reduce((sum, h) => sum + h.level, 0);
    return totalLevel * 0.5; // 0.5 per level per hour
  }

  public getLoyaltyEssenceGenerationRate(): number {
    const farmState = this.gameState().heroFarm;
    if (!farmState) return 0;
    const assignedHeroes = this.heroes().filter(h => farmState.assignedHeroIds.includes(h.id));
    const totalLevel = assignedHeroes.reduce((sum, h) => sum + h.level, 0);
    return totalLevel * 0.1; // 0.1 per level per hour
  }

  public getSpecializationById(id: string): Specialization | undefined {
    return ALL_SPECIALIZATIONS[id];
  }
  
  public formatNumber(num: number): string {
    if (num < 1000) {
      return num.toFixed(0);
    }
    const suffixes = ["", "k", "M", "B", "T"];
    const i = Math.floor(Math.log10(num) / 3);
    const shortNum = (num / Math.pow(1000, i)).toFixed(1);
    return shortNum.replace(/\.0$/, '') + suffixes[i];
  }

  private hatchPetEgg(): void {
    const ownedPetIds = new Set(this.gameState().pets.map(p => p.petId));
    const unownedPets = ALL_PETS.filter(p => !ownedPetIds.has(p.id));

    if (unownedPets.length > 0) {
        const newPet = unownedPets[Math.floor(Math.random() * unownedPets.length)];
        const newPlayerPet: PlayerPet = { petId: newPet.id, level: 1, isEquipped: false, ascensionLevel: 0 };
        this.gameState.update(s => ({...s, pets: [...s.pets, newPlayerPet]}));
    } else {
        // All pets owned, give crystals instead
        this.gameState.update(s => ({...s, petCrystals: s.petCrystals + 25}));
    }
  }

  public getFusionCost(hero: Hero): { shards: number; gold: number } {
    const baseShardCost = 10;
    const baseGoldCost = 1000;
    const rarityMultiplier: Record<Rarity, number> = { 'Common': 1, 'Rare': 1.5, 'Epic': 2, 'Legendary': 3, 'Mythic': 5 };

    const shards = Math.floor(baseShardCost * Math.pow(1.5, hero.ascensionLevel) * rarityMultiplier[hero.rarity]);
    const gold = Math.floor(baseGoldCost * Math.pow(2, hero.ascensionLevel) * rarityMultiplier[hero.rarity]);

    return { shards, gold };
  }

  public calculateCost(hero: Hero, levels: number): number {
      let totalCost = 0;
      const costReduction = 1 - this.skillTreeBonuses().upgradeCostReduction;
      for (let i = 0; i < levels; i++) {
          totalCost += Math.floor(hero.baseCost * Math.pow(hero.upgradeCostMultiplier, hero.level + i) * costReduction);
      }
      return totalCost;
  }

  public calculateMaxLevels(hero: Hero, currentGold: number): { levels: number; cost: number } {
      let levels = 0;
      let totalCost = 0;
      let nextCost = hero.nextLevelCost;
      const costReduction = 1 - this.skillTreeBonuses().upgradeCostReduction;

      while (totalCost + nextCost <= currentGold) {
          totalCost += nextCost;
          levels++;
          nextCost = Math.floor(hero.baseCost * Math.pow(hero.upgradeCostMultiplier, hero.level + levels) * costReduction);
      }
      return { levels, cost: totalCost };
  }

  public swapActiveHero(heroId: number, slotIndex: number): void {
    this.gameState.update(s => {
        const newActiveIds = [...s.activeHeroIds];
        const currentHeroIdInSlot = newActiveIds[slotIndex];

        // Find if the new hero is already active somewhere else
        const oldIndexOfNewHero = newActiveIds.indexOf(heroId);

        if (oldIndexOfNewHero > -1) {
            // Swap positions
            newActiveIds[oldIndexOfNewHero] = currentHeroIdInSlot;
        }
        
        newActiveIds[slotIndex] = heroId;
        return { ...s, activeHeroIds: newActiveIds };
    });
  }

  public claimChronicleQuestReward(heroId: number, memoryId: string, questId: string): void {
    this.gameState.update(s => {
        const newMemories = { ...s.heroMemories };
        if (!newMemories[heroId]) return s;

        const memory = newMemories[heroId].find(m => m.id === memoryId);
        if (memory && memory.quest && memory.quest.id === questId && memory.quest.isCompleted && !memory.quest.isClaimed) {
            const reward = memory.quest.reward;
            const newShards = { ...s.heroShards };
            newShards[reward.heroId] = (newShards[reward.heroId] || 0) + reward.amount;
            
            memory.quest.isClaimed = true;
            return { ...s, heroMemories: newMemories, heroShards: newShards };
        }
        return s;
    });
  }

  public async requestStrategicAnalysis(): Promise<string> {
    const gold = this.gameState().gold;
    if (gold < 100000) {
      return "Not enough gold. Strategic analysis requires 100,000 gold.";
    }
    this.gameState.update(s => ({ ...s, gold: s.gold - 100000 }));

    const payload: StrategicAnalysisPayload = {
      stage: this.gameState().stage,
      gold: this.gameState().gold,
      prestigePoints: this.gameState().prestigePoints,
      totalDps: this.totalDps(),
      activeTeam: this.activeHeroes().map(h => ({ name: h.name, level: h.level, role: h.role, dps: h.currentDps })),
      prestigeUpgrades: [], // This feature was removed, sending empty array
    };
    return this.chronicleService.getStrategicAnalysis(payload);
  }

  public enterRift(): void {
    if (this.isInRiftCombat()) return;
    this.currentRiftEnemy.set(this.createRiftEnemy(this.gameState().riftLevel));
    this.isInRiftCombat.set(true);
  }

  public removeHeroFromActiveSlot(slotIndex: number): void {
      this.gameState.update(s => {
          const newActiveIds = [...s.activeHeroIds];
          newActiveIds[slotIndex] = null;
          return { ...s, activeHeroIds: newActiveIds };
      });
  }

  public loadTeamFromPreset(index: number): void {
      this.gameState.update(s => {
          const preset = s.teamPresets[index];
          if (preset) {
              return { ...s, activeHeroIds: [...preset.heroIds] };
          }
          return s;
      });
  }

  public saveActiveTeamToPreset(index: number): void {
      this.gameState.update(s => {
          const newPresets = [...s.teamPresets];
          newPresets[index] = { ...newPresets[index], heroIds: [...s.activeHeroIds] };
          return { ...s, teamPresets: newPresets };
      });
  }

  public updatePresetName(index: number, newName: string): void {
      this.gameState.update(s => {
          const newPresets = [...s.teamPresets];
          newPresets[index] = { ...newPresets[index], name: newName };
          return { ...s, teamPresets: newPresets };
      });
  }

  public fuseHero(heroId: number): boolean {
    const hero = this.heroes().find(h => h.id === heroId);
    if (!hero) return false;

    const cost = this.getFusionCost(hero);
    const state = this.gameState();

    if (state.gold < cost.gold || (state.heroShards[heroId] || 0) < cost.shards) {
        return false;
    }

    this.gameState.update(s => {
        const newShards = { ...s.heroShards };
        newShards[heroId] -= cost.shards;
        return {
            ...s,
            gold: s.gold - cost.gold,
            heroShards: newShards
        };
    });

    this.heroes.update(heroes => heroes.map(h => {
        if (h.id === heroId) {
            const newHero = { ...h, ascensionLevel: h.ascensionLevel + 1 };
            return this.calculateHeroStats(newHero);
        }
        return h;
    }));
    return true;
  }

  public getSpecializationPathForHero(heroId: number): SpecializationPath | null {
      const hero = ALL_HEROES.find(h => h.id === heroId);
      if (!hero) return null;
      return ALL_SPECIALIZATION_PATHS[hero.baseClass] || null;
  }

  public async promoteHero(heroId: number, specializationId: string): Promise<void> {
    this.gameState.update(s => {
        const newSpecs = { ...s.heroSpecializations };
        const currentSpecs = newSpecs[heroId] || [];
        newSpecs[heroId] = [...currentSpecs, specializationId];
        return { ...s, heroSpecializations: newSpecs };
    });

    this.heroes.update(heroes => heroes.map(h => h.id === heroId ? this.calculateHeroStats(h) : h));
  }

  public equipPet(petId: number): void {
      this.gameState.update(s => ({
          ...s,
          pets: s.pets.map(p => ({...p, isEquipped: p.petId === petId }))
      }));
  }

  public levelUpPet(petId: number): void {
      this.gameState.update(s => {
          const pet = s.pets.find(p => p.petId === petId);
          if (!pet) return s;
          const cost = 10 * pet.level * (pet.ascensionLevel + 1);
          if (s.petCrystals < cost) return s;

          return {
              ...s,
              petCrystals: s.petCrystals - cost,
              pets: s.pets.map(p => p.petId === petId ? {...p, level: p.level + 1} : p)
          };
      });
  }

  public ascendPet(petId: number): boolean {
    let success = false;
    this.gameState.update(s => {
        const pet = s.pets.find(p => p.petId === petId);
        const details = ALL_PETS.find(p => p.id === petId);
        if (!pet || !details || !details.evolutionCostEssence) {
            success = false;
            return s;
        }

        const ascensionCost = (details.evolutionCostEssence || 0) * (pet.ascensionLevel + 1);
        if (pet.level < 25 || s.essenceOfLoyalty < ascensionCost) {
            success = false;
            return s;
        }

        success = true;
        return {
            ...s,
            essenceOfLoyalty: s.essenceOfLoyalty - ascensionCost,
            pets: s.pets.map(p => p.petId === petId ? {...p, ascensionLevel: p.ascensionLevel + 1} : p)
        };
    });
    return success;
  }

  public getEnchantCost(item: EquipmentItem): { dust: number, gold: number } {
    const rarityMultiplier: Record<Rarity, number> = { 'Common': 1, 'Rare': 2, 'Epic': 4, 'Legendary': 8, 'Mythic': 16 };
    const dust = Math.floor(10 * Math.pow(1.5, item.enchantLevel) * rarityMultiplier[item.rarity]);
    const gold = Math.floor(100 * Math.pow(2, item.enchantLevel) * rarityMultiplier[item.rarity]);
    return { dust, gold };
  }

  public enchantItem(itemId: number): boolean {
    const item = this.inventory().find(i => i.id === itemId);
    if (!item) return false;

    const cost = this.getEnchantCost(item);
    if (this.gameState().enchantingDust < cost.dust || this.gameState().gold < cost.gold) {
      return false;
    }

    this.gameState.update(s => ({
      ...s,
      enchantingDust: s.enchantingDust - cost.dust,
      gold: s.gold - cost.gold
    }));

    const updateItem = (i: EquipmentItem) => {
      const newEnchantLevel = i.enchantLevel + 1;
      return {
        ...i,
        enchantLevel: newEnchantLevel,
        bonusValue: i.baseBonusValue * (1 + newEnchantLevel * 0.10)
      };
    };

    this.inventory.update(inv => inv.map(i => i.id === itemId ? updateItem(i) : i));
    this.heroes.update(heroes => heroes.map(h => {
        let updated = false;
        const newEquipment: Record<EquipmentSlot, EquipmentItem | null> = {...h.equipment};
        for(const slot in h.equipment) {
            const eq = h.equipment[slot as EquipmentSlot];
            if (eq?.id === itemId) {
                newEquipment[slot as EquipmentSlot] = updateItem(eq);
                updated = true;
            }
        }
        return updated ? this.calculateHeroStats({...h, equipment: newEquipment}) : h;
    }));
    
    return true;
  }

  public async weaveMemory(heroId: number, prompt: string): Promise<boolean> {
    const hero = this.heroes().find(h => h.id === heroId);
    if (!hero || this.gameState().prestigePoints < 5) return false;

    this.gameState.update(s => ({ ...s, prestigePoints: s.prestigePoints - 5 }));
    const memoryText = await this.chronicleService.generateMemory(hero, prompt);
    if (memoryText.includes("Unable to recall")) {
      this.gameState.update(s => ({ ...s, prestigePoints: s.prestigePoints + 5 }));
      return false;
    }

    const newMemory: HeroMemory = { id: `mem_${Date.now()}`, prompt, text: memoryText, timestamp: Date.now() };
    this.gameState.update(s => {
      const newMemories = { ...s.heroMemories };
      newMemories[heroId] = [...(newMemories[heroId] || []), newMemory];
      return { ...s, heroMemories: newMemories };
    });
    return true;
  }
  
  public async forgeDestiny(heroId: number, memoryId: string): Promise<boolean> {
    const hero = this.heroes().find(h => h.id === heroId);
    const memory = this.gameState().heroMemories[heroId]?.find(m => m.id === memoryId);
    if (!hero || !memory || memory.quest || this.gameState().gold < 50000) return false;

    this.gameState.update(s => ({ ...s, gold: s.gold - 50000 }));
    const questData = await this.chronicleService.generateQuest(hero, memory.text);
    if (!questData) {
      this.gameState.update(s => ({ ...s, gold: s.gold + 50000 }));
      return false;
    }
    
    const newQuest: ChronicleQuest = {
        ...questData,
        id: `quest_${Date.now()}`,
        isCompleted: false,
        isClaimed: false,
        progress: 0,
        reward: { type: 'heroShards', heroId, amount: 5 }
    };

    this.gameState.update(s => {
      const newMemories = { ...s.heroMemories };
      const memToUpdate = newMemories[heroId].find(m => m.id === memoryId);
      if (memToUpdate) {
        memToUpdate.quest = newQuest;
      }
      return { ...s, heroMemories: newMemories };
    });
    this.checkChronicleQuestCompletion();
    return true;
  }
  
  public getHeroSkillUpgradeCost(hero: Hero): { tomes: number } {
    return { tomes: Math.floor(1 * Math.pow(1.5, hero.skillLevel - 1)) };
  }
  
  public upgradeHeroSkill(heroId: number): boolean {
    const hero = this.heroes().find(h => h.id === heroId);
    if (!hero) return false;

    const cost = this.getHeroSkillUpgradeCost(hero);
    if (this.gameState().skillTomes < cost.tomes) return false;

    this.gameState.update(s => ({ ...s, skillTomes: s.skillTomes - cost.tomes }));
    this.heroes.update(heroes => heroes.map(h =>
        h.id === heroId ? this.calculateHeroStats({ ...h, skillLevel: h.skillLevel + 1 }) : h
    ));
    return true;
  }

  public unlockSkillTreeNode(nodeId: string): void {
      const node = SKILL_TREE_DATA.find(n => n.id === nodeId);
      if (!node || this.gameState().prestigePoints < node.cost) return;

      this.gameState.update(s => ({
          ...s,
          prestigePoints: s.prestigePoints - node.cost,
          unlockedSkillTreeNodes: [...s.unlockedSkillTreeNodes, nodeId]
      }));
  }

  public getShardCost(rarity: Rarity): number {
    const costs: Record<Rarity, number> = { 'Common': 10, 'Rare': 25, 'Epic': 50, 'Legendary': 100, 'Mythic': 250 };
    return costs[rarity];
  }

  public assignHeroToFarm(heroId: number, slotIndex: number): void {
      this.gameState.update(s => {
          const newAssignments = [...s.heroFarm.assignedHeroIds];
          newAssignments[slotIndex] = heroId;
          return { ...s, heroFarm: { ...s.heroFarm, assignedHeroIds: newAssignments }};
      });
  }

  public removeHeroFromFarm(slotIndex: number): void {
      this.gameState.update(s => {
          const newAssignments = [...s.heroFarm.assignedHeroIds];
          newAssignments[slotIndex] = null;
          return { ...s, heroFarm: { ...s.heroFarm, assignedHeroIds: newAssignments }};
      });
  }
  
  public collectFarmResources(): { heroEssence: number; loyaltyEssence: number } {
      const collected = {
          heroEssence: this.gameState().heroFarm.accumulatedEssence,
          loyaltyEssence: this.gameState().heroFarm.accumulatedEssenceOfLoyalty
      };

      if (collected.heroEssence > 0 || collected.loyaltyEssence > 0) {
          this.gameState.update(s => ({
              ...s,
              heroEssence: s.heroEssence + collected.heroEssence,
              essenceOfLoyalty: s.essenceOfLoyalty + collected.loyaltyEssence,
              heroFarm: {
                  ...s.heroFarm,
                  accumulatedEssence: 0,
                  accumulatedEssenceOfLoyalty: 0,
                  lastCollectionTimestamp: Date.now()
              }
          }));
      }
      return collected;
  }

  public purchaseHeroShards(heroId: number, amount: number): void {
      const hero = this.heroes().find(h => h.id === heroId);
      if (!hero || amount <= 0) return;

      const costPerShard = this.getShardCost(hero.rarity);
      const totalCost = costPerShard * amount;

      if (this.gameState().heroEssence < totalCost) return;

      this.gameState.update(s => {
          const newShards = { ...s.heroShards };
          newShards[heroId] = (newShards[heroId] || 0) + amount;
          return {
              ...s,
              heroEssence: s.heroEssence - totalCost,
              heroShards: newShards,
          };
      });
  }

  public addMaterial(materialId: string, quantity: number): void {
      this.gameState.update(s => {
          const newMaterials = {...s.materials};
          newMaterials[materialId] = (newMaterials[materialId] || 0) + quantity;
          return { ...s, materials: newMaterials };
      });
  }

  public getFusionRecipe(soul1Id: string, soul2Id: string): string | null {
    const combination = new Set([soul1Id, soul2Id]);
    if (combination.has('soul_fire') && combination.has('soul_earth')) return 'magma_soul';
    if (combination.has('soul_water') && combination.has('soul_air')) return 'storm_soul';
    if (combination.has('soul_fire') && combination.has('soul_air')) return 'lightning_soul';
    if (combination.has('soul_water') && combination.has('soul_earth')) return 'geode_soul';
    return null;
  }

  public fuseSouls(soul1Id: string, soul2Id: string): { success: boolean; result: Material | null } {
      const resultId = this.getFusionRecipe(soul1Id, soul2Id);
      if (!resultId) return { success: false, result: null };

      const state = this.gameState();
      const hasEnough = soul1Id === soul2Id
          ? (state.materials[soul1Id] || 0) >= 2
          : (state.materials[soul1Id] || 0) >= 1 && (state.materials[soul2Id] || 0) >= 1;
      
      if (!hasEnough) return { success: false, result: null };

      this.gameState.update(s => {
          const newMaterials = { ...s.materials };
          newMaterials[soul1Id] -= 1;
          newMaterials[soul2Id] -= 1;
          newMaterials[resultId!] = (newMaterials[resultId!] || 0) + 1;
          const newUnlocked = s.unlockedHybridSouls.includes(resultId!) ? s.unlockedHybridSouls : [...s.unlockedHybridSouls, resultId!];
          return { ...s, materials: newMaterials, unlockedHybridSouls: newUnlocked };
      });

      return { success: true, result: ALL_MATERIALS.find(m => m.id === resultId)! };
  }

  public craftNecroConstruct(constructId: string): boolean {
    const recipe = ALL_NECRO_RECIPES.find(r => r.constructId === constructId);
    if (!recipe) return false;

    const currentMaterials = this.gameState().materials;
    for (const matId in recipe.materials) {
        if ((currentMaterials[matId] || 0) < recipe.materials[matId]) {
            return false;
        }
    }

    this.gameState.update(s => {
        const newMaterials = { ...s.materials };
        for (const matId in recipe.materials) {
            newMaterials[matId] -= recipe.materials[matId];
        }
        const newConstructs = { ...s.necroConstructs };
        newConstructs[constructId] = (newConstructs[constructId] || 0) + 1;
        return { ...s, materials: newMaterials, necroConstructs: newConstructs };
    });
    return true;
  }

  public leaveRift(): void {
    this.isInRiftCombat.set(false);
    this.currentRiftEnemy.set(null);
  }

  public getGuildExpToNextLevel(level: number): number {
    return Math.floor(1000 * Math.pow(1.5, level - 1));
  }

  public createGuild(name: string): void {
      this.gameState.update(s => {
          if (s.guild || s.gold < 1_000_000) return s;
          return {
              ...s,
              gold: s.gold - 1_000_000,
              guild: { id: `guild_${Date.now()}`, name, level: 1, exp: 0, members: [{ name: 'You', stage: s.stage, title: 'Guild Master' }] }
          };
      });
  }

  public joinGuild(id: string, name: string): void {
      this.gameState.update(s => {
          if (s.guild) return s;
          const members = Array.from({ length: Math.floor(Math.random() * 10) + 5 }, (_, i) => ({ name: `Member${i}`, stage: Math.floor(Math.random() * s.stage) + 10, title: 'Member' as 'Member' }));
          return { ...s, guild: { id, name, level: 12, exp: 500, members: [...members, { name: 'You', stage: s.stage, title: 'Member' }] }};
      });
  }

  public leaveGuild(): void {
      this.gameState.update(s => ({ ...s, guild: null }));
  }

  public donateToGuild(amount: number): void {
      this.gameState.update(s => {
          if (!s.guild || s.gold < amount) return s;
          const expGained = Math.floor(amount / 100);
          return {
              ...s,
              gold: s.gold - amount,
              totalGoldDonated: s.totalGoldDonated + amount,
              guild: { ...s.guild, exp: s.guild.exp + expGained }
          };
      });
  }

}
