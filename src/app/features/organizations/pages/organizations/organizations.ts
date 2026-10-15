import { Component, inject, OnInit, signal } from '@angular/core';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { TableColumn, TableComponent } from '../../../../shared/components/table/table.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { OrganizationResponse, UserDto } from '../../models/organization.dto';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { OrganizationService } from '../../services/organization.service';

@Component({
  selector: 'app-organizations-view',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TableComponent,
    ModalComponent,
    ButtonComponent,
    InputComponent,
    CommonModule,
  ],
  templateUrl: './organizations.html',
  styleUrl: './organizations.css',
})
export class OrganizationsPageComponent implements OnInit {
  private organizationService = inject(OrganizationService);
  private fb = inject(FormBuilder);

  organizations: OrganizationResponse[] = [];
  selectedOrg = signal<OrganizationResponse | null>(null);
  orgUsers: UserDto[] = [];
  searchControl = this.fb.control('');

  isOrgModalOpen = signal(false);
  editingOrg = signal<any | null>(null);

  isUserModalOpen = signal(false);
  isConfirmModalOpen = signal(false);

  orgForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    phone2: [''],
    website: [''],
    address: [''],
    city: [''],
    state: [''],
    postCode: [''],
    country: [''],
  });

  userForm: FormGroup = this.fb.group({
    userName: ['', Validators.required],
    userEmail: ['', [Validators.required, Validators.email]],
    userPassword: ['', Validators.required],
  });

  orgColumns: TableColumn[] = [
    { key: 'name', label: 'Nombre', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'phone', label: 'Teléfono', type: 'text' },
    { key: 'employees', label: 'Empleados', type: 'text' },
    { key: 'active', label: 'Estado', type: 'badge' },
  ];

  empColumns: TableColumn[] = [
    { key: 'name', label: 'Usuario', type: 'text' },
    { key: 'role', label: 'Rol', type: 'text' },
    { key: 'actions', label: '', type: 'action' },
  ];

  ngOnInit(): void {
    this.loadOrganizations();
  }

  loadOrganizations() {
    this.organizationService.getAll().subscribe({
      next: (data) => (this.organizations = data),
      error: (err) => console.error('Error al cargar organizaciones', err),
    });
  }

  get name() {
    return this.orgForm.get('name') as FormControl;
  }

  get email() {
    return this.orgForm.get('email') as FormControl;
  }

  get phone() {
    return this.orgForm.get('phone') as FormControl;
  }

  get phone2() {
    return this.orgForm.get('phone2') as FormControl;
  }

  get website() {
    return this.orgForm.get('website') as FormControl;
  }

  get address() {
    return this.orgForm.get('address') as FormControl;
  }

  get city() {
    return this.orgForm.get('city') as FormControl;
  }

  get state() {
    return this.orgForm.get('state') as FormControl;
  }

  get postCode() {
    return this.orgForm.get('postCode') as FormControl;
  }

  get country() {
    return this.orgForm.get('country') as FormControl;
  }

  get userName() {
    return this.userForm.get('userName') as FormControl;
  }
  get userEmail() {
    return this.userForm.get('userEmail') as FormControl;
  }
  get userPassword() {
    return this.userForm.get('userPassword') as FormControl;
  }

  selectOrg(org: OrganizationResponse | null) {
    this.selectedOrg.set(org);
    if (org) {
      this.organizationService.getOrganizationUsers(org.id).subscribe({
        next: (users) => (this.orgUsers = users),
        error: (err) => console.error('Error al cargar usuarios', err),
      });
    }
  }

  openOrgModal(org?: any) {
    if (org) {
      this.editingOrg.set(org);
      this.orgForm.patchValue(org);
    } else {
      this.editingOrg.set(null);
      this.orgForm.reset();
    }
    this.isOrgModalOpen.set(true);
  }

  closeOrgModal() {
    this.isOrgModalOpen.set(false);
    this.editingOrg.set(null);
  }

  saveOrg() {
    if (this.orgForm.invalid) {
      this.orgForm.markAllAsTouched();
      return;
    }

    const currentOrg = this.editingOrg();
    console.log(this.orgForm.value);

    const orgData = {
      name: this.orgForm.value.name,
      email: this.orgForm.value.email,
      phone1: this.orgForm.value.phone || '',
      phone2: this.orgForm.value.phone2 || '',
      website: this.orgForm.value.website || '',
      address: {
        address: this.orgForm.value.address || '',
        city: this.orgForm.value.city || '',
        state: this.orgForm.value.state || '',
        postCode: this.orgForm.value.postCode || '',
        country: this.orgForm.value.country || '',
      },

      active: currentOrg ? currentOrg.active : true,
    };

    if (currentOrg) {
      this.organizationService.update(currentOrg.id, orgData).subscribe({
        next: (updated) => {
          this.loadOrganizations();
          this.closeOrgModal();
          if (this.selectedOrg()?.id === updated.id) {
            this.selectedOrg.set(updated);
          }
        },
        error: (err) => console.error('Error al actualizar organización', err),
      });
    } else {
      this.organizationService.create(orgData).subscribe({
        next: () => {
          this.loadOrganizations();
          this.closeOrgModal();
        },
        error: (err) => console.error('Error al crear organización', err),
      });
    }
  }

  saveUser() {
    const org = this.selectedOrg();
    if (this.userForm.invalid || !org) {
      this.userForm.markAllAsTouched();
      return;
    }

    const userData = {
      name: this.userName.value,
      email: this.userEmail.value,
      password: this.userPassword.value,
    };

    this.organizationService.createOrganizationUser(org.id, userData).subscribe({
      next: () => {
        this.isUserModalOpen.set(false);
        this.userForm.reset();
        this.selectOrg(org);
      },
      error: (err) => console.error('Error al crear usuario', err),
    });
  }

  toggleOrgStatus() {
    const org = this.selectedOrg();
    if (!org) return;

    const newStatus = !org.active;

    this.organizationService.updateStatus(org.id, newStatus).subscribe({
      next: () => {
        this.isConfirmModalOpen.set(false);
        this.loadOrganizations();
        this.selectedOrg.set(null);
      },
      error: (err) => console.error('Error al cambiar estado', err),
    });
  }

  handleEmployeeAction(event: { action: string; row: any }) {
    const org = this.selectedOrg();
    if (!org) return;

    if (event.action === 'deactivate') {
      const newStatus = !event.row.isActive;

      this.organizationService
        .updateOrganizationUserStatus(org.id, event.row.id, newStatus)
        .subscribe({
          next: () => this.selectOrg(org),
          error: (err) => console.error('Error al desactivar usuario', err),
        });
    }
  }

  openUserModal() {
    this.isUserModalOpen.set(true);
  }

  openConfirmModal() {
    this.isConfirmModalOpen.set(true);
  }
}
