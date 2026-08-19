import { Component, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import { Banner } from '../../shared/components/banner/banner';
import { Severity, SeverityType } from '../../core/models/Severity';
import { Variant } from '../../core/models/Variant';
import {AuthService} from "../../core/services/auth";

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
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  public isLoading = signal<boolean>(false);
  public errorMessage = signal<string>('');
  public errorSeverity = signal<SeverityType>(`${Severity.Info}`);

  public loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  public onAuthenticate(): void {
    if (this.loginForm.invalid) {
      this.errorSeverity.set(Severity.Error);
      this.errorMessage.set('Invalid email or password');
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.errorSeverity.set(Severity.Info);
    const payload = this.loginForm.getRawValue();

    this.http.post<AuthResponse>('/auth/login', payload).subscribe({
      next: (response) => {
        const userSessionState = {
          token: response.token,
          userId: response.userId,
          email: response.email,
          authTimestamp: new Date().getTime(),
        };
        // localStorage.setItem('focushub_session', JSON.stringify(userSessionState));
        this.authService.cacheSession(userSessionState);
        this.isLoading.set(false);
        this.router.navigate(['/']);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        if (err.status === 400 || err.status === 500) {
          const serverDetail = err.error?.detail;
          const validationErrors = err.error?.errors;

          if (validationErrors) {
            const firstErrorKey = Object.keys(validationErrors)[0];
            this.errorSeverity.set(Severity.Error);
            this.errorMessage.set(`${validationErrors[firstErrorKey]}`);
          } else if (serverDetail) {
            this.errorSeverity.set(Severity.Error);
            this.errorMessage.set(serverDetail);
          } else {
            this.errorSeverity.set(Severity.Error);
            this.errorMessage.set(err.error?.title || 'An unexpected server operation failed.');
          }
        } else {
          this.errorSeverity.set(Severity.Fatal);
          this.errorMessage.set('Critical gateway infrastructure timeout. Server offline.');
        }
      },
    });
  }

  protected readonly Variant = Variant;
}
