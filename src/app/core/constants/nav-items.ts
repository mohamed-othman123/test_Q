export interface NavItem {
  path: string;
  permission: string;
}

export const NAV_ITEMS: NavItem[] = [
  {path: '/dashboard', permission: 'read:statistcs'},
  {path: '/home', permission: 'read:bookings'},
  {path: '/orders', permission: 'read:bookings'},
  {path: '/clients', permission: 'read:hallsClients'},
  {path: '/services', permission: 'read:services'},
  {path: '/purchases', permission: 'read:expenses'},
  {path: '/suppliers', permission: 'read:suppliers'},
  {path: '/refund-requests', permission: 'read:refund requests'},
  {path: '/price-requests', permission: 'read:price-requests'},
  {path: '/admin-lp', permission: 'read:Landing Pages'},

  {path: '/halls', permission: 'read:halls'},
  {path: '/events', permission: 'read:events'},
  {path: '/permissions', permission: 'read:permissions'},
  {path: '/employees', permission: 'read:moderators'},
  {path: '/payment-methods', permission: 'read:paymentMethods'},
  {path: '/purchase-categories', permission: 'read:expense categories'},
  {path: '/expenses-items', permission: 'read:expenseItems'},
  {
    path: '/analytics',
    permission: '',
  },
];
