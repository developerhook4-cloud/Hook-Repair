import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  inject,
  ViewChild,
} from '@angular/core';
import {
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faMagnifyingGlass,
  faPen,
  faPlus,
  faTrashCan,
  faTriangleExclamation,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { IconSearchComponent } from '../../../components/icon-search/icon-search.component';
import { CatalogService } from '../../../services/catalog.service';
import { CategoryRequest, CategoryResponse } from '../../../models/catalog.dto';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, FontAwesomeModule, FormsModule, IconSearchComponent],
  templateUrl: './categories.html',
  host: {
    class: 'flex-1 flex flex-col min-h-0',
  },
})
export class CategoriesComponent {
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

  searchCategoryTerm = '';
  isCategoryDropdownOpen = false;
  isAddCategoryModalOpen = false;
  isDeleteModalOpen = false;
  showSuccessToast = false;

  currentPage = 1;
  itemsPerPage = 5;
  pageInput = 1;

  private categoryService = inject(CatalogService);
  private cdr = inject(ChangeDetectorRef);

  categories: CategoryResponse[] = [];
  selectedCategory: CategoryResponse | null = null;
  categoryToDelete: CategoryResponse | null = null;
  modalMode: 'create' | 'edit' = 'create';

  newCategoryName = '';
  newCategoryIcon = '';

  ngOnInit() {
    this.loadCategories();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      this.isCategoryDropdownOpen = false;
    }
  }

  onIconSelected(iconClass: string) {
    this.newCategoryIcon = iconClass;
  }

  selectCategory(category: CategoryResponse) {
    this.selectedCategory = category;
  }

  scrollToTop() {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (response: any) => {
        this.categories = response.filter((category: CategoryResponse) => category.active);
        if (this.categories.length > 0 && !this.selectedCategory) {
          this.selectCategory(this.categories[0]);
        }
        this.cdr.detectChanges();
      },
    });
  }

  saveNewCategory() {
    const categoryName = this.newCategoryName.trim();
    if (!categoryName) return;

    const payload: CategoryRequest = {
      name: categoryName,
      icon: this.newCategoryIcon,
    };

    this.categoryService.createCategory(payload).subscribe({
      next: () => {
        this.loadCategories();
        this.closeAddCategoryModal();
      },
      error: (err) => console.error('Error al crear categoría', err),
    });
  }

  saveChanges() {
    if (!this.selectedCategory) return;

    const payload: CategoryRequest = {
      name: this.selectedCategory.name,
      icon: this.selectedCategory.icon,
    };

    this.categoryService.updateCategory(this.selectedCategory.id, payload).subscribe({
      next: () => {
        this.loadCategories();
        this.scrollToTop();
        this.showSuccessToast = true;
        setTimeout(() => {
          this.showSuccessToast = false;
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => console.error('Error al actualizar categoría', err),
    });
  }

  openEditModal(category: CategoryResponse) {
    this.selectedCategory = { ...category };
    this.modalMode = 'edit';
    this.isAddCategoryModalOpen = true;
  }

  openDeleteModal(category: CategoryResponse) {
    this.categoryToDelete = category;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.categoryToDelete = null;
  }

  confirmDelete() {
    if (!this.categoryToDelete) return;

    this.categoryService.updateCategoryStatus(this.categoryToDelete.id, false).subscribe({
      next: () => {
        this.categories = this.categories.filter((r) => r.id !== this.categoryToDelete?.id);

        if (this.selectedCategory?.id === this.categoryToDelete?.id && this.categories.length > 0) {
          this.selectCategory(this.categories[0]);
        }

        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages || 1;
        }
        this.closeDeleteModal();
      },
      error: (err) => console.error('Error al eliminar categoría', err),
    });
  }

  openAddCategoryModal() {
    this.newCategoryName = '';
    this.newCategoryIcon = '';
    this.isAddCategoryModalOpen = true;
  }

  closeAddCategoryModal() {
    this.isAddCategoryModalOpen = false;
  }

  updateCategoryName(event: Event) {
    this.newCategoryName = (event.target as HTMLInputElement).value;
  }

  get filteredCategories(): CategoryResponse[] {
    if (!Array.isArray(this.categories)) return [];
    if (!this.searchCategoryTerm) return this.categories;
    const term = this.searchCategoryTerm.toLowerCase();

    return this.categories.filter((r) => r.name?.toLowerCase().includes(term));
  }
  get totalPages() {
    return Math.ceil(this.filteredCategories.length / this.itemsPerPage) || 1;
  }

  get paginatedCategories() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCategories.slice(start, start + this.itemsPerPage);
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
