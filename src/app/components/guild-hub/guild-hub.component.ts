import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { View } from '../../app.component';

@Component({
  selector: 'app-guild-hub',
  standalone: true,
  templateUrl: './guild-hub.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class GuildHubComponent {
  viewChange = output<View>();

  navigateTo(view: View) {
    this.viewChange.emit(view);
  }
}
