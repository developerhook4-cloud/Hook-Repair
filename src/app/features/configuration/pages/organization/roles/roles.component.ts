import { Component, inject, OnInit, ChangeDetectorRef, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faMagnifyingGlass,
  faPlus,
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faXmark,
  faTrashCan,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { RolesService } from '../../../services/roles.service';
import { RoleRequest, RoleResponse } from '../../../models/roles.dto';
import { forkJoin } from 'rxjs';

export interface PermissionRow {
  module: string;
  label: string;
  view: boolean;
  update: boolean;
  delete: boolean;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule],
  host: { class: 'flex-1 min-h-0 flex flex-col' },
  templateUrl: './roles.html',
})
export class RolesComponent implements OnInit {
  faSearch = faMagnifyingGlass;
  faPlus = faPlus;
  faChevronDown = faChevronDown;
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;
  faXmark = faXmark;
  faTrashCan = faTrashCan;
  faTriangleExclamation = faTriangleExclamation;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  activeTab = 'roles';
  searchRoleTerm = '';
  searchPermissionTerm = '';
  isRoleDropdownOpen = false;
  isAddRoleModalOpen = false;
  isDeleteModalOpen = false;
  showSuccessToast = false;

  currentPage = 1;
  itemsPerPage = 5;
  pageInput = 1;

  systemModules: string[] = [];

  private roleService = inject(RolesService);
  private cdr = inject(ChangeDetectorRef);

  roles: RoleResponse[] = [];
  selectedRole: RoleResponse | null = null;
  roleToDelete: RoleResponse | null = null;
  currentPermissions: PermissionRow[] = [];

  newRoleName = '';
  newRolePermissions: PermissionRow[] = [];

  readonly MODULE_TRANSLATIONS: Record<string, string> = {
    Organizations: 'Organizaciones',
    Users: 'Usuarios',
    Roles: 'Roles',
    Pos: 'Punto de venta',
    Repairs: 'Reparaciones',
    Inventory: 'Inventario',
    Customers: 'Clientes',
    Suppliers: 'Distribuidores',
    Catalogs: 'Catálogos',
    Devices: 'Dispositivos',
    Services: 'Servicios',
    RepairStatus: 'Estado de reparaciones',
    Reports: 'Reportes',
  };

  ngOnInit() {
    this.loadInitialData();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      this.isRoleDropdownOpen = false;
    }
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    this.isRoleDropdownOpen = false;
  }

  scrollToTop() {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  loadInitialData() {
    forkJoin({
      permissions: this.roleService.getAllPermissions(),
      rolesResponse: this.roleService.getAll(),
    }).subscribe({
      next: ({ permissions, rolesResponse }) => {
        const moduleNames = permissions.map((p) => p?.split('.')[0]).filter(Boolean);
        this.systemModules = [...new Set(moduleNames)];

        const response: any = rolesResponse;
        if (Array.isArray(response)) {
          this.roles = response;
        } else {
          this.roles =
            response.roles ||
            response.Roles ||
            response.data ||
            response.items ||
            response.value ||
            [];
        }

        if (this.roles.length > 0) {
          this.selectRole(this.roles[0]);
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando datos iniciales: ', err),
    });
  }

  loadRoles() {
    this.roleService.getAll().subscribe({
      next: (response: any) => {
        this.roles = Array.isArray(response) ? response : response.roles || response.data || [];
        if (this.roles.length > 0 && !this.selectedRole) {
          this.selectRole(this.roles[0]);
        }
        this.cdr.detectChanges();
      },
    });
  }

  selectRole(role: RoleResponse) {
    this.selectedRole = role;
    this.isRoleDropdownOpen = false;
    this.currentPermissions = this.mapPermissionsToUI(role.permissions);
  }

  saveNewRole() {
    const roleName = this.newRoleName.trim();
    if (!roleName) return;

    const payload: RoleRequest = {
      name: roleName,
      permissions: this.mapUIToPermissions(this.newRolePermissions),
    };

    this.roleService.create(payload).subscribe({
      next: () => {
        this.loadRoles();
        this.closeAddRoleModal();
      },
      error: (err) => console.error('Error al crear rol', err),
    });
  }

  saveChanges() {
    if (!this.selectedRole) return;

    const payload: RoleRequest = {
      name: this.selectedRole.name,
      permissions: this.mapUIToPermissions(this.currentPermissions),
    };

    this.roleService.update(payload, this.selectedRole.id).subscribe({
      next: () => {
        this.loadRoles();
        this.scrollToTop();
        this.showSuccessToast = true;
        setTimeout(() => {
          this.showSuccessToast = false;
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => console.error('Error al actualizar rol', err),
    });
  }

  openDeleteModal(role: RoleResponse) {
    this.roleToDelete = role;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.roleToDelete = null;
  }

  confirmDelete() {
    if (!this.roleToDelete) return;

    this.roleService.updateStatus(this.roleToDelete.id, false).subscribe({
      next: () => {
        this.roles = this.roles.filter((r) => r.id !== this.roleToDelete?.id);

        if (this.selectedRole?.id === this.roleToDelete?.id && this.roles.length > 0) {
          this.selectRole(this.roles[0]);
        }

        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages || 1;
        }
        this.closeDeleteModal();
      },
      error: (err) => console.error('Error al eliminar rol', err),
    });
  }

  private mapPermissionsToUI(permissions: string[]): PermissionRow[] {
    const safePerms = permissions || [];
    return this.systemModules.map((moduleName) => ({
      module: moduleName,
      label: this.MODULE_TRANSLATIONS[moduleName] || moduleName,
      view: safePerms.some((p) => p.toLowerCase() === `${moduleName}.view`.toLowerCase()),
      update: safePerms.some((p) => p.toLowerCase() === `${moduleName}.update`.toLowerCase()),
      delete: safePerms.some((p) => p.toLowerCase() === `${moduleName}.delete`.toLowerCase()),
    }));
  }

  private mapUIToPermissions(uiRows: PermissionRow[]): string[] {
    const result: string[] = [];
    uiRows.forEach((row) => {
      if (row.view) result.push(`${row.module}.View`);
      if (row.update) result.push(`${row.module}.Update`);
      if (row.delete) result.push(`${row.module}.Delete`);
    });
    return result;
  }

  formatPermissionsForDisplay(permissions: string[]): string {
    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
      return 'Sin permisos';
    }

    const modulesOnly = permissions.map((p) => {
      const moduleName = p?.split('.')[0] || '';
      return this.MODULE_TRANSLATIONS[moduleName] || moduleName;
    });

    const uniqueModules = [...new Set(modulesOnly.filter(Boolean))];
    return uniqueModules.join(', ');
  }

  cancelChanges() {
    if (this.selectedRole) {
      this.currentPermissions = this.mapPermissionsToUI(this.selectedRole.permissions);
      this.scrollToTop();
    }
  }

  openAddRoleModal() {
    this.newRoleName = '';
    this.newRolePermissions = this.systemModules.map((m) => ({
      module: m,
      label: this.MODULE_TRANSLATIONS[m] || m,
      view: false,
      update: false,
      delete: false,
    }));
    this.isAddRoleModalOpen = true;
  }

  closeAddRoleModal() {
    this.isAddRoleModalOpen = false;
  }

  updateRoleName(event: Event) {
    this.newRoleName = (event.target as HTMLInputElement).value;
  }

  toggleRoleDropdown(event: Event) {
    event.stopPropagation();
    this.isRoleDropdownOpen = !this.isRoleDropdownOpen;
  }

  get filteredRoles(): RoleResponse[] {
    if (!Array.isArray(this.roles)) return [];
    if (!this.searchRoleTerm) return this.roles;
    const term = this.searchRoleTerm.toLowerCase();

    return this.roles.filter(
      (r) =>
        r.name?.toLowerCase().includes(term) ||
        (Array.isArray(r.permissions) && r.permissions.some((p) => p.toLowerCase().includes(term))),
    );
  }

  get filteredPermissions(): PermissionRow[] {
    if (!this.searchPermissionTerm) return this.currentPermissions;
    const term = this.searchPermissionTerm.toLowerCase();
    return this.currentPermissions.filter((p) => p.label.toLowerCase().includes(term));
  }

  get totalPages() {
    return Math.ceil(this.filteredRoles.length / this.itemsPerPage) || 1;
  }

  get paginatedRoles() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRoles.slice(start, start + this.itemsPerPage);
  }

  get pagesArray() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.pageInput = page;
    } else {
      this.pageInput = this.currentPage;
    }
  }
}
