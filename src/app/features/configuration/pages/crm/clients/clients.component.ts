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
import { ClientService } from '../../../services/client.service';
import { ClientRequest, ClientResponse, CustomerType } from '../../../models/client.dto';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule],
  templateUrl: './clients.html',
  host: { class: 'flex-1 min-h-0 flex flex-col' },
})
export class ClientsComponent implements OnInit {
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

  private clientService = inject(ClientService);
  private cdr = inject(ChangeDetectorRef);

  showSuccessToast = false;
  isModalOpen = false;
  isDeleteModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';

  isTypeDropdownOpen = false;
  isStateDropdownOpen = false;
  isTaxRegimeDropdownOpen = false;
  isExpenseTypeDropdownOpen = false;
  isStatusDropdownOpen = false;

  clients: ClientResponse[] = [];
  availableStatuses = ['Activo', 'Inactivo'];
  availableCustomerTypes = {
    0: 'Cliente',
    1: 'Distribuidor',
  };
  availableStates = [
    'Sonora',
    'Sinaloa',
    'Baja California',
    'Chihuahua',
    'Nuevo León',
    'Jalisco',
    'Ciudad de México',
  ];
  availableTaxRegimes = [
    'General de Ley Personas Morales',
    'Personas Físicas con Actividades Empresariales',
    'Régimen Simplificado de Confianza (RESICO)',
  ];
  availableExpenseTypes = ['Gastos en general', 'Adquisición de mercancías', 'Honorarios médicos'];

  clientToDelete: ClientResponse | null = null;
  currentClient: ClientRequest & {
    id?: string;
    status?: string;
    typeLabel?: string;
    requiresInvoice?: boolean;
  } = this.getEmptyClient();

  isResizing = false;
  currentResizeIndex = -1;
  startX = 0;
  startWidth = 0;
  columnWidths: number[] = [80, 250, 180, 180, 120, 120];

  ngOnInit() {
    this.loadInitialData();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-type')) this.isTypeDropdownOpen = false;
    if (!target.closest('.dropdown-state')) this.isStateDropdownOpen = false;
    if (!target.closest('.dropdown-tax-regime')) this.isTaxRegimeDropdownOpen = false;
    if (!target.closest('.dropdown-expense-type')) this.isExpenseTypeDropdownOpen = false;
    if (!target.closest('.dropdown-status')) this.isStatusDropdownOpen = false;
  }

  getEmptyClient() {
    return {
      id: undefined,
      name: '',
      phone1: '',
      phone2: '',
      customerType: CustomerType.Public,
      typeLabel: 'Público',
      status: 'Activo',
      legalName: '',
      email: '',
      rfc: '',
      taxRegime: '',
      expenseType: '',
      titularName: '',
      authorizedPeople: [],
      address: {
        address: '',
        city: '',
        state: '',
        postCode: '',
        country: 'México',
      },
    };
  }

  loadInitialData() {
    this.clientService.getAll().subscribe({
      next: (data) => {
        this.clients = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar clientes:', err),
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
    if (index >= 5) return;
    const columnKeys: (keyof ClientResponse)[] = ['id', 'name', 'phone1', 'customerType', 'active'];
    const headers = ['ID', 'Nombre', 'Teléfono', 'Tipo de cliente', 'Estado'];

    const key = columnKeys[index];
    let maxLength = headers[index].length;

    this.processedClients.forEach((client) => {
      const val = client[key] !== undefined && client[key] !== null ? String(client[key]) : '';
      if (val.length > maxLength) {
        maxLength = val.length;
      }
    });

    const newWidth = Math.max(80, maxLength * 9 + 65);
    this.columnWidths[index] = newWidth;
    this.cdr.detectChanges();
  }

  get processedClients() {
    let result = this.clients;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          String(c.id).toLowerCase().includes(term) ||
          c.name?.toLowerCase().includes(term) ||
          c.phone1?.toLowerCase().includes(term) ||
          c.email?.toLowerCase().includes(term),
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
    return Math.ceil(this.processedClients.length / this.itemsPerPage) || 1;
  }

  get paginatedClients() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.processedClients.slice(start, start + this.itemsPerPage);
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
    this.currentClient = this.getEmptyClient();
    this.isModalOpen = true;
  }

  openEditModal(client: ClientResponse) {
    this.modalMode = 'edit';
    this.currentClient = {
      ...client,
      typeLabel: client.customerType === CustomerType.Distributor ? 'Distribuidor' : 'Público',
      status: client.active ? 'Activo' : 'Inactivo',
      address: client.address
        ? { ...client.address }
        : { address: '', city: '', state: '', postCode: '', country: 'México' },
    };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.isTypeDropdownOpen = false;
    this.isStateDropdownOpen = false;
    this.isTaxRegimeDropdownOpen = false;
    this.isExpenseTypeDropdownOpen = false;
    this.isStatusDropdownOpen = false;
  }

  openDeleteModal(client: ClientResponse) {
    this.clientToDelete = client;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.clientToDelete = null;
  }

  confirmDelete() {
    if (!this.clientToDelete) return;

    this.clientService.updateStatus(this.clientToDelete.id, false).subscribe({
      next: () => {
        this.loadInitialData();
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages || 1;
        }
        this.closeDeleteModal();
        this.triggerSuccessToast();
      },
      error: (err) => console.error('Error al eliminar cliente:', err),
    });
  }

  toggleTypeDropdown(event: Event) {
    event.stopPropagation();
    this.isTypeDropdownOpen = !this.isTypeDropdownOpen;
    this.isStateDropdownOpen = false;
    this.isTaxRegimeDropdownOpen = false;
    this.isExpenseTypeDropdownOpen = false;
    this.isStatusDropdownOpen = false;
  }

  selectType(type: number) {
    this.currentClient.typeLabel = type === 1 ? 'Distribuidor' : 'Público';
    this.currentClient.customerType = type === 1 ? CustomerType.Distributor : CustomerType.Public;
    this.isTypeDropdownOpen = false;
  }

  toggleStateDropdown(event: Event) {
    event.stopPropagation();
    this.isStateDropdownOpen = !this.isStateDropdownOpen;
    this.isTypeDropdownOpen = false;
    this.isTaxRegimeDropdownOpen = false;
    this.isExpenseTypeDropdownOpen = false;
    this.isStatusDropdownOpen = false;
  }

  selectState(state: string) {
    if (!this.currentClient.address) {
      this.currentClient.address = {};
    }
    this.currentClient.address.state = state;
    this.isStateDropdownOpen = false;
  }

  toggleTaxRegimeDropdown(event: Event) {
    event.stopPropagation();
    this.isTaxRegimeDropdownOpen = !this.isTaxRegimeDropdownOpen;
    this.isTypeDropdownOpen = false;
    this.isStateDropdownOpen = false;
    this.isExpenseTypeDropdownOpen = false;
    this.isStatusDropdownOpen = false;
  }

  selectTaxRegime(regime: string) {
    this.currentClient.taxRegime = regime;
    this.isTaxRegimeDropdownOpen = false;
  }

  toggleExpenseTypeDropdown(event: Event) {
    event.stopPropagation();
    this.isExpenseTypeDropdownOpen = !this.isExpenseTypeDropdownOpen;
    this.isTypeDropdownOpen = false;
    this.isStateDropdownOpen = false;
    this.isTaxRegimeDropdownOpen = false;
    this.isStatusDropdownOpen = false;
  }

  selectExpenseType(type: string) {
    this.currentClient.expenseType = type;
    this.isExpenseTypeDropdownOpen = false;
  }

  get isFormValid() {
    return (
      !!this.currentClient.name &&
      this.currentClient.name.trim() !== '' &&
      !!this.currentClient.phone1 &&
      this.currentClient.phone1.trim() !== ''
    );
  }

  saveClient() {
    if (!this.isFormValid) return;

    const requestPayload: ClientRequest = {
      name: this.currentClient.name,
      customerType: this.currentClient.customerType,
      phone1: this.currentClient.phone1,
      phone2: this.currentClient.phone2,
      legalName: this.currentClient.legalName,
      email: this.currentClient.email,
      address: this.currentClient.address,
      titularName: this.currentClient.titularName,
      authorizedPeople: this.currentClient.authorizedPeople,
      rfc: this.currentClient.rfc,
      taxRegime: this.currentClient.taxRegime,
      expenseType: this.currentClient.expenseType,
    };

    if (this.modalMode === 'create') {
      this.clientService.create(requestPayload).subscribe({
        next: () => {
          this.loadInitialData();
          this.closeModal();
          this.triggerSuccessToast();
        },
        error: (err) => console.error('Error al crear cliente:', err),
      });
    } else if (this.currentClient.id) {
      this.clientService.update(this.currentClient.id, requestPayload).subscribe({
        next: () => {
          this.loadInitialData();
          this.closeModal();
          this.triggerSuccessToast();
        },
        error: (err) => console.error('Error al actualizar cliente:', err),
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
