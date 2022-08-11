import { Component } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { AudioManagerService } from '../../services/audio/audio-manager.service';

@Component({
  selector: 'wgl-gain-control',
  templateUrl: './gain-control.component.html',
  styleUrls: ['./gain-control.component.scss'],
})
export class GainControlComponent {
  constructor(public audioManager: AudioManagerService) {}

  Muted: boolean = false;
  // private _currentVolume: number = this.audioManager.Volume;

  volumeChanged(event: MatSliderChange): void {
    this.Muted = false;
    // this.audioManager.Volume = event.value || 0.0;
  }

  toggleMute(): void {
    this.Muted = !this.Muted;
    if (this.Muted) {
      // this._currentVolume = this.audioManager.Volume;
      // this.audioManager.Volume = 0.0;
    } else {
      // this.audioManager.Volume = this._currentVolume;
    }
  }
}
