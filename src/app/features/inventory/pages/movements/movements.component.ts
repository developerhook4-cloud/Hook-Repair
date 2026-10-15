import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';
import { ProductService } from '../../services/product.service';
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
  faFilter,
} from '@fortawesome/free-solid-svg-icons';
import { ProductResponse } from '../../models/product.dto';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-movements',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule],
  templateUrl: './movements.html',
  host: { class: 'flex-1 min-h-0 flex flex-col' },
})
export class MovementsComponent implements OnInit {
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
  faFilter = faFilter;

  searchTerm = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  currentPage = 1;
  itemsPerPage = 10;
  pageInput = 1;

  private productService = inject(ProductService);

  showSuccessToast = false;
  isModalOpen = false;
  isDeleteModalOpen = false;
  isDetailsModalOpen = false;

  isProductDropdownOpen = false;
  isTypeDropdownOpen = false;

  movementTypes = [
    {
      name: 'Entrada',
      value: 'Entry',
    },
    {
      name: 'Salida',
      value: 'Exit',
    },
    {
      name: 'Ajuste',
      value: 'Adjustment',
    },
  ];

  movements: any[] = [];
  products: ProductResponse[] = [];
  movementToDelete: any = null;
  movementToView: any = null;
  currentMovement = {
    id: '',
    product: '',
    productId: '',
    type: '',
    quantity: 0,
    previousStock: 0,
    currentStock: 0,
    reason: '',
    date: '',
  };

  isResizing = false;
  currentResizeIndex = -1;
  startX = 0;
  startWidth = 0;
  columnWidths: number[] = [140, 80, 150, 150, 150, 130, 150, 180, 120];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-products')) this.isProductDropdownOpen = false;
    if (!target.closest('.dropdown-types')) this.isTypeDropdownOpen = false;
  }

  loadData() {
    forkJoin({
      products: this.productService.getAll(),
      //movements: this.movementService.getAll()
    }).subscribe(({ products }) => {
      this.products = products;
    });
  }

  get processedMovements() {
    let result = this.movements;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (p) => String(p.id).toLowerCase().includes(term) || p.name?.toLowerCase().includes(term),
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

  sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  get totalPages() {
    return Math.ceil(this.processedMovements.length / this.itemsPerPage) || 1;
  }
  get paginatedMovements() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.processedMovements.slice(start, start + this.itemsPerPage);
  }
  get pagesArray() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get tableWidth(): number {
    return this.columnWidths.reduce((sum, width) => sum + width, 0);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.pageInput = page;
    } else {
      this.pageInput = this.currentPage;
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.isProductDropdownOpen = false;
    this.isTypeDropdownOpen = false;
  }

  openDetailsModal(movement: any) {
    this.movementToView = { ...movement };
    this.isDetailsModalOpen = true;
  }

  closeDetailsModal() {
    this.isDetailsModalOpen = false;
    this.movementToView = null;
  }

  openDeleteModal(movement: any) {
    this.movementToDelete = movement;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.movementToDelete = null;
  }

  confirmDelete() {
    if (!this.movementToDelete) return;
    this.movements = this.movements.filter((p) => p.id !== this.movementToDelete!.id);
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages || 1;
    this.closeDeleteModal();
    this.triggerSuccessToast();
  }

  get isFormValid() {
    return this.currentMovement!.quantity !== 0;
  }

  openCreateModal() {
    console.log(this.products);
    this.currentMovement = {
      id: '',
      product: '',
      productId: '',
      type: null as any,
      quantity: 0,
      previousStock: 0,
      currentStock: 0,
      reason: '',
      date: '',
    };
    this.isModalOpen = true;
  }

  saveProduct() {
    if (!this.isFormValid) return;

    const payload = {
      productId: '',
      type: '',
      quantity: 0,
      previousStock: 0,
      currentStock: 0,
      reason: '',
      date: '',
    };
    /* this.movementService.create(payload).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
          this.triggerSuccessToast();
        },
        error: (err) => console.error('Error al crear movimiento', err),
      });*/
  }

  triggerSuccessToast() {
    this.showSuccessToast = true;
    setTimeout(() => {
      this.showSuccessToast = false;
      this.cdr.detectChanges();
    }, 3000);
  }
}
