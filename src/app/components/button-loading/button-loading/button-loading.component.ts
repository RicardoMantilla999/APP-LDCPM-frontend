import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-button-loading',
  template: `
    <button [disabled]="isLoading">
      <ng-container *ngIf="!isLoading; else loading">
        {{ text }}
      </ng-container>
      <ng-template #loading>
        <img src="src/assets/img/theme/balon.png" alt="Cargando..." class="spinner-icon">
      </ng-template>
    </button>
  `,
  styleUrls: ['./button-loading.component.scss']
})
export class ButtonLoadingComponent {
  @Input() text: string = 'Guardar';
  @Input() isLoading: boolean = false;
}
