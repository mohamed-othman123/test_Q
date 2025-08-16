import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SuppliersComponent} from '@suppliers/pages/suppliers/suppliers.component';
import {SupplierFormComponent} from '@suppliers/components/supplier-form/supplier-form.component';

const routes: Routes = [
  {
    path: '',
    component: SuppliersComponent,
    data: {title: 'pageTitles.suppliers'},
  },
  {
    path: 'add-new-supplier',
    component: SupplierFormComponent,
    data: {mode: 'add', title: 'pageTitles.addNewSupplier'},
  },
  {
    path: 'edit/:id',
    component: SupplierFormComponent,
    data: {mode: 'edit', title: 'pageTitles.editSupplier'},
  },
  {
    path: 'view/:id',
    component: SupplierFormComponent,
    data: {mode: 'view', title: 'pageTitles.viewSupplier'},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SuppliersRoutingModule {}
