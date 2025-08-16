import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FormMode, Item} from '@core/models';
import {DrawerService} from '@core/services/drawer.service';
import {noDoubleSpaceValidator, requireOneOf} from '@core/validators';
import {Hall} from '@halls/models/halls.model';
import {HallsService} from '@halls/services/halls.service';
import {TranslateService} from '@ngx-translate/core';
import {PurchaseCategory} from '@purchase-categories/models/purchase-category.model';
import {PurchaseCategoriesService} from '@purchase-categories/services/purchase-categories.service';
import {ExpensesType} from '@purchases/constants/purchase.constants';

@Component({
    selector: 'purchase-categories-form',
    templateUrl: './purchase-categories-form.component.html',
    styleUrls: ['./purchase-categories-form.component.scss'],
    standalone: false
})
export class PurchaseCategoriesFormComponent implements OnInit {
  purchaseCategory: PurchaseCategory | null = null;
  form!: FormGroup;
  expenseTypes: Item[] = ExpensesType;
  currentHall: Hall | null = null;

  mode: FormMode = 'add';
  @Output() refreshDataTable = new EventEmitter();

  constructor(
    private readonly fb: FormBuilder,
    public translate: TranslateService,
    private hallsService: HallsService,
    private readonly purchaseCategoryService: PurchaseCategoriesService,
    public drawerService: DrawerService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupDrawerSubscription();
    this.setupHallSubscription();
  }

  get f() {
    return this.form.controls;
  }

  private setupHallSubscription() {
    this.hallsService.currentHall$.subscribe((hall) => {
      this.currentHall = hall;
    });
  }

  private setupDrawerSubscription() {
    this.drawerService.drawerState$.subscribe((state) => {
      if (state.visible) {
        this.mode = state.mode;
        this.purchaseCategory = state.data as PurchaseCategory;
        if (this.purchaseCategory) {
          this.form.patchValue({
            name: this.purchaseCategory.name ?? null,
            name_ar: this.purchaseCategory.name_ar ?? null,
            description: this.purchaseCategory.description ?? null,
            type: this.purchaseCategory.type ?? null,
          });
        }
      } else {
        this.cleanUp();
      }
    });
  }

  cleanUp() {
    this.purchaseCategory = null;
    this.form.reset();
  }

  private initializeForm() {
    this.form = this.fb.group(
      {
        name: [null, [noDoubleSpaceValidator]],
        name_ar: [null, [noDoubleSpaceValidator]],
        description: [null, [Validators.required]],
        type: [null, Validators.required],
      },
      {
        validators: requireOneOf(['name', 'name_ar']),
      },
    );
  }

  submit(): void {
    if (this.form.invalid || !this.currentHall) {
      return;
    }

    const payload = {
      name: this.form.get('name')?.value || '',
      name_ar: this.form.get('name_ar')?.value || '',
      description: this.form.get('description')?.value || '',
      type: this.form.get('type')?.value || '',
      halls: [
        {
          id: this.currentHall.id,
          name: this.currentHall.name,
        },
      ],
    };

    const submissionApi =
      this.mode === 'add'
        ? this.purchaseCategoryService.create(payload)
        : this.purchaseCategoryService.update(
            this.purchaseCategory?.id!,
            payload,
          );

    submissionApi.subscribe(() => {
      this.drawerService.close();
      this.refreshDataTable.emit();
    });
  }
}
