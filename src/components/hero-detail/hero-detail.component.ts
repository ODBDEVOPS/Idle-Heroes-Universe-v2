import { Component, ChangeDetectionStrategy, input, signal, computed, effect, output, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { View } from '../../app.component';
import { GameService } from '../../services/game.service';
import { Hero, Role } from '../../models/hero.model';
import { EquipmentSlot, EquipmentItem, Rarity, ALL_EQUIPMENT_SETS } from '../../models/equipment.model';
import { TooltipDirective } from '../../directives/tooltip.directive';
import { Specialization, SpecializationPath } from '../../models/specialization.model';

interface DisplayHero extends Hero {
  shardCount: number;
  requiredShards: number;
  canAscend: boolean;
}

interface SpecializationNode {
  spec: Specialization;
  status: 'unlocked' | 'available' | 'locked';
  requirements: string[];
}


@Component({
  selector: 'app-hero-detail',
  standalone: true,
  templateUrl: './hero-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TooltipDirective, FormsModule],
})
export class HeroDetailComponent implements OnDestroy, OnInit {
  viewChange = output<View>();
  gameService = input.required<GameService>();

  heroId = signal<number | null>(null);

  // Modals
  isEquipModalOpen = signal(false);
  levelUpNotice = signal<{ heroId: number, levelsGained: number } | null>(null);

  // View state
  internalView = signal<'stats' | 'specialization' | 'lore'>('stats');
  selectedSlot = signal<EquipmentSlot | null>(null);
  isPlacementMode = signal(false);
  isPromoting = signal(false);


  // --- Computed Signals ---
  heroData = computed<DisplayHero | null>(() => {
    const id = this.heroId();
    if (!id) return null;
    
    const hero = this.gameService().heroes().find(h => h.id === id);
    if (!hero) return null;

    const cost = this.gameService().getFusionCost(hero);
    const shardCount = this.gameService().gameState().heroShards[hero.id] || 0;
    const canAscend = shardCount >= cost.shards && this.gameService().gameState().gold >= cost.gold;

    return {
        ...hero,
        shardCount,
        requiredShards: cost.shards,
        canAscend,
    };
  });

  activeTeamHeroes = computed(() => {
    const activeIds = this.gameService().gameState().activeHeroIds;
    const allHeroes = this.gameService().heroes();
    return activeIds.map(id => allHeroes.find(h => h.id === id) || null);
  });

  activeHeroIdSet = computed(() => new Set(this.gameService().gameState().activeHeroIds));

  availableItemsForSlot = computed(() => {
    const slot = this.selectedSlot();
    if (!slot) return [];
    return this.gameService().inventory().filter(item => item.slot === slot);
  });

  activeSetBonuses = computed(() => {
    const hero = this.heroData();
    if (!hero) return [];

    const setCounts: { [setName: string]: number } = {};
    for (const slot in hero.equipment) {
      const item = hero.equipment[slot as EquipmentSlot];
      if (item && item.set) {
        setCounts[item.set] = (setCounts[item.set] || 0) + 1;
      }
    }

    const activeBonuses: { setName: string, description: string }[] = [];

    for (const setId in setCounts) {
      const setInfo = ALL_EQUIPMENT_SETS.find(s => s.id === setId);
      if (setInfo) {
        const count = setCounts[setId];
        setInfo.bonuses.forEach(bonus => {
          if (count >= bonus.threshold) {
            activeBonuses.push({ setName: setInfo.name, description: bonus.description });
          }
        });
      }
    }
    return activeBonuses;
  });

  // --- Specialization Computed Signals ---
  path = computed<SpecializationPath | null>(() => {
    const h = this.heroData();
    if (!h) return null;
    return this.gameService().getSpecializationPathForHero(h.id);
  });
  
  heroSpecPath = computed(() => {
    const h = this.heroData();
    if (!h) return [];
    return this.gameService().gameState().heroSpecializations[h.id] || [];
  });

  promotion1Nodes = computed<SpecializationNode[]>(() => this.getPromotionNodes(1));
  promotion2Nodes = computed<SpecializationNode[]>(() => this.getPromotionNodes(2));
  
  private getPromotionNodes(tier: 1 | 2): SpecializationNode[] {
    const h = this.heroData();
    const p = this.path();
    if (!h || !p) return [];

    const currentPath = this.heroSpecPath();
    const nodes: SpecializationNode[] = [];
    const essence = this.gameService().gameState().essenceOfLoyalty;

    if (tier === 1) {
      const promotionInfo = p.promotion1;
      for (const specId of promotionInfo.options) {
        const spec = this.gameService().getSpecializationById(specId);
        if (spec) {
          const isUnlocked = currentPath.includes(specId);
          const canAfford = essence >= promotionInfo.cost;
          const meetsLevelReq = h.level >= promotionInfo.levelReq;
          const isAvailable = !isUnlocked && currentPath.length === 0 && meetsLevelReq && canAfford;
          const isLocked = !isUnlocked && !isAvailable;
          
          const requirements = [];
          if(isLocked) {
            if (!meetsLevelReq) requirements.push(`Lvl ${promotionInfo.levelReq}`);
            if (!canAfford) requirements.push(`🌟 ${promotionInfo.cost}`);
          }

          nodes.push({ spec, status: isUnlocked ? 'unlocked' : (isAvailable ? 'available' : 'locked'), requirements });
        }
      }
    } else if (tier === 2 && currentPath.length > 0) {
      const promotionInfo = p.promotion2;
      const promo1Id = currentPath[0];
      const options = promotionInfo.options[promo1Id] || [];
      
      for (const specId of options) {
        const spec = this.gameService().getSpecializationById(specId);
        if (spec) {
          const isUnlocked = currentPath.includes(specId);
          const canAfford = essence >= promotionInfo.cost;
          const meetsLevelReq = h.level >= promotionInfo.levelReq;
          const isAvailable = !isUnlocked && currentPath.length === 1 && meetsLevelReq && canAfford;
          const isLocked = !isUnlocked && !isAvailable;

          const requirements = [];
          if(isLocked) {
            if (!meetsLevelReq) requirements.push(`Lvl ${promotionInfo.levelReq}`);
            if (!canAfford) requirements.push(`🌟 ${promotionInfo.cost}`);
          }

          nodes.push({ spec, status: isUnlocked ? 'unlocked' : (isAvailable ? 'available' : 'locked'), requirements });
        }
      }
    }
    return nodes;
  }

  constructor() {
    effect(() => {
      const heroIdFromService = this.gameService().heroToViewInTeam();
      if (typeof heroIdFromService === 'number') {
        this.heroId.set(heroIdFromService);
      }
    });
  }
  
  ngOnInit() {
    if (this.heroId() === null) {
      const firstHero = this.gameService().heroes()[0];
      if (firstHero) {
        this.heroId.set(firstHero.id);
      }
    }
  }

  ngOnDestroy() {
    this.gameService().heroToViewInTeam.set(undefined);
  }

  back() {
    this.viewChange.emit('team');
  }

  async promote(specializationId: string) {
    const h = this.heroData();
    if (!h || this.isPromoting()) return;

    this.isPromoting.set(true);
    await this.gameService().promoteHero(h.id, specializationId);
    this.isPromoting.set(false);
  }

  // --- Team Management ---
  enterPlacementMode() {
    const hero = this.heroData();
    if (!hero || this.activeHeroIdSet().has(hero.id)) return;
    this.isPlacementMode.set(true);
  }

  cancelPlacementMode() {
    this.isPlacementMode.set(false);
  }

  placeHeroInSlot(slotIndex: number) {
    const heroId = this.heroId();
    if (!this.isPlacementMode() || !heroId) return;
    this.gameService().swapActiveHero(heroId, slotIndex);
    this.isPlacementMode.set(false);
  }

  removeHeroFromTeam() {
    const heroId = this.heroId();
    if (!heroId || !this.activeHeroIdSet().has(heroId)) return;
    const activeIds = this.gameService().gameState().activeHeroIds;
    const slotIndex = activeIds.indexOf(heroId);
    if (slotIndex > -1) {
        this.gameService().removeHeroFromActiveSlot(slotIndex);
    }
  }

  goToFusion(heroId: number) {
    this.gameService().heroToViewInTeam.set(heroId);
    this.viewChange.emit('fusion');
  }
  
  goToSpecialization(heroId: number) {
    this.gameService().heroToViewInTeam.set(heroId);
    this.viewChange.emit('heroSpecialization');
  }

  // --- Hero Actions & Modals ---
  levelUp(heroId: number) { this.gameService().levelUpHero(heroId); }
  levelUpMultiple(heroId: number, levels: number) { this.gameService().levelUpHeroMultiple(heroId, levels); }

  levelUpMax(heroId: number) {
    const hero = this.gameService().heroes().find(h => h.id === heroId);
    const gold = this.gameService().gameState().gold;
    if (!hero) return;
    const { levels } = this.calculateMaxLevels(hero, gold);
    if (levels > 0) this.gameService().levelUpHeroMultiple(heroId, levels);
  }

  autoEquip(heroId: number) { this.gameService().autoEquipBestGear(heroId); }

  calculateCost(hero: Hero, levels: number): number {
    return this.gameService().calculateCost(hero, levels);
  }

  calculateMaxLevels(hero: Hero, currentGold: number): { levels: number, cost: number } {
    return this.gameService().calculateMaxLevels(hero, currentGold);
  }

  claimXp(heroId: number, event: MouseEvent) {
    event.stopPropagation();
    const levelsGained = this.gameService().claimOfflineXp(heroId);
    if (levelsGained > 0) {
        this.levelUpNotice.set({ heroId, levelsGained });
        setTimeout(() => this.levelUpNotice.set(null), 2000);
    }
  }
  
  toggleFavorite(heroId: number, event: MouseEvent) {
    event.stopPropagation();
    this.gameService().toggleHeroFavorite(heroId);
  }

  openEquipModal(slot: EquipmentSlot) {
    this.selectedSlot.set(slot);
    this.isEquipModalOpen.set(true);
  }

  closeEquipModal() {
    this.isEquipModalOpen.set(false);
    this.selectedSlot.set(null);
  }

  onEquipItem(itemId: number) {
    const heroId = this.heroData()?.id;
    if (heroId) this.gameService().equipItem(heroId, itemId);
    this.closeEquipModal();
  }

  onUnequipItem() {
    const heroId = this.heroData()?.id;
    const slot = this.selectedSlot();
    if (heroId && slot) this.gameService().unequipItem(heroId, slot);
    this.closeEquipModal();
  }
  
  getEquipmentTooltip(item: EquipmentItem | null): string {
      if (!item) return 'Empty Slot';
      let tooltip = `<strong>${item.name}</strong> (${item.rarity})`;
      if (item.enchantLevel > 0) {
          tooltip += ` <span style="color: #facc15;">+${item.enchantLevel}</span>`;
      }
      tooltip += `<br>${this.formatBonus(item)}`;

      if (item.set) {
        const setInfo = ALL_EQUIPMENT_SETS.find(s => s.id === item.set);
        if (setInfo) {
          tooltip += `<br><br><span style="color: #6ee7b7;">${setInfo.name}</span>`;
          const hero = this.heroData();
          let equippedCount = 0;
          if (hero) {
            for (const slot in hero.equipment) {
              const equippedItem = hero.equipment[slot as EquipmentSlot];
              if (equippedItem && equippedItem.set === item.set) {
                equippedCount++;
              }
            }
          }

          setInfo.bonuses.forEach(bonus => {
            const color = equippedCount >= bonus.threshold ? '#6ee7b7' : '#6b7280';
            tooltip += `<br><span style="color: ${color}">(${bonus.threshold}) ${bonus.description}</span>`;
          });
        }
      }
      
      if(item.lore) {
        tooltip += `<br><br><em style="color: #9ca3af;">"${item.lore}"</em>`;
      }
      return tooltip;
  }
  
  formatBonus(item: EquipmentItem): string { 
      switch(item.bonusType){ 
          case 'dpsFlat': return `+${this.formatNumber(item.bonusValue)} DPS`; 
          case 'dpsPercent': return `+${(item.bonusValue * 100).toFixed(0)}% DPS`; 
          case 'goldDropPercent': return `+${(item.bonusValue * 100).toFixed(0)}% Gold`; 
          case 'clickDamageFlat': return `+${this.formatNumber(item.bonusValue)} Click DMG`; 
          default: return ''; 
      }
  }

  formatNumber(num: number): string { 
    if(num<1e3)return num.toFixed(0); 
    const s=["","k","M","B","T"],i=Math.floor(Math.log10(num)/3); 
    const sn=(num/Math.pow(1000,i)).toFixed(1); 
    return sn.replace(/\.0$/,'')+s[i]; 
  }

  getRarityHeaderBgClass(rarity: Rarity): string {
    switch (rarity) {
        case 'Mythic': return 'bg-gradient-to-br from-red-600 to-gray-900';
        case 'Legendary': return 'bg-gradient-to-br from-yellow-600 to-gray-900';
        case 'Epic': return 'bg-gradient-to-br from-purple-600 to-gray-900';
        case 'Rare': return 'bg-gradient-to-br from-blue-600 to-gray-900';
        default: return 'bg-gradient-to-br from-gray-600 to-gray-900';
    }
  }

  getRarityShadowClass(rarity: Rarity): string {
      switch (rarity) {
          case 'Mythic': return 'shadow-red-500/50';
          case 'Legendary': return 'shadow-yellow-400/50';
          case 'Epic': return 'shadow-purple-500/50';
          case 'Rare': return 'shadow-blue-500/50';
          default: return 'shadow-gray-500/50';
      }
  }

  getSlotIcon(slot: EquipmentSlot): string {
    switch (slot) {
        case 'Weapon': return 'M12 1.75L4.75 6.25V13.25C4.75 19.25 12 22.25 12 22.25C12 22.25 19.25 19.25 19.25 13.25V6.25L12 1.75Z M10 13L12 11L14 13 M12 11V17';
        case 'Armor': return 'M9 20V12L5 12V8C5 5.79086 6.79086 4 9 4H15C17.2091 4 19 5.79086 19 8V12L15 12V20H9Z';
        case 'Accessory': return 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z';
        default: return '';
    }
  }

  getRarityPillClass(rarity: Rarity): string {
    switch(rarity){ 
        case 'Mythic': return 'bg-red-500/20 text-red-400'; 
        case 'Legendary': return 'bg-yellow-500/20 text-yellow-400'; 
        case 'Epic': return 'bg-purple-500/20 text-purple-400'; 
        case 'Rare': return 'bg-blue-500/20 text-blue-400'; 
        default: return 'bg-gray-500/20 text-gray-300'; 
    }
  }

  getRarityBorderClass(rarity: Rarity): string { 
    switch(rarity){ 
        case 'Mythic': return 'border-red-500'; 
        case 'Legendary': return 'border-yellow-400'; 
        case 'Epic': return 'border-purple-500'; 
        case 'Rare': return 'border-blue-500'; 
        default: return 'border-gray-600'; 
    }
  }

  getRarityBgClass(rarity: Rarity): string {
    switch(rarity){
      case 'Mythic': return 'bg-red-900/30';
      case 'Legendary': return 'bg-yellow-700/20';
      case 'Epic': return 'bg-purple-800/30';
      case 'Rare': return 'bg-blue-800/30';
      default: return 'bg-gray-800/50';
    }
  }

  getRarityTextColor(rarity: Rarity): string { 
    switch(rarity){ 
        case 'Mythic': return 'text-red-500'; 
        case 'Legendary': return 'text-yellow-400'; 
        case 'Epic': return 'text-purple-500'; 
        case 'Rare': return 'text-blue-400'; 
        default: return 'text-gray-400'; 
    }
  }

  getHeroInitials(name: string): string {
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`;
    }
    return name.substring(0, 2).toUpperCase();
  }
}
