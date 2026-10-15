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
  faSliders
} from '@fortawesome/free-solid-svg-icons';
import { ProductResponse } from '../../models/product.dto';
import { CatalogService } from '../../../configuration/services/catalog.service';
import { forkJoin } from 'rxjs';
import {
  CatalogItemResponse,
  CategoryResponse,
  ModelResponse,
} from '../../../configuration/models/catalog.dto';
import { SupplierResponse } from '../../../configuration/models/supplier.dto';
import { SupplierService } from '../../../configuration/services/supplier.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule],
  templateUrl: './products.html',
  host: { class: 'flex-1 min-h-0 flex flex-col' },
})
export class ProductsComponent implements OnInit {
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
  faSliders = faSliders;

  searchTerm = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  currentPage = 1;
  itemsPerPage = 10;
  pageInput = 1;

  private productService = inject(ProductService);
  private catalogService = inject(CatalogService);
  private supplierService = inject(SupplierService);

  showSuccessToast = false;
  isModalOpen = false;
  isDeleteModalOpen = false;
  isDetailsModalOpen = false;
  isFilterModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';

  isCategoryDropdownOpen = false;
  isBrandDropdownOpen = false;
  isSupplierDropdownOpen = false;
  isConditionDropdownOpen = false;
  isDeviceDropdownOpen = false;

  isFilterCategoryDropdownOpen = false;
  isFilterBrandDropdownOpen = false;
  isFilterSupplierDropdownOpen = false;

  products: ProductResponse[] = [];
  productToDelete: ProductResponse | null = null;
  productToView: ProductResponse | null = null;
  currentProduct: ProductResponse = {
    id: '',
    name: '',
    categoryName: '',
    brandName: '',
    modelName: '',
    modelNames: [],
    supplierName: '',
    upc: '',
    inStock: 0,
    price: 0,
    isSerialized: false,
    serialNumbers: [],
    active: true,
    status: '',
  };

  activeFilters = {
    name: '',
    category: '',
    brand: '',
    model: '',
    supplier: '',
  };

  tempFilters = { ...this.activeFilters };

  categories: CategoryResponse[] = [];
  models: ModelResponse[] = [];
  brands: CatalogItemResponse[] = [];
  suppliers: SupplierResponse[] = [];
  conditions = ['Nuevo', 'Reacondicionado', 'Usado'];

  isResizing = false;
  currentResizeIndex = -1;
  startX = 0;
  startWidth = 0;
  columnWidths: number[] = [80, 140, 150, 130, 130, 220, 150, 180, 120];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-category')) this.isCategoryDropdownOpen = false;
    if (!target.closest('.dropdown-brand')) this.isBrandDropdownOpen = false;
    if (!target.closest('.dropdown-supplier')) this.isSupplierDropdownOpen = false;
    if (!target.closest('.dropdown-condition')) this.isConditionDropdownOpen = false;
    if (!target.closest('.dropdown-device')) this.isDeviceDropdownOpen = false;

    if (!target.closest('.dropdown-filter-category')) this.isFilterCategoryDropdownOpen = false;
    if (!target.closest('.dropdown-filter-brand')) this.isFilterBrandDropdownOpen = false;
    if (!target.closest('.dropdown-filter-supplier')) this.isFilterSupplierDropdownOpen = false;
  }

  loadData() {
    forkJoin({
      products: this.productService.getAll(),
      categories: this.catalogService.getCategories(),
      models: this.catalogService.getModels(),
      brands: this.catalogService.getBrands(),
      suppliers: this.supplierService.getAll(),
    }).subscribe(({ products, categories, models, brands, suppliers }) => {
      this.products = products;
      this.categories = categories;
      this.models = models;
      this.brands = brands;
      this.suppliers = suppliers;
    });
  }

  adjustSerialNumbersArray() {
    const targetLength = this.currentProduct!.inStock || 0;
    if (targetLength < 0) return;

    const currentLength = this.currentProduct!.serialNumbers.length;
    if (targetLength > currentLength) {
      for (let i = currentLength; i < targetLength; i++) {
        this.currentProduct!.serialNumbers.push('');
      }
    } else if (targetLength < currentLength) {
      this.currentProduct!.serialNumbers.splice(targetLength);
    }
  }

  get processedProducts() {
    let result = this.products;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          String(p.id).toLowerCase().includes(term) ||
          p.upc?.toLowerCase().includes(term) ||
          p.name?.toLowerCase().includes(term) ||
          p.categoryName?.toLowerCase().includes(term) ||
          p.brandName?.toLowerCase().includes(term) ||
          p.modelName?.toLowerCase().includes(term) ||
          p.supplierName?.toLowerCase().includes(term) ||
          (p.serialNumbers &&
            p.serialNumbers.some((imei: string) => imei.toLowerCase().includes(term))),
      );
    }

    if (this.activeFilters.name) {
      result = result.filter((p) =>
        p.name?.toLowerCase().includes(this.activeFilters.name.toLowerCase()),
      );
    }
    if (this.activeFilters.category) {
      result = result.filter((p) => p.categoryName === this.activeFilters.category);
    }
    if (this.activeFilters.brand) {
      result = result.filter((p) => p.brandName === this.activeFilters.brand);
    }
    if (this.activeFilters.model) {
      result = result.filter((p) =>
        p.modelName?.toLowerCase().includes(this.activeFilters.model.toLowerCase()),
      );
    }
    if (this.activeFilters.supplier) {
      result = result.filter((p) => p.supplierName === this.activeFilters.supplier);
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
    return Math.ceil(this.processedProducts.length / this.itemsPerPage) || 1;
  }
  get paginatedProducts() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.processedProducts.slice(start, start + this.itemsPerPage);
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

  openFilterModal() {
    this.tempFilters = { ...this.activeFilters };
    this.isFilterModalOpen = true;
  }

  closeFilterModal() {
    this.isFilterModalOpen = false;
  }

  applyFilters() {
    this.activeFilters = { ...this.tempFilters };
    this.currentPage = 1;
    this.closeFilterModal();
  }

  clearFilters() {
    this.tempFilters = { name: '', category: '', brand: '', model: '', supplier: '' };
  }

  openEditModal(product: any) {
    this.modalMode = 'edit';
    this.currentProduct = {
      ...product,
      serialNumbers: product.serialNumbers ? [...product.serialNumbers] : [],
    };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.isCategoryDropdownOpen = false;
    this.isBrandDropdownOpen = false;
    this.isSupplierDropdownOpen = false;
    this.isConditionDropdownOpen = false;
    this.isDeviceDropdownOpen = false;
  }

  openDetailsModal(product: any) {
    this.productToView = { ...product };
    this.isDetailsModalOpen = true;
  }

  closeDetailsModal() {
    this.isDetailsModalOpen = false;
    this.productToView = null;
  }

  openDeleteModal(product: any) {
    this.productToDelete = product;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.productToDelete = null;
  }

  confirmDelete() {
    if (!this.productToDelete) return;
    this.products = this.products.filter((p) => p.id !== this.productToDelete!.id);
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages || 1;
    this.closeDeleteModal();
    this.triggerSuccessToast();
  }

  get isFormValid() {
    return (
      this.currentProduct!.name!.trim() !== '' &&
      this.currentProduct!.categoryName !== '' &&
      this.currentProduct!.brandName !== ''
    );
  }

  openCreateModal() {
    this.modalMode = 'create';
    this.currentProduct = {
      id: '',
      name: '',
      categoryId: null as any,
      brandId: null as any,
      modelId: null as any,
      supplierId: null as any,
      categoryName: '',
      brandName: '',
      modelName: '',
      supplierName: '',
      modelNames: [],
      upc: '',
      condition: null as any,
      inStock: 0,
      stockWarning: 0,
      minimumReorderPoint: 0,
      price: 0,
      generalSalePrice: 0,
      distributorSalePrice: 0,
      isSerialized: false,
      serialNumbers: [],
      active: true,
      status: '',
    };
    this.isModalOpen = true;
  }

  saveProduct() {
    if (!this.isFormValid) return;

    const payload = {
      name: this.currentProduct.name,
      categoryId: this.currentProduct.categoryId || null,
      brandId: this.currentProduct.brandId || null,
      modelId: this.currentProduct.modelId || null,
      supplierId: this.currentProduct.supplierId || null,
      upc: this.currentProduct.upc || null,
      condition: this.currentProduct.condition || null,
      inStock: this.currentProduct.inStock || 0,
      stockWarning: this.currentProduct.stockWarning || 0,
      minimumReorderPoint: this.currentProduct.minimumReorderPoint || 0,
      price: this.currentProduct.price || 0,
      generalSalePrice: this.currentProduct.generalSalePrice || 0,
      distributorSalePrice: this.currentProduct.distributorSalePrice || 0,
      isSerialized: this.currentProduct.isSerialized,
      active: true,
    };

    if (this.modalMode === 'create') {
      this.productService.create(payload).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
          this.triggerSuccessToast();
        },
        error: (err) => console.error('Error al crear producto', err),
      });
    } else {
      this.productService.update(this.currentProduct.id, payload).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
          this.triggerSuccessToast();
        },
        error: (err) => console.error('Error al editar producto', err),
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
