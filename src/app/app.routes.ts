import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { DashboardComponent } from './features/dashboard/pages/dashboard/dashboard.component';
import { OrganizationComponent } from './features/configuration/pages/organization/organization.component';
import { OrganizationsPageComponent } from './features/organizations/pages/organizations/organizations';
import { RolesComponent } from './features/configuration/pages/organization/roles/roles.component';
import { UsersComponent } from './features/configuration/pages/organization/users/users.component';
import { LayoutComponent } from './features/configuration/layout/layout.component';
import { LayoutComponent as InventoryLayoutComponent } from './features/inventory/layout/layout.component';
import { authGuard } from './core/guards/auth-guard';
import { ProfileComponent } from './features/configuration/pages/profile/profile.component';
import { PermissionGuard } from './core/guards/roles-guard';
import { CategoriesComponent } from './features/configuration/pages/inventory/categories/categories.component';
import { BrandsComponent } from './features/configuration/pages/inventory/brands/brands.component';
import { ModelsComponent } from './features/configuration/pages/inventory/models/models.component';
import { ServicesComponent } from './features/configuration/pages/repairs/services/services.component';
import { SuppliersComponent } from './features/configuration/pages/crm/suppliers/suppliers.component';
import { ClientsComponent } from './features/configuration/pages/crm/clients/clients.component';
import { ProductsComponent } from './features/inventory/pages/products/products.component';
import { PurchaseOrdersComponent } from './features/inventory/pages/purchase-orders/purchase-orders.component';
import { MovementsComponent } from './features/inventory/pages/movements/movements.component';
import { ComingSoonComponent } from './features/coming-soon/coming-soon.component';

export const routes: Routes = [
  // canActivate: [authGuard], agregar para proteger rutas que requieran autenticación
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  {
    path: 'inventory',
    component: InventoryLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      {
        path: 'products',
        component: ProductsComponent,
        canActivate: [authGuard, PermissionGuard],
        data: { permission: 'Inventory.View' },
      },
      {
        path: 'purchase-orders',
        component: PurchaseOrdersComponent,
        canActivate: [authGuard, PermissionGuard],
        data: { permission: 'Inventory.View' },
      },
      {
        path: 'movements',
        component: MovementsComponent,
        canActivate: [authGuard, PermissionGuard],
        data: { permission: 'Inventory.View' },
      },
    ],
  },
  {
    path: 'settings',
    component: LayoutComponent,
    children: [
      { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
      { path: 'organization', component: OrganizationComponent, canActivate: [authGuard] },
      {
        path: 'organization/roles',
        component: RolesComponent,
        canActivate: [authGuard, PermissionGuard],
        data: { permission: 'Roles.View' },
      },
      {
        path: 'organization/users',
        component: UsersComponent,
        canActivate: [authGuard, PermissionGuard],
        data: { permission: 'Users.View' },
      },
      {
        path: 'inventory/categories',
        component: CategoriesComponent,
        canActivate: [authGuard, PermissionGuard],
        data: { permission: 'Catalogs.View' },
      },
      {
        path: 'inventory/brands',
        component: BrandsComponent,
        canActivate: [authGuard, PermissionGuard],
        data: { permission: 'Devices.View' },
      },
      {
        path: 'inventory/models',
        component: ModelsComponent,
        canActivate: [authGuard, PermissionGuard],
        data: { permission: 'Devices.View' },
      },
      {
        path: 'repairs/services',
        component: ServicesComponent,
        canActivate: [authGuard, PermissionGuard],
        data: { permission: 'Services.View' },
      },
      {
        path: 'crm/clients',
        component: ClientsComponent,
        canActivate: [authGuard, PermissionGuard],
        data: { permission: 'Customers.View' },
      },
      {
        path: 'crm/suppliers',
        component: SuppliersComponent,
        canActivate: [authGuard, PermissionGuard],
        data: { permission: 'Suppliers.View' },
      },
    ],
  },
  {
    path: 'organizations',
    component: OrganizationsPageComponent,
    canActivate: [authGuard, PermissionGuard],
    data: { permission: 'Organizations.View' },
  },
  {
    path: 'point-of-sale',
    component: ComingSoonComponent,
    canActivate: [authGuard],
    data: { title: 'Punto de venta' },
  },
  {
    path: 'repairs',
    component: ComingSoonComponent,
    canActivate: [authGuard],
    data: { title: 'Reparaciones' },
  },
  {
    path: 'reports',
    component: ComingSoonComponent,
    canActivate: [authGuard],
    data: { title: 'Reportes' },
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login', pathMatch: 'full' },
];
