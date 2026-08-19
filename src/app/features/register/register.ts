import { Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import {AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Severity, SeverityType } from '../../core/models/Severity';
import { toSignal } from '@angular/core/rxjs-interop';
import {Banner} from '../../shared/components/banner/banner';
import {Variant} from '../../core/models/Variant';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  return password && confirmPassword && password.value === confirmPassword.value
  ? null:{passwordMismatch : true}
}
@Component({
  selector: 'app-register',
  imports: [NgOptimizedImage, ReactiveFormsModule, Banner],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  public registerImagePath: string = 'assets/images/deep_focus.jpeg';

  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  public isLoading = signal<boolean>(false);
  public errorMessage = signal<string>('');
  public errorSeverity = signal<SeverityType>(`${Severity.Info}`);

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

  public onRegister = (): void => {
    if (this.registrationForm.invalid || this.isPasswordSecure()) {
      this.errorSeverity.set(Severity.Error)
      this.errorMessage.set('Please fulfill all security criteria before creating an account.');
    }
    this.isLoading.set(true);
    this.errorMessage.set('');
    const formValues = this.registrationForm.getRawValue();
    const registerCommandPayload = {
      email: formValues.email,
      password: formValues.password,
    }
    this.http.post('/auth/register', registerCommandPayload).subscribe(
      {
        next: (newUserId) => {
          this.isLoading.set(false);
          this.errorSeverity.set(Severity.Success);
          this.errorMessage.set('Registration successful! Redirecting to login page.')
          setTimeout(() => {this.router.navigate(['/login'])}, 3000)
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorSeverity.set(Severity.Error);
          if(error.status === 400 || error.status === 500) {
            const serverExceptionMessage = error.error?.detail;
            this.errorMessage.set(serverExceptionMessage || 'Registration contract validation failed.');
          }
          else {
            this.errorSeverity.set(Severity.Fatal);
            this.errorMessage.set('Critical authentication gateway timeout. Server infrastructure offline.');
          }
        }
      }
    );
  }
  protected readonly Variant = Variant;
}
