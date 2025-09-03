import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {InventoryListComponent} from './pages/inventory-list/inventory-list.component';
import {AddNewItemComponent} from './pages/add-new-item/add-new-item.component';
import {ViewItemComponent} from './pages/view-item/view-item.component';

const routes: Routes = [
  {
    path: '',
    component: InventoryListComponent,
    data: {title: 'pageTitles.inventory'},
  },

  {
    path: 'add',
    component: AddNewItemComponent,
    data: {mode: 'add', title: 'pageTitles.addNewItem'},
  },

  {
    path: 'edit/:id',
    component: AddNewItemComponent,
    data: {mode: 'edit', title: 'pageTitles.editItem'},
  },
  {
    path: 'view/:id',
    component: ViewItemComponent,
    data: {title: 'pageTitles.viewInventoryItem'},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventoryRoutingModule {}
