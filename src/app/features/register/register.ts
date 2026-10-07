import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Severity, SeverityType } from '../../core/models/Severity';
import { toSignal } from '@angular/core/rxjs-interop';
import { Banner } from '../../shared/components/banner/banner';
import { Variant } from '../../core/models/Variant';
import { exhaustMap, filter, Subject, Subscription, take, takeUntil, tap, timer } from 'rxjs';
import { AuthService } from '../../core/services/auth';
import { AuthCommand } from '../../core/models/auth.model';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  return password && confirmPassword && password.value === confirmPassword.value
  ? null:{passwordMismatch : true};
};
@Component({
  selector: 'app-register',
  imports: [NgOptimizedImage, ReactiveFormsModule, Banner],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit, OnDestroy {
  public registerImagePath: string = 'assets/images/deep_focus.jpeg';

  private readonly fb = inject(FormBuilder);
  // private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  public isLoading = signal<boolean>(false);
  public errorMessage = signal<string>('');
  public errorSeverity = signal<SeverityType>(`${Severity.Info}`);

  protected submitForm$ = new Subject<void>();
  private destroy$ = new Subject<void>();
  protected timerSubscription: Subscription | null = null;

  public ngOnInit() {
    this.submitForm$.pipe(
        tap(() => {
          this.errorMessage.set("");
          this.isLoading.set(false);
        }),
        filter(() => {
          if(this.registrationForm.invalid){
            this.errorSeverity.set(Severity.Error);
            this.errorMessage.set("Please fulfill all security criteria before submitting the form.");
            return false;
          }
          this.isLoading.set(true);
          return true;
        }),
        exhaustMap(() => {
          const formData: AuthCommand = {
            email: this.registrationForm.getRawValue().email.trim(),
            password: this.registrationForm.getRawValue().password.trim(),
          };
          return this.authService.Register(formData);
        }),
        takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.errorSeverity.set(Severity.Success);
        this.errorMessage.set('Registration successful! Redirecting to login page.');
        this.timerSubscription = timer(3000)
          .pipe(
            take(1),
            takeUntil(this.destroy$)
          )
          .subscribe({
            next: async () => {
              await this.router.navigate(['/login']);
            },
          });
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorSeverity.set(Severity.Error);
        this.errorMessage.set(
          `Critical authentication gateway timeout. Server infrastructure offline: ${error}`,
        );
      }
    });
  }
  public registrationForm = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: [passwordMatchValidator] },
  );
  private passwordValue = toSignal(this.registrationForm.controls.password.valueChanges, {
    initialValue: '',
  });
  private confirmPasswordValue = toSignal(
    this.registrationForm.controls.confirmPassword.valueChanges,
    { initialValue: '' },
  );

  protected hasMinlength = computed(() => this.passwordValue().length >= 8);
  protected hasUppercase = computed(() => /[A-Z]/.test(this.passwordValue()));
  protected hasLowercase = computed(() => /[a-zz]/.test(this.passwordValue()));
  protected hasNumber = computed(() => /[0-9]/.test(this.passwordValue()));
  protected hasSpecial = computed(() => /[@$!%*#?&]/.test(this.passwordValue()));
  protected isConfirmPasswordMatched = computed(
    () =>
      this.passwordValue() === this.confirmPasswordValue() &&
      this.passwordValue().length >= 8 &&
      this.passwordValue().length >= 8,
  );

  protected isPasswordSecure = computed(
    () =>
      this.hasMinlength() &&
      this.hasUppercase() &&
      this.hasLowercase() &&
      this.hasNumber() &&
      this.hasSpecial() &&
      this.isConfirmPasswordMatched(),
  );
  public ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected readonly Variant = Variant;
}
