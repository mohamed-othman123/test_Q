import {
  Directive,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import {PermissionsService} from '@core/services/permissions.service';
import {Subscription} from 'rxjs';

/**
 * A directive that conditionally includes elements based on user permissions.
 *
 * Usage examples:
 *
 * To show content when user has a specific permission:
 * <div *appHasPermission="'create:purchase payments'">...</div>
 *
 * To show content with multiple permissions (ANY logic):
 * <div *appHasPermission="['update:purchase payments', 'delete:purchase payments']">...</div>
 *
 * To specify both module and permission type without using full permission name:
 * <div *appHasPermission="{module: 'Purchase payments', type: 'CREATE'}">...</div>
 */
@Directive({
    selector: '[appHasPermission]',
    standalone: false
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private hasView = false;
  private permissionSubscription: Subscription | null = null;

  @Input('appHasPermission') permissionInput!:
    | string
    | string[]
    | {module: string; type: string};

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionsService: PermissionsService,
  ) {}

  ngOnInit() {
    this.updateView();

    if (this.permissionsService.permissionsChanged$) {
      this.permissionSubscription =
        this.permissionsService.permissionsChanged$.subscribe(() => {
          this.updateView();
        });
    }
  }

  ngOnDestroy() {
    if (this.permissionSubscription) {
      this.permissionSubscription.unsubscribe();
    }
  }

  private updateView() {
    const hasPermission = this.checkPermission();

    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  private checkPermission(): boolean {
    if (!this.permissionInput) {
      return false;
    }

    if (
      typeof this.permissionInput === 'object' &&
      !Array.isArray(this.permissionInput)
    ) {
      const {module, type} = this.permissionInput;
      return this.permissionsService.hasPermissionByModuleAndType(module, type);
    }

    if (Array.isArray(this.permissionInput)) {
      return this.permissionInput.some((permission) => {
        return this.permissionsService.hasPermission(permission);
      });
    }

    return this.permissionsService.hasPermission(this.permissionInput);
  }
}
