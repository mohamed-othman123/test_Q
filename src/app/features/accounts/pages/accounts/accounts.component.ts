import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {PermissionTypes} from '@auth/models';
import {AccountData, AccountNode} from '@accounts/models/accounts';
import {AccountsService} from '@accounts/services/accounts.service';
import {AuthService, LanguageService} from '@core/services';
import {DrawerService} from '@core/services/drawer.service';
import {PermissionsService} from '@core/services/permissions.service';
import {prepareDataForExport} from '@accounts/utils/prepare-data-for-export';
import {ExcelService} from '@core/services/excel.service';

@Component({
  selector: 'app-accounts',
  standalone: false,
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.scss',
})
export class AccountsComponent implements OnInit {
  accountsList: AccountNode[] = [];

  filterForm: FormGroup;

  filters = {
    sortOrder: 'ASC',
    sortBy: 'accountCode',
  };

  constructor(
    public lang: LanguageService,
    private fb: FormBuilder,
    private drawerService: DrawerService,
    private router: Router,
    private accountsService: AccountsService,
    public permissionsService: PermissionsService,
    private auth: AuthService,
    private excelService: ExcelService,
  ) {
    this.filterForm = this.fb.group({
      name: [null],
      accountCode: [null],
      accountLevel: [null],
    });
  }

  ngOnInit(): void {
    this.getAccountsTree();
  }

  getAccountsTree() {
    this.accountsService.getAccountsTree(this.filters).subscribe({
      next: (res) => {
        this.accountsList = res;
      },
    });
  }

  refreshData() {
    this.getAccountsTree();
  }

  searchTheTree() {
    const value = this.filterForm.value;
    // Build filters object with only fields that have a value
    this.filters = Object.keys(value)
      .filter((key) => value[key] !== null && value[key] !== '')
      .reduce((obj, key) => {
        obj[key] = value[key];
        return obj;
      }, {} as any);

    if (Object.keys(this.filters).length === 0) return;

    this.getAccountsTree();
  }

  clearFilters() {
    this.filterForm.reset();
    this.filters = {
      sortOrder: 'ASC',
      sortBy: 'accountCode',
    };
    this.getAccountsTree();
  }

  toggleRow(rowNode: any) {
    if (!rowNode.node.children) {
      return;
    }
    rowNode.node.expanded = !rowNode.node.expanded;
    this.accountsList = [...this.accountsList];
  }

  collapseAll() {
    this.forEachNode(this.accountsList, (n) => (n.expanded = false));
    this.refresh();
  }

  private forEachNode(nodes: AccountNode[], fn: (n: AccountNode) => void) {
    for (const n of nodes) {
      fn(n);
      if (n.children?.length) this.forEachNode(n.children, fn);
    }
  }

  refresh() {
    this.accountsList = [...this.accountsList];
  }

  addNewAccount(account?: AccountNode) {
    const parentAccount = account
      ? {...account?.data, children: account?.children}
      : null;

    this.drawerService.open({
      mode: 'add',
      title: 'chartOfAccounts.addNewAccount',
      data: {parentAccount},
    });
  }

  editAccount(account: AccountData) {
    this.drawerService.open({
      mode: 'edit',
      title: 'chartOfAccounts.editAccount',
      data: {account: account},
    });
  }

  viewAccountTree(account: AccountData) {
    this.router.navigate(['accounts/view', account.id]);
  }

  deleteAccount(id: number) {
    console.log('deleting account', id);
    this.accountsService.deleteAccount(id).subscribe({
      next: () => {
        this.refreshData();
      },
    });
  }

  viewTree() {
    this.router.navigate(['accounts/view/tree']);
  }

  exportToExcel() {
    const flattenData = prepareDataForExport(this.accountsList, this.lang.lang);
    this.excelService.exportAsExcelFile(flattenData, 'Chart_of_Accounts', {
      rtl: this.lang.lang === 'ar',
    });
  }

  hasPermissionTo(action: 'update' | 'delete' | 'add', account: AccountData) {
    const isOwner = account.created_by === this.auth.userData?.user.userId;
    const canEdit =
      isOwner ||
      this.auth.userData?.user.permissionType === PermissionTypes.GENERAL;
    const canModify = account.accountLevel! > 2;

    switch (action) {
      case 'update':
        return (
          canEdit &&
          canModify &&
          this.permissionsService.hasPermission('update:accounts')
        );
      case 'delete':
        return (
          canEdit &&
          canModify &&
          this.permissionsService.hasPermission('delete:accounts')
        );
      case 'add':
        return this.permissionsService.hasPermission('create:accounts');
      default:
        return false;
    }
  }
}
