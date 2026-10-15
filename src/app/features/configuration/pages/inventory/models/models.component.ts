import { Component, OnInit, ChangeDetectorRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faMagnifyingGlass,
  faPlus,
  faPen,
  faTrashCan,
  faTriangleExclamation,
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { CatalogService } from '../../../services/catalog.service';
import { CatalogItemResponse, ModelRequest, ModelResponse } from '../../../models/catalog.dto';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-models',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule],
  templateUrl: './models.html',
  host: { class: 'flex-1 min-h-0 flex flex-col' },
})
export class ModelsComponent implements OnInit {
  faSearch = faMagnifyingGlass;
  faPlus = faPlus;
  faPen = faPen;
  faTrashCan = faTrashCan;
  faTriangleExclamation = faTriangleExclamation;
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;
  faChevronDown = faChevronDown;
  faXmark = faXmark;

  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 5;
  pageInput = 1;

  showSuccessToast = false;
  isModalOpen = false;
  isDeleteModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  isBrandDropdownOpen = false;

  private catalogService = inject(CatalogService);
  private cdr = inject(ChangeDetectorRef);

  models: ModelResponse[] = [];
  availableBrands: CatalogItemResponse[] = [];

  currentModel: any = null;
  modelToDelete: ModelResponse | null = null;

  ngOnInit() {
    this.loadData();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      this.isBrandDropdownOpen = false;
    }
  }

  loadData() {
    forkJoin({
      modelResponse: this.catalogService.getModels(),
      brandResponse: this.catalogService.getBrands(),
    }).subscribe({
      next: ({ modelResponse, brandResponse }) => {
        this.processModelResponse(modelResponse);
        this.processBrandResponse(brandResponse);
      },
      error: (err) => console.error(err),
    });
  }

  private processModelResponse(response: any) {
    const rawModels = Array.isArray(response) ? response : response.models || response.items || [];
    this.models = rawModels.map((u: any) => ({
      ...u,
      status: u.active ? 'Activo' : 'Inactivo',
      brandName: u.brand || u.brandName || 'Sin Marca',
      brandId: u.brandId,
    }));
    this.cdr.detectChanges();
  }

  private processBrandResponse(response: any) {
    const rawBrands = Array.isArray(response) ? response : response.brands || response.items || [];
    this.availableBrands = rawBrands.map((u: any) => ({
      ...u,
      status: u.active ? 'Activo' : 'Inactivo',
    }));
  }

  get processedModels() {
    let result = this.models;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (m) => m.name?.toLowerCase().includes(term) || m.brandName?.toLowerCase().includes(term),
      );
    }
    return result;
  }

  get totalPages() {
    return Math.ceil(this.processedModels.length / this.itemsPerPage) || 1;
  }
  get paginatedModels() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.processedModels.slice(start, start + this.itemsPerPage);
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
    this.currentModel = { id: '', name: '', brandId: '', brandName: '', active: true };
    this.isBrandDropdownOpen = false;
    this.isModalOpen = true;
  }

  openEditModal(model: any) {
    this.modalMode = 'edit';
    this.currentModel = { ...model };
    this.isBrandDropdownOpen = false;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.isBrandDropdownOpen = false;
  }

  openDeleteModal(model: any) {
    this.modelToDelete = model;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.modelToDelete = null;
  }

  confirmDelete() {
    if (!this.modelToDelete) return;
    this.catalogService.updateModelStatus(this.modelToDelete.id, false).subscribe({
      next: () => {
        this.models = this.models.filter((m) => m.id !== this.modelToDelete!.id);
        if (this.currentPage > this.totalPages) this.currentPage = this.totalPages || 1;
        this.closeDeleteModal();
        this.triggerSuccessToast();
      },
      error: (err) => console.error('Error al eliminar modelo', err),
    });
  }

  toggleBrandDropdown(event: Event) {
    event.stopPropagation();
    this.isBrandDropdownOpen = !this.isBrandDropdownOpen;
  }

  selectBrand(brand: any) {
    this.currentModel!.brandId = brand.id;
    this.currentModel!.brandName = brand.name;
    this.isBrandDropdownOpen = false;
  }

  get currentSelectedBrandName(): string {
    return this.currentModel?.brandName || 'Seleccionar marca';
  }

  saveModel() {
    if (!this.currentModel || !this.currentModel.name.trim() || !this.currentModel.brandId) return;

    const payload: ModelRequest = {
      name: this.currentModel.name.trim(),
      brandId: this.currentModel.brandId,
    };

    if (this.modalMode === 'create') {
      this.catalogService.createModel(payload).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
          this.triggerSuccessToast();
        },
        error: (err) => console.error('Error al crear modelo', err),
      });
    } else {
      this.catalogService.updateModel(this.currentModel.id, payload).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
          this.triggerSuccessToast();
        },
        error: (err) => console.error('Error al actualizar modelo', err),
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
