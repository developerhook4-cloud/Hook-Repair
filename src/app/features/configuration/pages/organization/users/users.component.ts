import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { forkJoin } from 'rxjs';
import {
  faMagnifyingGlass,
  faPlus,
  faPen,
  faTrashCan,
  faEllipsis,
  faArrowUp,
  faArrowDown,
  faXmark,
  faTriangleExclamation,
  faChevronLeft,
  faChevronRight,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import { SelectComponent } from '../../../../../shared/components/select/select.component';
import { UserService } from '../../../services/user.service';
import { RolesService } from '../../../services/roles.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule, SelectComponent],
  templateUrl: './users.html',
  host: { class: 'flex-1 min-h-0 flex flex-col' },
})
export class UsersComponent implements OnInit {
  faSearch = faMagnifyingGlass;
  faPlus = faPlus;
  faPen = faPen;
  faTrashCan = faTrashCan;
  faEllipsis = faEllipsis;
  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;
  faXmark = faXmark;
  faTriangleExclamation = faTriangleExclamation;
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;
  faChevronDown = faChevronDown;

  searchUserTerm = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  currentPage = 1;
  itemsPerPage = 5;
  pageInput = 1;

  private userService = inject(UserService);
  private rolesService = inject(RolesService);
  private cdr = inject(ChangeDetectorRef);

  users: any[] = [];
  availableRoles: any[] = [];
  availableStatuses = ['Activo', 'Inactivo'];

  isRoleDropdownOpen = false;

  isResizing = false;
  currentResizeIndex = -1;
  startX = 0;
  startWidth = 0;
  columnWidths: number[] = [220, 280, 250, 150];

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    forkJoin({
      rolesResponse: this.rolesService.getAll(),
      usersResponse: this.userService.getAll(),
    }).subscribe({
      next: ({ rolesResponse, usersResponse }) => {
        const rawRoles = Array.isArray(rolesResponse)
          ? rolesResponse
          : (rolesResponse as any).roles || (rolesResponse as any).data || [];
        this.availableRoles = rawRoles.length > 0 ? rawRoles : [];

        this.processUsersResponse(usersResponse);
      },
      error: (err) => console.error(err),
    });
  }

  loadUsers() {
    this.userService.getAll().subscribe({
      next: (response) => this.processUsersResponse(response),
      error: (err) => console.error(err),
    });
  }

  private processUsersResponse(response: any) {
    const rawUsers = Array.isArray(response)
      ? response
      : response.users || response.items || response.data || [];

    this.users = rawUsers.map((u: any) => ({
      ...u,
      status: u.active ? 'Activo' : 'Inactivo',
      roleName: u.role || u.roleName || 'Sin Rol',
      roleId: u.roleId,
    }));

    this.cdr.detectChanges();
  }

  sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  onMouseDown(event: MouseEvent, index: number) {
    this.isResizing = true;
    this.currentResizeIndex = index;
    this.startX = event.pageX;
    this.startWidth = this.columnWidths[index];
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
    event.stopPropagation();
    event.preventDefault();
  }

  onMouseMove = (event: MouseEvent) => {
    if (!this.isResizing || this.currentResizeIndex === -1) return;
    const newWidth = Math.max(80, this.startWidth + (event.pageX - this.startX));
    if (this.columnWidths[this.currentResizeIndex] !== newWidth) {
      this.columnWidths[this.currentResizeIndex] = newWidth;
      this.cdr.detectChanges();
    }
  };

  onMouseUp = () => {
    this.isResizing = false;
    this.currentResizeIndex = -1;
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };

  onDoubleClick(index: number) {
    if (index >= 4) return;
    const columnKeys = ['name', 'email', 'roleName', 'status'];
    const headers = ['Nombre', 'Email', 'Rol', 'Estado'];

    const key = columnKeys[index];
    let maxLength = headers[index].length;

    this.processedUsers.forEach((user: any) => {
      const val = user[key] ? String(user[key]) : '';
      if (val.length > maxLength) {
        maxLength = val.length;
      }
    });

    const newWidth = Math.max(100, (maxLength * 9) + 65);
    this.columnWidths[index] = newWidth;
    this.cdr.detectChanges();
  }

  get processedUsers() {
    let result = this.users;

    if (this.searchUserTerm) {
      const term = this.searchUserTerm.toLowerCase();
      result = result.filter(
        (emp) =>
          emp.name?.toLowerCase().includes(term) ||
          emp.email?.toLowerCase().includes(term) ||
          emp.roleName?.toLowerCase().includes(term),
      );
    }

    if (this.sortColumn) {
      result = [...result].sort((a: any, b: any) => {
        const valA = (a[this.sortColumn] || '').toString().toLowerCase();
        const valB = (b[this.sortColumn] || '').toString().toLowerCase();
        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }

  get totalPages() {
    return Math.ceil(this.processedUsers.length / this.itemsPerPage) || 1;
  }

  get paginatedUsers() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.processedUsers.slice(start, start + this.itemsPerPage);
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

  toggleRoleDropdown() {
    this.isRoleDropdownOpen = !this.isRoleDropdownOpen;
  }

  selectRole(role: any) {
    this.currentUser.roleId = role.id;
    this.isRoleDropdownOpen = false;
  }

  get currentSelectedRoleName(): string {
    if (!this.currentUser.roleId) return 'Seleccionar rol';
    const role = this.availableRoles.find((r) => r.id === this.currentUser.roleId);
    return role ? role.name : 'Seleccionar rol';
  }

  isUserModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  currentUser: any = { name: '', email: '', password: '', confirmPassword: '', roleId: '', status: 'Activo' };

  openCreateUserModal() {
    this.modalMode = 'create';
    this.isRoleDropdownOpen = false;
    this.currentUser = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      roleId: this.availableRoles.length > 0 ? this.availableRoles[0].id : '',
      status: 'Activo',
    };
    this.isUserModalOpen = true;
  }

  openEditUserModal(user: any) {
    this.modalMode = 'edit';
    this.isRoleDropdownOpen = false;
    this.currentUser = { ...user, password: '', confirmPassword: '' };
    this.isUserModalOpen = true;
  }

  closeUserModal() {
    this.isUserModalOpen = false;
    this.isRoleDropdownOpen = false;
  }

  saveUser() {
    const payload: any = {
      name: this.currentUser.name,
      email: this.currentUser.email,
      roleId: this.currentUser.roleId,
      active: this.currentUser.status === 'Activo',
    };

    if (this.modalMode === 'create') {
      payload.password = this.currentUser.password;
      
      this.userService.create(payload).subscribe({
        next: () => {
          this.loadUsers();
          this.closeUserModal();
        },
        error: (err) => console.error(err),
      });
    } else {
      this.userService.update(payload, this.currentUser.id).subscribe({
        next: () => {
          const originalUser = this.users.find((e) => e.id === this.currentUser.id);
          if (originalUser && originalUser.status !== this.currentUser.status) {
            this.userService.updateStatus(this.currentUser.id, payload.active).subscribe({
              next: () => this.loadUsers(),
            });
          } else {
            this.loadUsers();
          }
          this.closeUserModal();
        },
        error: (err) => console.error(err),
      });
    }
  }

  isDeleteModalOpen = false;
  userToDelete: any = null;

  openDeleteModal(user: any) {
    this.userToDelete = user;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.userToDelete = null;
  }

  confirmDelete() {
    if (!this.userToDelete) return;

    this.users = this.users.filter((u) => u.id !== this.userToDelete.id);

    this.userService.updateStatus(this.userToDelete.id, false).subscribe({
      next: () => {
        this.loadUsers();

        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages || 1;
        }

        this.closeDeleteModal();
      },
      error: (err) => {
        console.error(err);
        this.loadUsers();
      },
    });
  }
}
