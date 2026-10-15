import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../../auth/services/auth.service';
import { AuthResponseDto } from '../../../auth/models/auth-response.dto';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './profile.component.html',
  host: {
    class: 'flex-1 flex flex-col min-h-0',
  },
})
export class ProfileComponent {
  profileForm: FormGroup;
  private userService = inject(UserService);
  private authService = inject(AuthService);
  isPasswordOpen = signal(false);
  isSidebarCollapsed: boolean = true;
  isLoading = signal(false);

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\sñÑáéíóúÁÉÍÓÚ]+$/)]],
        email: ['', [Validators.email, Validators.required]],
        oldPassword: [''],
        newPassword: [''],
        repeatNewPassword: [''],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    var user = this.authService.currentUser();
    this.profileForm.patchValue({
      name: user?.user.name,
      email: user?.user.email,
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const repeatNewPassword = control.get('repeatNewPassword')?.value;
    if (newPassword && newPassword !== repeatNewPassword) {
      control.get('repeatNewPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      if (control.get('repeatNewPassword')?.hasError('mismatch')) {
        control.get('repeatNewPassword')?.setErrors(null);
      }
      return null;
    }
  }

  getControl(controlName: string): FormControl {
    return this.profileForm.get(controlName) as FormControl;
  }

  reloadForm() {}

  onSubmit() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const formValues = this.profileForm.value;

    const payload = {
      name: formValues.name,
      email: formValues.email,
      oldPassword: formValues.oldPassword || null,
      newPassword: formValues.newPassword || null,
    };

    this.userService.updateProfile(payload).subscribe({
      next: () => {
        this.profileForm.patchValue({
          oldPassword: '',
          newPassword: '',
          repeatNewPassword: '',
        });
        const currentSession = this.authService.currentUser();
        if (currentSession) {
          const updatedSession: AuthResponseDto = {
            ...currentSession,
            user: {
              ...currentSession.user,
              name: payload.name,
              email: payload.email,
            },
          };
          this.authService.currentUserSignal.set(updatedSession);
        }
      },
      error: (err) => console.error('Error al actualizar el perfil', err),
    });
  }
}
