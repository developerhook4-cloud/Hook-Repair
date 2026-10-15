import { Component, OnInit, ChangeDetectorRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
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
import { SupplierService } from '../../../services/supplier.service';
import { SupplierRequest, SupplierResponse } from '../../../models/supplier.dto';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule],
  templateUrl: './suppliers.html',
  host: { class: 'flex-1 min-h-0 flex flex-col' },
})
export class SuppliersComponent implements OnInit {
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

  searchTerm = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  currentPage = 1;
  itemsPerPage = 5;
  pageInput = 1;

  private supplierService = inject(SupplierService);
  private cdr = inject(ChangeDetectorRef);

  showSuccessToast = false;
  isModalOpen = false;
  isDeleteModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';

  isStatusDropdownOpen = false;

  suppliers: SupplierResponse[] = [];
  availableStatuses = ['Activo', 'Inactivo'];

  supplierToDelete: SupplierResponse | null = null;
  currentSupplier: SupplierResponse | null = null;

  isResizing = false;
  currentResizeIndex = -1;
  startX = 0;
  startWidth = 0;
  columnWidths: number[] = [80, 200, 150, 160, 220, 120, 120];

  ngOnInit() {
    this.loadInitialData();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-status')) this.isStatusDropdownOpen = false;
  }

  loadInitialData() {
    this.supplierService.getAll().subscribe({
      next: (data) => {
        this.suppliers = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading suppliers:', error);
      },
    });
  }

  get tableWidth(): number {
    return this.columnWidths.reduce((sum, width) => sum + width, 0);
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
    const newWidth = Math.max(60, this.startWidth + (event.pageX - this.startX));
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
    if (index >= 6) return;
    const columnKeys: (keyof SupplierResponse)[] = [
      'id',
      'name',
      'phone1',
      'phone2',
      'email',
      'active',
    ];
    const headers = ['ID', 'Nombre', 'Teléfono', 'Teléfono Alternativo', 'Email', 'Estado'];

    const key = columnKeys[index];
    let maxLength = headers[index].length;

    this.processedSuppliers.forEach((supplier) => {
      const val =
        supplier[key] !== undefined && supplier[key] !== null ? String(supplier[key]) : '';
      if (val.length > maxLength) {
        maxLength = val.length;
      }
    });

    const newWidth = Math.max(80, maxLength * 9 + 65);
    this.columnWidths[index] = newWidth;
    this.cdr.detectChanges();
  }

  get processedSuppliers() {
    let result = this.suppliers;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          String(s.id).toLowerCase().includes(term) ||
          s.name?.toLowerCase().includes(term) ||
          s.email?.toLowerCase().includes(term) ||
          s.phone1?.toLowerCase().includes(term),
      );
    }

    if (this.sortColumn) {
      result = [...result].sort((a: any, b: any) => {
        let valA = a[this.sortColumn];
        let valB = b[this.sortColumn];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }

  get totalPages() {
    return Math.ceil(this.processedSuppliers.length / this.itemsPerPage) || 1;
  }

  get paginatedSuppliers() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.processedSuppliers.slice(start, start + this.itemsPerPage);
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

  openCreateModal() {
    this.modalMode = 'create';
    this.currentSupplier = {
      id: '',
      name: '',
      phone1: '',
      phone2: '',
      email: '',
      active: true,
    };
    this.isModalOpen = true;
  }

  openEditModal(supplier: SupplierResponse) {
    this.modalMode = 'edit';
    this.currentSupplier = { ...supplier };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.isStatusDropdownOpen = false;
  }

  openDeleteModal(supplier: SupplierResponse) {
    this.supplierToDelete = supplier;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.supplierToDelete = null;
  }

  confirmDelete() {
    if (!this.supplierToDelete) return;

    this.supplierService.updateStatus(this.supplierToDelete.id, false).subscribe({
      next: () => {
        this.loadInitialData();
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages || 1;
        }
        this.closeDeleteModal();
        this.triggerSuccessToast();
      },
      error: (err) => console.error('Error al eliminar proveedor:', err),
    });
  }

  get isFormValid() {
    return (
      !!this.currentSupplier?.name &&
      this.currentSupplier.name.trim() !== '' &&
      !!this.currentSupplier?.email &&
      this.currentSupplier.email.trim() !== ''
    );
  }

  saveSupplier() {
    if (!this.isFormValid || !this.currentSupplier) return;

    const requestPayload: SupplierRequest = {
      name: this.currentSupplier.name,
      phone1: this.currentSupplier.phone1,
      phone2: this.currentSupplier.phone2,
      email: this.currentSupplier.email,
    };

    if (this.modalMode === 'create') {
      this.supplierService.create(requestPayload).subscribe({
        next: () => {
          this.loadInitialData();
          this.closeModal();
          this.triggerSuccessToast();
        },
        error: (err) => console.error('Error al crear proveedor:', err),
      });
    } else if (this.currentSupplier.id) {
      this.supplierService.update(this.currentSupplier.id, requestPayload).subscribe({
        next: () => {
          this.loadInitialData();
          this.closeModal();
          this.triggerSuccessToast();
        },
        error: (err) => console.error('Error al actualizar proveedor:', err),
      });
    }
  }

  triggerSuccessToast() {
    this.showSuccessToast = true;
    setTimeout(() => {
      this.showSuccessToast = false;
      this.cdr.detectChanges();
    }, 3000);
  }
}
