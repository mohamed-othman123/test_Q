import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {authGuard} from '@core/guards';
import {permissionsGuard} from '@core/guards/permissions.guard';
import {ForbiddenComponent} from '@shared/components/forbidden/forbidden.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: ':template/preview',
    loadChildren: () =>
      import('./features/pdf-preview/pdf-preview.module').then(
        (m) => m.PdfPreviewModule,
      ),
  },
  {
    path: 'home',
    loadChildren: () =>
      import('@calendar/booking-calendar.module').then(
        (m) => m.BookingCalendarModule,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('@dashboard/dashboard.module').then((m) => m.DashboardModule),
    canActivate: [authGuard],
  },
  {
    path: 'lp/:hallName',
    loadChildren: () =>
      import('./landing-page/landing-page.module').then(
        (m) => m.LandingPageModule,
      ),
  },
  {
    path: 'clients',
    loadChildren: () =>
      import('@clients/clients.module').then((m) => m.ClientsModule),
    canActivate: [authGuard, permissionsGuard],
    data: {
      permissions: ['Clients'],
    },
  },
  {
    path: 'services',
    loadChildren: () =>
      import('@services/services.module').then((m) => m.ServicesModule),
    canActivate: [authGuard, permissionsGuard],
    data: {
      permissions: ['Services'],
    },
  },
  {
    path: 'employees',
    loadChildren: () =>
      import('@employees/employees.module').then((m) => m.EmployeesModule),
    canActivate: [authGuard, permissionsGuard],
    data: {
      permissions: ['Employees'],
    },
  },
  {
    path: 'halls',
    loadChildren: () =>
      import('@halls/halls.module').then((m) => m.HallsModule),
    canActivate: [authGuard, permissionsGuard],
    data: {
      permissions: ['Halls'],
    },
  },
  {
    path: 'events',
    loadChildren: () =>
      import('@events/events.module').then((m) => m.EventsModule),
    canActivate: [authGuard, permissionsGuard],
    data: {
      permissions: ['Events'],
    },
  },
  {
    path: 'payment-methods',
    loadChildren: () =>
      import('@paymentmethods/payment-methods.module').then(
        (m) => m.PaymentMethodsModule,
      ),
    canActivate: [authGuard, permissionsGuard],
    data: {
      permissions: ['Payment Methods'],
    },
  },
  {
    path: 'permissions',
    loadChildren: () =>
      import('@permissions/permissions.module').then(
        (m) => m.PermissionsModule,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'orders',
    loadChildren: () =>
      import('@orders/orders.module').then((m) => m.OrdersModule),
    canActivate: [authGuard, permissionsGuard],
    data: {
      permissions: ['Bookings'],
    },
  },
  {
    path: 'details-and-payment',
    loadChildren: () =>
      import('@payment/payment.module').then((m) => m.PaymentModule),
    canActivate: [authGuard, permissionsGuard],
    data: {
      permissions: ['Payments', 'Bookings'],
    },
  },
  {
    path: 'suppliers',
    loadChildren: () =>
      import('@suppliers/suppliers.module').then((m) => m.SuppliersModule),
    canActivate: [authGuard, permissionsGuard],
    data: {
      permissions: ['Expenses & Suppliers'],
    },
  },
  {
    path: 'purchases',
    loadChildren: () =>
      import('@purchases/purchases.module').then((m) => m.PurchasesModule),
    canActivate: [authGuard, permissionsGuard],
    data: {
      permissions: ['Expenses'],
    },
  },
  {
    path: 'purchase-categories',
    loadChildren: () =>
      import('@purchase-categories/purchase-categories.module').then(
        (m) => m.PurchaseCategoriesModule,
      ),
    canActivate: [authGuard, permissionsGuard],
    data: {
      permissions: ['Expense Category'],
    },
  },
  {
    path: 'refund-requests',
    loadChildren: () =>
      import('@refund-requests/refund-requests.module').then(
        (m) => m.RefundRequestModule,
      ),
    canActivate: [authGuard, permissionsGuard],
    data: {
      permissions: ['Refund Requests'],
    },
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('@profile/profile.module').then((m) => m.ProfileModule),
    canActivate: [authGuard],
  },
  {
    path: 'organization-info',
    loadChildren: () =>
      import('@organization-info/organization-info.module').then(
        (m) => m.OrganizationInfoModule,
      ),
    canActivate: [authGuard],
  },
  // {
  //   path: 'forbidden',
  //   component: ForbiddenComponent,
  // },
  {
    path: 'admin-lp',
    loadChildren: () =>
      import('@admin-landing-page/admin-landing-page.module').then(
        (m) => m.AdminLandingPageModule,
      ),
    canActivate: [authGuard],
  },

  {
    path: 'price-requests',
    loadChildren: () =>
      import('./features/price-request/price-request.module').then(
        (m) => m.PriceRequestsModule,
      ),
    canActivate: [authGuard, permissionsGuard],
    data: {
      permissions: ['Price Requests'],
    },
  },
  {
    path: 'expenses-items',
    loadChildren: () =>
      import('./features/expenses-items/expenses-items.module').then(
        (m) => m.ExpensesItemsModule,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'discounts',
    loadChildren: () =>
      import('./features/discounts/discounts.module').then(
        (m) => m.DiscountsModule,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'analytics',
    loadChildren: () =>
      import('./features/analytics/analytics.module').then(
        (m) => m.AnalyticsModule,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'ai-chat',
    loadChildren: () => import('./features/chat/chat-routing.module').then(m => m.ChatRoutingModule),
    canActivate: [authGuard],
    data: {
      title: 'AI Assistant',
    }
  },
  {
    path: 'customer-signature',
    loadChildren: () =>
      import('./features/customer-signature/customer-signature.module').then(
        (m) => m.CustomerSignatureModule,
      ),
  },
  {
    path: 'forbidden',
    component: ForbiddenComponent,
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules}),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
