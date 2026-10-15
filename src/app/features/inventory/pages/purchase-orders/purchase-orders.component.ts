import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
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
  faChevronLeft,
  faChevronRight,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import { forkJoin } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { SupplierService } from '../../../configuration/services/supplier.service';
import { PurchaseOrderResponse } from '../../models/purchase-order.dto';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule],
  templateUrl: './purchase-orders.html',
  host: { class: 'flex-1 min-h-0 flex flex-col' },
})
export class PurchaseOrdersComponent implements OnInit {
  faSearch = faMagnifyingGlass;
  faPlus = faPlus;
  faPen = faPen;
  faTrashCan = faTrashCan;
  faEllipsis = faEllipsis;
  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;
  faXmark = faXmark;
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;
  faChevronDown = faChevronDown;

  searchTerm = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  currentPage = 1;
  itemsPerPage = 5;
  pageInput = 1;

  isModalOpen = false;
  isDetailsModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  showSuccessToast = false;

  isSupplierDropdownOpen = false;
  isPaymentStatusDropdownOpen = false;
  isOrderStatusDropdownOpen = false;

  productService = inject(ProductService);
  purchaseOrderService = inject(PurchaseOrderService);
  supplierService = inject(SupplierService);
  authService = inject(AuthService);

  public session = this.authService.currentUser;

  orders: PurchaseOrderResponse[] = [];
  currentOrder: any = this.getEmptyOrder();
  orderToView: any = null;

  suppliers: any[] = [];
  paymentStatuses = ['Sin pagar', 'Pagado'];
  orderStatuses = [
    'Pendiente',
    'En espera',
    'En progreso',
    'Recibido parcialmente',
    'Recibido',
    'En RMA',
    'Cancelado',
  ];

  products: any[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  get isAnyProductDropdownOpen(): boolean {
    return this.currentOrder.lines.some((l: any) => l.dropdownOpen);
  }

  closeAllDropdowns() {
    this.isSupplierDropdownOpen = false;
    this.isPaymentStatusDropdownOpen = false;
    this.isOrderStatusDropdownOpen = false;
    this.currentOrder.lines.forEach((l: any) => (l.dropdownOpen = false));
  }

  toggleSupplierDropdown(event: Event) {
    event.stopPropagation();
    const wasOpen = this.isSupplierDropdownOpen;
    this.closeAllDropdowns();
    this.isSupplierDropdownOpen = !wasOpen;
  }

  togglePaymentStatusDropdown(event: Event) {
    event.stopPropagation();
    const wasOpen = this.isPaymentStatusDropdownOpen;
    this.closeAllDropdowns();
    this.isPaymentStatusDropdownOpen = !wasOpen;
  }

  toggleOrderStatusDropdown(event: Event) {
    event.stopPropagation();
    const wasOpen = this.isOrderStatusDropdownOpen;
    this.closeAllDropdowns();
    this.isOrderStatusDropdownOpen = !wasOpen;
  }

  toggleProductDropdown(line: any, event: Event) {
    event.stopPropagation();
    const wasOpen = line.dropdownOpen;
    this.closeAllDropdowns();
    line.dropdownOpen = !wasOpen;
  }

  getProductObj(id: string) {
    return this.products.find((p) => p.id === id) || { id: '', name: '', price: 0 };
  }

  getEmptyOrder() {
    return {
      id: null,
      supplierName: '',
      createdAtUtc: new Date().toISOString().split('T')[0],
      userName: this.session()?.user.name,
      paymentStatus: 'Sin pagar',
      status: 'Pendiente',
      lines: [],
      total: 0,
    };
  }

  loadData() {
    forkJoin({
      products: this.productService.getAll(),
      purchaseOrders: this.purchaseOrderService.getAll(),
      suppliers: this.supplierService.getAll(),
    }).subscribe(({ products, purchaseOrders, suppliers }) => {
      this.products = products;
      this.orders = purchaseOrders;
      this.suppliers = suppliers;
    });

    console.log(this.suppliers);
  }

  sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  get processedOrders() {
    let result = this.orders;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (o) =>
          String(o.id).toLowerCase().includes(term) ||
          o.supplierName?.toLowerCase().includes(term) ||
          o.userName?.toLowerCase().includes(term),
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
    return Math.ceil(this.processedOrders.length / this.itemsPerPage) || 1;
  }
  get paginatedOrders() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.processedOrders.slice(start, start + this.itemsPerPage);
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
    this.currentOrder = this.getEmptyOrder();
    this.addLine();
    this.isModalOpen = true;
  }

  openEditModal(order: any) {
    this.modalMode = 'edit';
    this.currentOrder = JSON.parse(JSON.stringify(order));
    if (!this.currentOrder.lines || this.currentOrder.lines.length === 0) {
      this.addLine();
    }
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.closeAllDropdowns();
  }

  openDetailsModal(order: any) {
    this.orderToView = order;
    this.isDetailsModalOpen = true;
  }

  closeDetailsModal() {
    this.isDetailsModalOpen = false;
    this.orderToView = null;
  }

  formatDateInSpanish(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parts[0];
    const monthStr = parts[1];
    const day = parts[2];
    const months = [
      'ENERO',
      'FEBRERO',
      'MARZO',
      'ABRIL',
      'MAYO',
      'JUNIO',
      'JULIO',
      'AGOSTO',
      'SEPTIEMBRE',
      'OCTUBRE',
      'NOVIEMBRE',
      'DICIEMBRE',
    ];
    const month = months[parseInt(monthStr, 10) - 1];
    return `${day} ${month} ${year}`;
  }

  addLine() {
    this.currentOrder.lines.push({
      productId: '',
      productName: '',
      quantity: 1,
      unitCost: 0,
      lineTotal: 0,
      dropdownOpen: false,
    });
    this.calculateTotal();
  }

  removeLine(index: number) {
    this.currentOrder.lines.splice(index, 1);
    this.calculateTotal();
  }

  selectProductForLine(line: any, product: any) {
    line.productId = product.id;
    line.productName = product.name;
    line.price = product.price;
    line.dropdownOpen = false;
    this.updateLineTotal(line);
  }

  updateLineTotal(line: any) {
    if (line.quantity < 1) line.quantity = 1;
    if (line.price < 0) line.price = 0;
    line.lineTotal = line.quantity * line.price;
    this.calculateTotal();
  }

  calculateTotal() {
    this.currentOrder.total = this.currentOrder.lines.reduce(
      (acc: number, line: any) => acc + (line.lineTotal || 0),
      0,
    );
  }

  get isFormValid() {
    return (
      this.currentOrder.supplier !== '' &&
      this.currentOrder.lines.length > 0 &&
      this.currentOrder.lines.every((l: any) => l.productId !== '')
    );
  }

  saveOrder() {
    if (!this.isFormValid) return;

    const payload = {
      supplierId: this.currentOrder.supplierId,
      products: this.currentOrder.lines,
    };

    if (this.modalMode === 'create') {
      this.purchaseOrderService.create(payload).subscribe({
        next: () => {
          this.loadData();
          this.closeModal();
        },
        error: (err) => console.error('Error al crear producto', err),
      });
    } else {
      const index = this.orders.findIndex((o) => o.id === this.currentOrder.id);
      if (index !== -1) {
        this.orders[index] = { ...this.currentOrder };
      }
    }

    this.closeModal();
    this.showSuccessToast = true;
    setTimeout(() => {
      this.showSuccessToast = false;
      this.cdr.detectChanges();
    }, 3000);
  }
}
