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
  faGear,
  faBuilding,
  faUsers,
  faBoxesStacked,
  faWrench,
  faCashRegister,
  faUserCircle,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent],
  templateUrl: './layout.html',
})
export class LayoutComponent implements OnInit {
  faGear = faGear;
  isSidebarCollapsed = false;

  menuConfiguracion: SidebarItem[] = [
    { label: 'Perfil', icon: faUserCircle, route: '/settings/profile' },
    {
      label: 'Organización',
      icon: faBuilding,
      subItems: [
        { label: 'Información', route: '/settings/organization' },
        { label: 'Empleados', route: '/settings/organization/users' },
        { label: 'Roles y permisos', route: '/settings/organization/roles' },
      ],
    },
    {
      label: 'Terceros',
      icon: faUsers,
      subItems: [
        { label: 'Clientes', route: '/settings/crm/clients' },
        { label: 'Proveedores', route: '/settings/crm/suppliers' },
      ],
    },
    {
      label: 'Inventario',
      icon: faBoxesStacked,
      subItems: [
        { label: 'Categorías', route: '/settings/inventory/categories' },
        { label: 'Marcas', route: '/settings/inventory/brands' },
        { label: 'Modelos', route: '/settings/inventory/models' },
      ],
    },
    {
      label: 'Reparaciones',
      icon: faWrench,
      subItems: [
        { label: 'Servicios', route: '/settings/repairs/services' },
        { label: 'Estados', route: '/settings/repairs/statuses' },
      ],
    },
    { label: 'Cajas', icon: faCashRegister, route: '/settings/registers' },
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

    this.menuConfiguracion.forEach((item) => {
      item.isActive = false;

      if (item.route && cleanUrl === item.route) {
        item.isActive = true;
      }

      if (item.subItems) {
        item.subItems.forEach((sub) => {
          sub.isActive = cleanUrl === sub.route;
          if (sub.isActive) {
            item.isActive = true;
            item.isExpanded = true;
          }
        });
      }
    });
  }
}
