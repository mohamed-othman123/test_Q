import {NgModule} from '@angular/core';
import {PermissionsRoutingModule} from './permissions-routing.module';
import {SharedModule} from '@shared/shared.module';
import {PermissionsComponent} from './pages/permissions/permissions.component';
import {PermissionMatrixComponent} from './components/permission-matrix/permission-matrix.component';
import {PermissionDetailsComponent} from './components/permission-details/permission-details.component';

@NgModule({
  declarations: [
    PermissionsComponent,
    PermissionDetailsComponent,
    PermissionMatrixComponent,
  ],
  imports: [SharedModule, PermissionsRoutingModule],
})
export class PermissionsModule {}
