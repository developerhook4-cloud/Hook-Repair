import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import {
  SidebarComponent,
  SidebarItem,
} from '../../../shared/components/sidebar/sidebar.component';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import {
  faBoxesStacked,
  faBoxOpen,
  faCartShopping,
  faFileInvoice,
  faRotateLeft,
  faStar,
  faLayerGroup,
  faClipboardList,
  faHandshake,
  faLeftRight,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-inventory-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent],
  templateUrl: './layout.html',
})
export class LayoutComponent implements OnInit {
  faBoxesStacked = faBoxesStacked;
  isSidebarCollapsed = false;

  menuInventario: SidebarItem[] = [
    { label: 'Productos', icon: faBoxOpen, route: '/inventory/products' },
    { label: 'Movimientos', icon: faLeftRight, route: '/inventory/movements' },
    { label: 'Órdenes de compra', icon: faCartShopping, route: '/inventory/purchase-orders' },
    { label: 'GRN', icon: faFileInvoice, route: '/inventory/grn' },
    { label: 'RMA', icon: faHandshake, route: '/inventory/rma' },
    { label: 'Órdenes especiales', icon: faStar, route: '/inventory/special-orders' },
    { label: 'Bundles', icon: faLayerGroup, route: '/inventory/bundles' },
    { label: 'Conteo de inventario', icon: faClipboardList, route: '/inventory/stock-count' },
  ];

  constructor(private router: Router) {}

  onSidebarToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }

  ngOnInit() {
    this.updateActiveMenu(this.router.url);
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateActiveMenu(event.urlAfterRedirects);
      });
  }

  updateActiveMenu(currentUrl: string) {
    const cleanUrl = currentUrl.split('?')[0];
    this.menuInventario.forEach((item) => {
      item.isActive = false;
      if (item.route && cleanUrl.includes(item.route)) {
        item.isActive = true;
      }
    });
  }
}
