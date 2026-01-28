import { Component, ChangeDetectionStrategy, input, computed, signal, effect, OnDestroy, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
// FIX: The Rarity type was moved to equipment.model.ts to break a circular dependency.
import { Rarity } from '../../models/equipment.model';
import { TooltipDirective } from '../../directives/tooltip.directive';
import { EnemyType } from '../../models/enemy.model';

interface Particle {
  id: number;
  left: string;
  top: string;
  size: string;
  backgroundColor: string;
  animationDelay: string;
  tx: string;
  ty: string;
}

@Component({
  selector: 'app-combat',
  templateUrl: './combat.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TooltipDirective],
})
export class CombatComponent implements OnDestroy {
  gameService = input.required<GameService>();

  particles = signal<Particle[]>([]);
  activatingSkillHeroId = signal<number | null>(null);
  healthBarHit = signal(false);
  dpsChanged = signal(false);
  enemyIsCharging = signal(false);
  enemyIsAttacking = signal(false);
  
  private enemyAttackInterval: any;

  enemyHpPercentage = computed(() => {
    const enemy = this.gameService().currentEnemy();
    if (!enemy || enemy.maxHp === 0) return 0;
    return (enemy.currentHp / enemy.maxHp) * 100;
  });

  delayedEnemyHpPercentage = signal(100);
  private hpUpdateTimeout: any;

  constructor() {
    // Effect to create particles on normal damage
    effect(() => {
        const flashes = this.gameService().damageFlashes();
        if(flashes.length > 0) {
            const lastFlash = flashes[flashes.length-1];
            switch(lastFlash.type) {
                case 'click':
                    this.createParticles(5, 'click');
                    break;
                case 'dps':
                     this.createParticles(2, 'dps');
                    break;
            }
        }
    }, { allowSignalWrites: true });

    // Effect for skill particles
    effect(() => {
      const skill = this.gameService().lastSkillUsed();
      if (skill) {
        const particleCount: Record<Rarity, number> = {
          'Common': 20,
          'Rare': 30,
          'Epic': 45,
          'Legendary': 60,
          'Mythic': 80
        };
        this.createParticles(particleCount[skill.rarity], 'skill', skill.rarity);
      }
    }, { allowSignalWrites: true });

    // Effect to handle the delayed health bar
    effect(() => {
        const currentPercentage = this.enemyHpPercentage();
        
        if (untracked(this.delayedEnemyHpPercentage) > currentPercentage) {
             if (this.hpUpdateTimeout) clearTimeout(this.hpUpdateTimeout);
             this.hpUpdateTimeout = setTimeout(() => {
                this.delayedEnemyHpPercentage.set(currentPercentage);
            }, 300);
        } else {
             if (this.hpUpdateTimeout) clearTimeout(this.hpUpdateTimeout);
             this.delayedEnemyHpPercentage.set(currentPercentage);
        }
    }, { allowSignalWrites: true });

     // Effect for health bar hit flash
    effect(() => {
        if (this.gameService().damageFlashes().length > 0) {
            if (!untracked(this.healthBarHit)) {
                this.healthBarHit.set(true);
                setTimeout(() => this.healthBarHit.set(false), 200);
            }
        }
    }, { allowSignalWrites: true });
    
    // Effect for DPS change pulse
    effect((onCleanup) => {
        const previousDps = untracked(() => this.gameService().totalDps());
        const currentDps = this.gameService().totalDps();

        if (currentDps !== previousDps && previousDps !== 0) {
            this.dpsChanged.set(true);
            const timeoutId = setTimeout(() => this.dpsChanged.set(false), 500);
            onCleanup(() => clearTimeout(timeoutId));
        }
    }, { allowSignalWrites: true });
  }

  // FIX: Added missing createParticles method to generate damage and skill effects.
  private createParticles(count: number, type: 'click' | 'dps' | 'skill', rarity: Rarity = 'Common'): void {
    const newParticles: Particle[] = [];

    const rarityColors: Record<Rarity, string> = {
        'Common': '#cbd5e1',    // slate-300
        'Rare': '#60a5fa',      // blue-400
        'Epic': '#a78bfa',      // violet-400
        'Legendary': '#facc15', // yellow-400
        'Mythic': '#f87171',    // red-400
    };

    for (let i = 0; i < count; i++) {
      const size = type === 'skill' ? Math.random() * 6 + 4 : Math.random() * 3 + 1;
      const angle = Math.random() * 2 * Math.PI;
      const distance = type === 'skill' ? Math.random() * 80 + 40 : Math.random() * 40 + 20;

      let color = '#ffffff';
      if (type === 'dps') color = '#f59e0b'; // amber-500
      if (type === 'skill') color = rarityColors[rarity];

      newParticles.push({
        id: Math.random(),
        left: '50%',
        top: '50%',
        size: `${size}px`,
        backgroundColor: color,
        animationDelay: `${Math.random() * 0.2}s`,
        tx: `${Math.cos(angle) * distance}px`,
        ty: `${Math.sin(angle) * distance}px`,
      });
    }

    this.particles.update(p => [...p, ...newParticles]);
    setTimeout(() => {
        const particleIds = new Set(newParticles.map(p => p.id));
        this.particles.update(p => p.filter(particle => !particleIds.has(particle.id)));
    }, 1000);
  }

  // FIX: Added missing ngOnDestroy to implement OnDestroy interface and clear timers.
  ngOnDestroy() {
    if (this.enemyAttackInterval) {
      clearInterval(this.enemyAttackInterval);
    }
    if (this.hpUpdateTimeout) {
      clearTimeout(this.hpUpdateTimeout);
    }
  }

  onEnemyClick() {
    this.gameService().playerClick();
  }

  activateSkill(heroId: number) {
    this.gameService().activateHeroSkill(heroId);
    this.activatingSkillHeroId.set(heroId);
    setTimeout(() => this.activatingSkillHeroId.set(null), 300);
  }
  
  toggleAutoDps() {
    this.gameService().toggleAutoDps();
  }

  toggleAutoSkill() {
    this.gameService().toggleAutoSkill();
  }

  formatNumber(num: number): string {
    if (num < 1000) {
      return num.toFixed(0);
    }
    const suffixes = ["", "k", "M", "B", "T"];
    const i = Math.floor(Math.log10(num) / 3);
    const shortNum = (num / Math.pow(1000, i)).toFixed(1);
    return shortNum.replace(/\.0$/, '') + suffixes[i];
  }

  getRarityBorderClass(rarity: Rarity | undefined): string {
    const map: Record<Rarity, string> = { 'Mythic': 'border-red-500', 'Legendary': 'border-yellow-400', 'Epic': 'border-purple-500', 'Rare': 'border-blue-500', 'Common': 'border-gray-500' };
    return rarity ? map[rarity] : map['Common'];
  }
  
  getRarityBgClass(rarity: Rarity): string {
    switch (rarity) {
        case 'Mythic': return 'bg-gradient-to-br from-red-700 to-gray-800';
        case 'Legendary': return 'bg-gradient-to-br from-yellow-600 to-gray-800';
        case 'Epic': return 'bg-gradient-to-br from-purple-700 to-gray-800';
        case 'Rare': return 'bg-gradient-to-br from-blue-700 to-gray-800';
        default: return 'bg-gradient-to-br from-gray-600 to-gray-800';
    }
  }

  getSkillSlashClass(rarity: Rarity): string {
    const slashClasses: Record<Rarity, string> = {
        'Mythic': 'via-red-400/80',
        'Legendary': 'via-yellow-300/80',
        'Epic': 'via-purple-400/80',
        'Rare': 'via-blue-400/80',
        'Common': 'via-gray-300/80',
    };
    return slashClasses[rarity] || slashClasses['Common'];
  }

  getEnemyNameColor(type: EnemyType): string {
    switch (type) {
      case 'Boss': return 'text-red-400';
      case 'Hoarder': return 'text-yellow-400';
      case 'Armored': return 'text-gray-400';
      case 'Swift': return 'text-cyan-400';
      case 'Caster': return 'text-purple-400';
      default: return 'text-gray-200';
    }
  }

  getEnemyTypeBadgeClass(type: EnemyType): string {
    switch (type) {
        case 'Hoarder': return 'border-yellow-400/50 text-yellow-300';
        case 'Armored': return 'border-gray-400/50 text-gray-300';
        case 'Swift': return 'border-cyan-400/50 text-cyan-300';
        case 'Caster': return 'border-purple-400/50 text-purple-300';
        case 'Squad': return 'border-orange-400/50 text-orange-300';
        default: return 'border-gray-500/50 text-gray-400';
    }
  }

  getEnemyTypeTooltip(type: EnemyType): string {
    switch (type) {
        case 'Hoarder': return 'Drops a large amount of gold but is very tough.';
        case 'Armored': return 'Has high damage reduction, taking less damage from all sources.';
        case 'Swift': return 'Low health and rewards, but is defeated very quickly.';
        case 'Caster': return 'A magical foe that may drop rare reagents.';
        case 'Squad': return 'A group of enemies with higher health and rewards.';
        case 'Minerals': return 'A sturdy foe that often drops ores and stones.';
        case 'Flora': return 'Aggressive plant life that may drop rare herbs.';
        case 'Fauna': return 'Wild beasts that are a source for leathers and hides.';
        case 'Aquatic': return 'Creatures of the water, may drop rare fish.';
        default: return 'A standard enemy.';
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
}
