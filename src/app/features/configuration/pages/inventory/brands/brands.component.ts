import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  inject,
  ViewChild,
} from '@angular/core';
import {
  faMagnifyingGlass,
  faPlus,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faXmark,
  faTrashCan,
  faTriangleExclamation,
  faPen,
} from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CatalogService } from '../../../services/catalog.service';
import { CatalogItemResponse, CatalogNameRequest } from '../../../models/catalog.dto';

@Component({
  selector: 'app-brands',
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './brands.html',
  host: {
    class: 'flex-1 flex flex-col min-h-0',
  },
})
export class BrandsComponent {
  faSearch = faMagnifyingGlass;
  faPlus = faPlus;
  faChevronDown = faChevronDown;
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;
  faXmark = faXmark;
  faTrashCan = faTrashCan;
  faTriangleExclamation = faTriangleExclamation;
  faPen = faPen;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  searchBrandTerm = '';
  isBrandDropdownOpen = false;
  isAddBrandModalOpen = false;
  isDeleteModalOpen = false;
  showSuccessToast = false;

  currentPage = 1;
  itemsPerPage = 5;
  pageInput = 1;

  private catalogService = inject(CatalogService);
  private cdr = inject(ChangeDetectorRef);

  brands: CatalogItemResponse[] = [];
  selectedBrand: CatalogItemResponse | null = null;
  brandToDelete: CatalogItemResponse | null = null;
  modalMode: 'create' | 'edit' = 'create';

  newBrandName = '';

  ngOnInit() {
    this.loadBrands();
  }

  selectBrand(brand: CatalogItemResponse) {
    this.selectedBrand = brand;
  }

  scrollToTop() {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  loadBrands() {
    this.catalogService.getBrands().subscribe({
      next: (response: any) => {
        this.brands = response;
        if (this.brands.length > 0 && !this.selectedBrand) {
          this.selectBrand(this.brands[0]);
        }
        this.cdr.detectChanges();
      },
    });
  }

  saveNewBrand() {
    const brandName = this.newBrandName.trim();
    if (!brandName) return;

    const payload: CatalogNameRequest = {
      name: brandName,
    };

    this.catalogService.createBrand(payload).subscribe({
      next: () => {
        this.loadBrands();
        this.closeAddBrandModal();
      },
      error: (err) => console.error('Error al crear marca', err),
    });
  }

  saveChanges() {
    if (!this.selectedBrand) return;

    const payload: CatalogNameRequest = {
      name: this.selectedBrand.name,
    };

    this.catalogService.updateBrand(this.selectedBrand.id, payload).subscribe({
      next: () => {
        this.loadBrands();
        this.scrollToTop();
        this.showSuccessToast = true;
        setTimeout(() => {
          this.showSuccessToast = false;
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => console.error('Error al actualizar marca', err),
    });
  }

  openEditModal(brand: CatalogItemResponse) {
    this.selectedBrand = { ...brand };
    this.modalMode = 'edit';
    this.isAddBrandModalOpen = true;
  }

  openDeleteModal(brand: CatalogItemResponse) {
    this.brandToDelete = brand;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.brandToDelete = null;
  }

  confirmDelete() {
    if (!this.brandToDelete) return;

    this.catalogService.updateBrandStatus(this.brandToDelete.id, false).subscribe({
      next: () => {
        this.brands = this.brands.filter((r) => r.id !== this.brandToDelete?.id);

        if (this.selectedBrand?.id === this.brandToDelete?.id && this.brands.length > 0) {
          this.selectBrand(this.brands[0]);
        }

        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages || 1;
        }
        this.closeDeleteModal();
      },
      error: (err) => console.error('Error al eliminar marca', err),
    });
  }

  openAddBrandModal() {
    this.newBrandName = '';
    this.isAddBrandModalOpen = true;
  }

  closeAddBrandModal() {
    this.isAddBrandModalOpen = false;
  }

  updateBrandName(event: Event) {
    this.newBrandName = (event.target as HTMLInputElement).value;
  }

  get filteredBrands(): CatalogItemResponse[] {
    if (!Array.isArray(this.brands)) return [];
    if (!this.searchBrandTerm) return this.brands;
    const term = this.searchBrandTerm.toLowerCase();

    return this.brands.filter((r) => r.name?.toLowerCase().includes(term));
  }
  get totalPages() {
    return Math.ceil(this.filteredBrands.length / this.itemsPerPage) || 1;
  }

  get paginatedBrands() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredBrands.slice(start, start + this.itemsPerPage);
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
