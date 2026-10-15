import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.css'
})
export class InputComponent {
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() control!: FormControl;
  @Input() isPassword: boolean = false;
  @Input() isRequired: boolean = false;

  showPassword = false;

  faEye = faEye;
  faEyeSlash = faEyeSlash;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  get currentType(): string {
    if (this.isPassword) {
      return this.showPassword ? 'text' : 'password';
    }
    return this.type;
  }
}