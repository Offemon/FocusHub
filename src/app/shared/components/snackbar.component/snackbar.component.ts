import { Component, inject } from '@angular/core';
import { SnackbarService } from '../../../core/services/snackbar';
import { SnackBarState } from '../../../core/models/system.snackbar.design';
import { GoogleIcons } from '../../../core/models/google.material.icons';
import { IconBtn } from '../icon-btn/icon-btn';

@Component({
  selector: 'app-snackbar',
  imports: [IconBtn],
  templateUrl: './snackbar.component.html',
  styleUrl: './snackbar.component.css',
})
export class SnackbarComponent {
  protected readonly snackService = inject(SnackbarService);

  protected readonly SnackBarState = SnackBarState;
  protected readonly GoogleIcons = GoogleIcons;
}
