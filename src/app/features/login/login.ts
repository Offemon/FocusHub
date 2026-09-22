import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Banner } from '../../shared/components/banner/banner';
import { Severity, SeverityType } from '../../core/models/Severity';
import { Variant } from '../../core/models/Variant';
import { AuthService, LoginCommand } from '../../core/services/auth';
import { UserSession } from '../../core/models/auth.model';
import { exhaustMap, Subject, takeUntil, tap } from 'rxjs';

export interface AuthResponse {
  userId: string;
  email: string;
  token: string;
}
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, Banner],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  public isLoading = signal<boolean>(false);
  public errorMessage = signal<string>('');
  public errorSeverity = signal<SeverityType>(`${Severity.Info}`);

  protected readonly submitLogin$ = new Subject<void>();
  private readonly destroy$ = new Subject<void>();
  public loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  public ngOnInit() {
    this.submitLogin$
      .pipe(
        tap(() => {
          if (this.loginForm.invalid) {
            this.errorSeverity.set(Severity.Error);
            this.errorMessage.set('Invalid email or password');
            throw new Error('Form validation tripped');
          }
          this.isLoading.set(true);
          this.errorMessage.set('');
        }),
        exhaustMap(() => {
          const credentials: LoginCommand = this.loginForm.getRawValue();
          return this.authService.LogIn(credentials);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: async (response) => {
          if (response.isSuccess && response.payload) {
            const userSessionState: UserSession = {
              token: response.payload.token,
              userId: response.payload.userId,
              email: response.payload.email,
              authTimestamp: new Date().getTime(),
            };
            this.authService.CacheSession(userSessionState);
            this.isLoading.set(false);
            await this.router.navigate(['/']);
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorSeverity.set(Severity.Error);
          this.errorMessage.set(err);
        },
      });
  }
  public ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // public onAuthenticate(): void {
  //   if (this.loginForm.invalid) {
  //     this.errorSeverity.set(Severity.Error);
  //     this.errorMessage.set('Invalid email or password');
  //     return;
  //   }
  //   this.isLoading.set(true);
  //   this.errorMessage.set('');
  //   this.errorSeverity.set(Severity.Info);
  //   const formPayload: LoginCommand = this.loginForm.getRawValue();
  //
  //   this.authService.LogIn(formPayload).subscribe({
  //     next: async (response) => {
  //       if (response.isSuccess && response.payload) {
  //         const userSessionState: UserSession = {
  //           token: response.payload.token,
  //           userId: response.payload.userId,
  //           email: response.payload.email,
  //           authTimestamp: new Date().getTime(),
  //         };
  //         this.authService.CacheSession(userSessionState);
  //         this.isLoading.set(false);
  //         await this.router.navigate(['/']);
  //       }
  //     },
  //     error: (err) => {
  //       this.isLoading.set(false);
  //       this.errorSeverity.set(Severity.Error);
  //       this.errorMessage.set(err);
  //     },
  //   });
  // }

  protected readonly Variant = Variant;
}
