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
import { CatalogService } from '../../../services/catalog.service';
import {
  CatalogItemResponse,
  CategoryResponse,
  ModelResponse,
  SaveServiceRequest,
  ServiceResponse,
} from '../../../models/catalog.dto';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule],
  templateUrl: './services.html',
  host: { class: 'flex-1 min-h-0 flex flex-col' },
})
export class ServicesComponent implements OnInit {
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

  showSuccessToast = false;
  isModalOpen = false;
  isDeleteModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';

  private catalogService = inject(CatalogService);
  private cdr = inject(ChangeDetectorRef);

  isCategoryDropdownOpen = false;
  isBrandDropdownOpen = false;
  isModelDropdownOpen = false;

  services: ServiceResponse[] = [];
  categories: CategoryResponse[] = [];
  brands: CatalogItemResponse[] = [];
  models: ModelResponse[] = [];

  serviceToDelete: ServiceResponse | null = null;
  currentService: any = null;

  isResizing = false;
  currentResizeIndex = -1;
  startX = 0;
  startWidth = 0;
  columnWidths: number[] = [200, 150, 180, 120, 140, 160, 120];

  ngOnInit() {
    this.loadData();
    console.log(this.services);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-category')) this.isCategoryDropdownOpen = false;
    if (!target.closest('.dropdown-brand')) this.isBrandDropdownOpen = false;
    if (!target.closest('.dropdown-model')) this.isModelDropdownOpen = false;
  }

  loadData() {
    forkJoin({
      serviceResponse: this.catalogService.getServices(),
      categoryResponse: this.catalogService.getCategories(),
      modelResponse: this.catalogService.getModels(),
      brandResponse: this.catalogService.getBrands(),
    }).subscribe({
      next: ({ serviceResponse, categoryResponse, modelResponse, brandResponse }) => {
        this.processServiceResponse(serviceResponse);
        this.processCategoryResponse(categoryResponse);
        this.processModelResponse(modelResponse);
        this.processBrandResponse(brandResponse);
      },
      error: (err) => console.error(err),
    });
  }

  private normalizeResponse(response: any, fallbackKey?: string): any[] {
    if (Array.isArray(response)) return response;

    const obj = (response ?? {}) as Record<string, any>;
    const keys = [fallbackKey, 'data', 'items', 'services', 'categories', 'models', 'brands'];
    for (const key of keys) {
      if (!key) continue;
      const value = obj[key];
      if (Array.isArray(value)) return value;
    }

    return [];
  }

  private processServiceResponse(response: any) {
    const rawServices = this.normalizeResponse(response, 'services');

    this.services = rawServices.map((u: any) => ({
      ...u,
      status: u.active ? 'Activo' : 'Inactivo',
      brandName: u.brand || u.brandName || '',
      price: u.retailPrice,
    }));

    this.cdr.detectChanges();
  }

  private processCategoryResponse(response: any) {
    const rawCategories = this.normalizeResponse(response, 'categories');
    this.categories = rawCategories.map((u: any) => ({
      ...u,
      status: u.active ? 'Activo' : 'Inactivo',
    }));
  }

  private processModelResponse(response: any) {
    const rawModels = this.normalizeResponse(response, 'models');
    this.models = rawModels.map((u: any) => ({ ...u, status: u.active ? 'Activo' : 'Inactivo' }));
  }

  private processBrandResponse(response: any) {
    const rawBrands = this.normalizeResponse(response, 'brands');
    this.brands = rawBrands.map((u: any) => ({ ...u, status: u.active ? 'Activo' : 'Inactivo' }));
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
    if (index >= 6) return;
    const columnKeys = [
      'name',
      'categoryName',
      'deviceName',
      'price',
      'publicPrice',
      'distributorPrice',
    ];
    const headers = [
      'Nombre',
      'Categoría',
      'Dispositivo',
      'Precio',
      'Precio Público',
      'Precio Distribuidor',
    ];

    const key = columnKeys[index];
    let maxLength = headers[index].length;
    this.processedServices.forEach((service: any) => {
      let val = '';
      if (key === 'deviceName')
        val = `${service.brandName || ''} ${service.modelName || ''}`.trim();
      else if (['price', 'publicPrice', 'distributorPrice'].includes(key))
        val = `$${service[key]?.toFixed(2) || '0.00'}`;
      else val = service[key] ? String(service[key]) : '';
      if (val.length > maxLength) maxLength = val.length;
    });
    this.columnWidths[index] = Math.max(100, maxLength * 9 + 65);
    this.cdr.detectChanges();
  }

  get processedServices() {
    let result = this.services.map((s: any) => ({
      ...s,
      deviceName: `${s.brandName || ''} ${s.modelName || ''}`.trim() || 'General',
    }));

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(term) ||
          s.categoryName?.toLowerCase().includes(term) ||
          s.deviceName?.toLowerCase().includes(term),
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
    return Math.ceil(this.processedServices.length / this.itemsPerPage) || 1;
  }
  get paginatedServices() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.processedServices.slice(start, start + this.itemsPerPage);
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

  getEmptyService() {
    return {
      id: '',
      name: '',
      description: '',
      categoryId: null,
      categoryName: '',
      brandId: null,
      brandName: '',
      modelId: null,
      modelName: '',
      price: null,
      publicPrice: null,
      distributorPrice: null,
    };
  }

  openCreateModal() {
    this.modalMode = 'create';
    this.currentService = this.getEmptyService();
    this.closeAllDropdowns();
    this.isModalOpen = true;
  }

  openEditModal(service: any) {
    this.modalMode = 'edit';
    this.currentService = { ...service };
    this.closeAllDropdowns();
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.closeAllDropdowns();
  }

  openDeleteModal(service: any) {
    this.serviceToDelete = service;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.serviceToDelete = null;
  }

  confirmDelete() {
    if (!this.serviceToDelete) return;

    this.catalogService.updateServiceStatus(this.serviceToDelete.id, false).subscribe({
      next: () => {
        this.services = this.services.filter((s) => s.id !== this.serviceToDelete!.id);
        if (this.currentPage > this.totalPages) this.currentPage = this.totalPages || 1;
        this.closeDeleteModal();
        this.triggerSuccessToast();
      },
      error: (err) => console.error('Error al eliminar servicio', err),
    });
  }

  saveService() {
    if (!this.isFormValid) return;

    const payload: SaveServiceRequest = {
      name: this.currentService.name.trim(),
      description: this.currentService.description?.trim() || '',
      categoryId: this.currentService.categoryId || null,
      brandId: this.currentService.brandId || null,
      modelId: this.currentService.modelId || null,
      retailPrice: Number(this.currentService.price),
      publicPrice: Number(this.currentService.publicPrice),
      distributorPrice: Number(this.currentService.distributorPrice),
    };

    if (this.modalMode === 'create') {
      this.catalogService.createService(payload).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
          this.triggerSuccessToast();
        },
        error: (err) => console.error('Error al crear servicio', err),
      });
    } else {
      this.catalogService.updateService(this.currentService.id, payload).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
          this.triggerSuccessToast();
        },
        error: (err) => console.error('Error al actualizar servicio', err),
      });
    }
  }

  closeAllDropdowns() {
    this.isCategoryDropdownOpen = false;
    this.isBrandDropdownOpen = false;
    this.isModelDropdownOpen = false;
  }

  toggleDropdown(type: 'category' | 'brand' | 'model', event: Event) {
    event.stopPropagation();
    this.closeAllDropdowns();
    if (type === 'category') this.isCategoryDropdownOpen = true;
    if (type === 'brand') this.isBrandDropdownOpen = true;
    if (type === 'model') this.isModelDropdownOpen = true;
  }

  selectOption(type: 'category' | 'brand' | 'model', item: any | null) {
    if (type === 'category') {
      this.currentService.categoryId = item?.id || null;
      this.currentService.categoryName = item?.name || '';
    } else if (type === 'brand') {
      this.currentService.brandId = item?.id || null;
      this.currentService.brandName = item?.name || '';
      this.currentService.modelId = null;
      this.currentService.modelName = '';
    } else if (type === 'model') {
      this.currentService.modelId = item?.id || null;
      this.currentService.modelName = item?.name || '';
    }
    this.closeAllDropdowns();
  }

  get filteredModels() {
    if (!this.currentService?.brandId) return this.models;
    return this.models.filter((m) => m.brandId === this.currentService.brandId);
  }

  get isFormValid() {
    return (
      this.currentService?.name?.trim() !== '' &&
      this.currentService?.price !== null &&
      this.currentService?.price !== undefined &&
      this.currentService?.publicPrice !== null &&
      this.currentService?.publicPrice !== undefined &&
      this.currentService?.distributorPrice !== null &&
      this.currentService?.distributorPrice !== undefined
    );
  }

  triggerSuccessToast() {
    this.showSuccessToast = true;
    setTimeout(() => {
      this.showSuccessToast = false;
      this.cdr.detectChanges();
    }, 3000);
  }
}
