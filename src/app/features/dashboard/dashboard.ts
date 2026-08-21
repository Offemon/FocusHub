import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SnackbarComponent } from '../../shared/components/snackbar.component/snackbar.component';
import { SnackbarService } from '../../core/services/snackbar';
import { IconBtn } from '../../shared/components/icon-btn/icon-btn';
import { GoogleIcons } from '../../core/models/google.material.icons';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, RouterLinkActive, RouterLink, SnackbarComponent, IconBtn],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly snackBarService = inject(SnackbarService);
  public currentYear = new Date().getFullYear();

  public purgeUserSession = (): void => {
    this.authService.logout();
    this.router.navigate(['/login']);
  };

  public handleSnackBar() {
    this.snackBarService.showSuccess('Snackbar success!');
  }

  protected readonly GoogleIcons = GoogleIcons;
}
