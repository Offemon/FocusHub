import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, RouterLinkActive, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  public currentYear = new Date().getFullYear();

  public purgeUserSession = (): void => {
    this.authService.logout();
    this.router.navigate(['/login'])
  };
}
