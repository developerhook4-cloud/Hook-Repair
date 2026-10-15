import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { SidebarStateService } from '../../../../shared/components/sidebar/sidebar.component';
import { OwnOrganizationService } from '../../services/own-organization.service';
import { OrganizationResponse } from '../../../organizations/models/organization.dto';

@Component({
  selector: 'app-organization',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './organization.html',
  host: { class: 'flex-1 min-h-0 flex flex-col' },
})
export class OrganizationComponent implements OnInit {
  orgForm: FormGroup;
  isSidebarCollapsed = false;
  showSuccessToast = false;
  
  private organizationService = inject(OwnOrganizationService);
  private cdr = inject(ChangeDetectorRef);
  private organization: OrganizationResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private sidebarState: SidebarStateService,
  ) {
    this.orgForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\sñÑáéíóúÁÉÍÓÚ]+$/)]],
      email: ['', [Validators.email, Validators.required]],
      phone: ['', [Validators.pattern(/^[0-9+\-\s()]+$/)]],
      phone2: ['', [Validators.pattern(/^[0-9+\-\s()]+$/)]],
      website: [''],
      address: [''],
      city: [''],
      state: [''],
      postCode: ['', [Validators.pattern(/^[0-9]+$/)]],
      country: [''],
    });
  }

  ngOnInit() {
    this.sidebarState.isCollapsed$.subscribe((collapsed) => {
      this.isSidebarCollapsed = collapsed;
    });
    this.loadOrganizationData();
  }

  loadOrganizationData() {
    this.organizationService.get().subscribe({
      next: (data) => {
        this.organization = data;
        this.orgForm.patchValue({
          name: this.organization?.name,
          email: this.organization?.email,
          phone: this.organization?.phone,
          phone2: this.organization?.phone2,
          website: this.organization?.website,
          address: this.organization?.address?.address,
          city: this.organization?.address?.city,
          state: this.organization?.address?.state,
          postCode: this.organization?.address?.postCode,
          country: this.organization?.address?.country,
        });
      },
      error: (err) => console.error(err),
    });
  }

  getControl(controlName: string): FormControl {
    return this.orgForm.get(controlName) as FormControl;
  }

  onSubmit() {
    if (this.orgForm.invalid) {
      this.orgForm.markAllAsTouched();
      return;
    }
    const formValues = this.orgForm.value;

    const payload = {
      name: formValues.name,
      email: formValues.email,
      phone: formValues.phone,
      phone2: formValues.phone2,
      website: formValues.website,
      address: {
        address: formValues.address,
        city: formValues.city,
        state: formValues.state,
        postCode: formValues.postCode,
        country: formValues.country,
      },
    };

    this.organizationService.update(payload).subscribe({
      next: () => {
        this.orgForm.markAsPristine();
        this.showSuccessToast = true;
        setTimeout(() => {
          this.showSuccessToast = false;
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => console.error(err),
    });
  }
}
