import { Component, ChangeDetectionStrategy, signal, computed, effect, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CombatComponent } from './app/components/combat/combat.component';
import { TeamComponent } from './app/components/team/team.component';
import { GameService } from './app/services/game.service';
import { QuestsComponent } from './app/components/quests/quests.component';
import { ForgeComponent } from './app/components/forge/forge.component';
import { SummonComponent } from './app/components/summon/summon.component';
import { TowerComponent } from './app/components/tower/tower.component';
import { ArtifactsComponent } from './app/components/artifacts/artifacts.component';
import { CodexComponent } from './app/components/codex/codex.component';
import { SettingsComponent } from './app/components/settings/settings.component';
import { InventoryComponent } from './app/components/inventory/inventory.component';
import { ExpeditionsComponent } from './app/components/expeditions/expeditions.component';
import { CelestialShrineComponent } from './app/components/celestial-shrine/celestial-shrine.component';
import { SynergiesComponent } from './app/components/synergies/synergies.component';
import { AlchemyLabComponent } from './app/components/alchemy-lab/alchemy-lab.component';
import { HeroUnlockComponent } from './app/components/hero-unlock/hero-unlock.component';
import { TooltipDirective } from './app/directives/tooltip.directive';
import { BaseComponent } from './app/components/base/base.component';
import { TeamHubComponent } from './app/components/team-hub/team-hub.component';
import { FusionComponent } from './app/components/fusion/fusion.component';
import { HeroDetailComponent } from './app/components/hero-detail/hero-detail.component';
import { ReliquesComponent } from './app/components/reliques/reliques.component';
import { DungeonsComponent } from './app/components/dungeons/dungeons.component';
import { LeaderboardComponent } from './app/components/leaderboard/leaderboard.component';
import { PetsComponent } from './app/components/pets/pets.component';
import { HeroCommandComponent } from './app/components/hero-command/hero-command.component';
import { EnchantComponent } from './app/components/enchant/enchant.component';
import { ChronicleComponent } from './app/components/chronicle/chronicle.component';
import { SkillTrainingComponent } from './app/components/skill-training/skill-training.component';
import { SkillTreeComponent } from './app/components/skill-tree/skill-tree.component';
import { HeroFarmComponent } from './app/components/hero-farm/hero-farm.component';
import { IngenierieComponent } from './app/components/ingenierie/ingenierie.component';
import { AlchimieComponent } from './app/components/alchimie/alchimie.component';
import { CoutureComponent } from './app/components/couture/couture.component';
import { TravailDuCuirComponent } from './app/components/travail-du-cuir/travail-du-cuir.component';
import { CuisineComponent } from './app/components/cuisine/cuisine.component';
import { PecheComponent } from './app/components/peche/peche.component';
import { DepecageComponent } from './app/components/depecage/depecage.component';
import { HerboristerieComponent } from './app/components/herboristerie/herboristerie.component';
import { MinageComponent } from './app/components/minage/minage.component';
import { HeroSpecializationComponent } from './app/components/hero-specialization/hero-specialization.component';
import { ProfessionsComponent } from './app/components/professions/professions.component';
import { SoulAlchemyComponent } from './app/components/soul-alchemy/soul-alchemy.component';
import { NecroArtisanatComponent } from './app/components/necro-artisanat/necro-artisanat.component';
import { MissionsComponent } from './app/components/missions/missions.component';
import { BijoutierComponent } from './app/components/bijoutier/bijoutier.component';
import { BrewmasterComponent } from './app/components/brewmaster/brewmaster.component';
import { ArtisanArmesComponent } from './app/components/artisan-armes/artisan-armes.component';
import { ArtisanArmuresComponent } from './app/components/artisan-armures/artisan-armures.component';
import { CalligrapheComponent } from './app/components/calligraphe/calligraphe.component';
import { SculpteurComponent } from './app/components/sculpteur/sculpteur.component';
import { ArchitecteComponent } from './app/components/architecte/architecte.component';
import { CartographeComponent } from './app/components/cartographe/cartographe.component';
import { BucheronComponent } from './app/components/bucheron/bucheron.component';
import { DimensionalRiftComponent } from './app/components/dimensional-rift/dimensional-rift.component';
import { GuildHubComponent } from './app/components/guild-hub/guild-hub.component';
import { GuildComponent } from './app/components/guild/guild.component';
import { AuctionHouseComponent } from './app/components/auction-house/auction-house.component';
import { UpgradesComponent } from './app/components/upgrades/upgrades.component';
import { HeadquartersComponent } from './app/components/headquarters/headquarters.component';
import { InventoryHubComponent } from './app/components/inventory-hub/inventory-hub.component';

export type View = 'quests' | 'settings' | 
             'combat' | 'forge' | 'tower' | 'expeditions' | 'celestialShrine' | 'alchemyLab' | 'enchant' | 'chronicle' | 'skillTraining' | 'heroFarm' | 'soulAlchemy' | 'missions' | 'dimensionalRift' |
             'team' | 'summon' | 'codex' | 'synergies' |
             'inventory' | 'skillTree' | 'artifacts' | 'heroUnlock' |
             'base' | 'teamHub' | 'fusion' | 'heroDetail' | 'reliques' | 'dungeons' | 'leaderboard' | 'pets' | 'heroCommand' | 'professions' |
             'ingenierie' | 'alchimie' | 'couture' | 'travailDuCuir' | 'cuisine' | 'peche' | 'depecage' | 'herboristerie' | 'minage' | 'heroSpecialization' | 'necroArtisanat' |
             'bijoutier' | 'brewmaster' | 'artisanArmes' | 'artisanArmures' | 'calligraphe' | 'sculpteur' | 'architecte' | 'cartographe' | 'bucheron' |
             'guildHub' | 'guild' | 'auctionHouse' |
             'upgrades' | 'headquarters' | 'inventoryHub';

@Component({
  selector: 'app-root',
  templateUrl: './app/app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CombatComponent, TeamComponent, QuestsComponent, ForgeComponent, SummonComponent, TowerComponent, ArtifactsComponent, CodexComponent, SettingsComponent, InventoryComponent, ExpeditionsComponent, CelestialShrineComponent, SynergiesComponent, AlchemyLabComponent, HeroUnlockComponent, TooltipDirective, BaseComponent, TeamHubComponent, FusionComponent, HeroDetailComponent, ReliquesComponent, DungeonsComponent, LeaderboardComponent, PetsComponent, HeroCommandComponent, EnchantComponent, ChronicleComponent, SkillTrainingComponent, SkillTreeComponent, HeroFarmComponent, IngenierieComponent, AlchimieComponent, CoutureComponent, TravailDuCuirComponent, CuisineComponent, PecheComponent, DepecageComponent, HerboristerieComponent, MinageComponent, HeroSpecializationComponent, ProfessionsComponent, SoulAlchemyComponent, NecroArtisanatComponent, MissionsComponent, BijoutierComponent, BrewmasterComponent, ArtisanArmesComponent, ArtisanArmuresComponent, CalligrapheComponent, SculpteurComponent, ArchitecteComponent, CartographeComponent, BucheronComponent, DimensionalRiftComponent, GuildHubComponent, GuildComponent, AuctionHouseComponent, UpgradesComponent, HeadquartersComponent, InventoryHubComponent],
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(window:beforeunload)': 'saveGameOnExit($event)',
  }
})
export class AppComponent {
  activeView = signal<View>('combat');
  heroToUnlockId = signal<number | null>(null);
  gameService = new GameService();
  
  showOfflineReport = signal(false);
  showDailyLogin = signal(false);
  
  openDropdown = signal<string | null>(null);
  private elementRef = inject(ElementRef);

  dailyReward = computed(() => {
    const day = this.gameService.gameState().consecutiveLoginDays;
    return this.gameService.getDailyRewardForDay(day);
  });
  
  constructor() {
    this.gameService.startGameLoop();
    
    setTimeout(() => {
        if (this.gameService.offlineReport()) {
            this.showOfflineReport.set(true);
        } else if (this.gameService.isDailyRewardAvailable()) {
            this.showDailyLogin.set(true);
        }
    }, 500);
  }

  toggleDropdown(dropdown: string) {
    this.openDropdown.update(current => (current === dropdown ? null : dropdown));
  }
  
  onDocumentClick(event: MouseEvent) {
    const navContainer = this.elementRef.nativeElement.querySelector('.nav-container');
    if (navContainer && !navContainer.contains(event.target as Node)) {
      this.openDropdown.set(null);
    }
  }

  changeView(view: View) {
    this.activeView.set(view);
    this.openDropdown.set(null);
  }

  handleNewHeroUnlock(heroId: number) {
    this.heroToUnlockId.set(heroId);
    this.changeView('heroUnlock');
  }

  saveGameOnExit(event: any) {
    this.gameService.saveGame();
  }
  
  claimOfflineReport() {
    this.gameService.clearOfflineReport();
    this.showOfflineReport.set(false);
    if (this.gameService.isDailyRewardAvailable()) {
        this.showDailyLogin.set(true);
    }
  }

  claimDailyReward() {
      this.gameService.claimDailyReward();
      this.showDailyLogin.set(false);
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
}
