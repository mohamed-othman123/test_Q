import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {FormMode} from '@core/models';
import {requiredIf, requireOneOf} from '@core/validators';
import {HallsService} from '@halls/services/halls.service';
import {InventoryItem} from '@inventory/models/inventory';
import {InventoryService} from '@inventory/services/inventory.service';

@Component({
  selector: 'app-add-new-item',
  standalone: false,
  templateUrl: './add-new-item.component.html',
  styleUrl: './add-new-item.component.scss',
})
export class AddNewItemComponent implements OnInit {
  mode: FormMode = 'add';
  itemId: string | null = null;

  inventoryItemFrom!: FormGroup;

  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private inventoryService: InventoryService,
    private fb: FormBuilder,
    private hallsService: HallsService,
    private router: Router,
  ) {
    this.mode = this.route.snapshot.data['mode'];
    if (this.mode === 'edit') {
      this.itemId = this.route.snapshot.paramMap.get('id');
    }
  }

  ngOnInit(): void {
    if (this.mode === 'edit' && this.itemId) {
      this.inventoryService
        .getInventoryItemById(this.itemId)
        .subscribe((data) => {
          this.initializeForm(data);
          this.isLoading = false;
        });
    } else {
      this.initializeForm();
      this.isLoading = false;
    }
  }

  initializeForm(data?: InventoryItem) {
    this.inventoryItemFrom = this.fb.group(
      {
        name: [
          {value: data?.name || null, disabled: this.mode === 'edit'},
          [Validators.required],
        ],
        name_ar: [
          {value: data?.name_ar || null, disabled: this.mode === 'edit'},
          [Validators.required],
        ],
        quantity: [
          data?.quantity ?? null,
          [Validators.required, Validators.min(0)],
        ],
        unitPrice: [
          {value: data?.unitPrice ?? null, disabled: this.mode === 'edit'},
          [Validators.required, Validators.min(0)],
        ],
        reorderLevel: [
          data?.reorderLevel ?? null,
          [Validators.required, Validators.min(0)],
        ],
        description: [
          {value: data?.description || null, disabled: this.mode === 'edit'},
        ],
        reason: [null, [requiredIf(() => this.mode === 'edit')]],
      },
      {validators: [requireOneOf(['name', 'name_ar'])]},
    );
  }

  getController(name: string) {
    return this.inventoryItemFrom.get(name) as FormControl;
  }

  cancel() {
    this.router.navigate(['inventory']);
  }

  submit() {
    if (this.inventoryItemFrom.invalid) {
      this.inventoryItemFrom.markAllAsTouched();
      return;
    }
    const payload = this.preparePayload();

    const request$ =
      this.mode === 'add'
        ? this.inventoryService.createInventoryItem(payload)
        : this.inventoryService.updateInventoryItem(
            this.itemId as string,
            payload,
          );

    request$.subscribe(() => {
      this.cancel();
    });
  }

  preparePayload() {
    const formValue = this.inventoryItemFrom.getRawValue();
    const payload: Partial<InventoryItem> = {
      name: formValue.name,
      name_ar: formValue.name_ar,
      unitPrice: +formValue.unitPrice,
      quantity: +formValue.quantity,
      reorderLevel: +formValue.reorderLevel,
      description: formValue.description,
      reason: formValue.reason,
      halls:
        this.mode === 'add'
          ? [{id: this.hallsService.getCurrentHall()?.id}]
          : undefined,
      hallId:
        this.mode === 'edit'
          ? this.hallsService.getCurrentHall()?.id
          : undefined,
    };
    return payload;
  }
}
