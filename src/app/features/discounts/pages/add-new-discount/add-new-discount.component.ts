import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {FormMode} from '@core/models';
import {LanguageService} from '@core/services';
import {DrawerService} from '@core/services/drawer.service';
import {DISCOUNT_TYPES} from '@discounts/constants/discounts.constants';
import {Discount} from '@discounts/models/discounts.model';
import {DiscountsService} from '@discounts/services/discounts.service';
import {discountValueValidator} from '@discounts/validators/discount-value.validator';
import {Subject, Subscription, takeUntil} from 'rxjs';

@Component({
    selector: 'app-add-new-discount',
    templateUrl: './add-new-discount.component.html',
    styleUrl: './add-new-discount.component.scss',
    standalone: false
})
export class AddNewDiscountComponent implements OnInit, OnDestroy {
  form = this.fb.group(
    {
      id: [null],
      name: [null, Validators.required],
      type: ['percent', Validators.required],
      value: [null, [Validators.required, Validators.min(0)]],
      note: [null],
    },
    {validators: [discountValueValidator()]},
  );

  @Output() submitted = new EventEmitter<void>();

  discountTypes = DISCOUNT_TYPES;
  discount: Discount | null = null;
  destroy$ = new Subject<void>();
  mode: FormMode = 'add';

  constructor(
    private fb: FormBuilder,
    public drawerService: DrawerService,
    public lang: LanguageService,
    private discountService: DiscountsService,
  ) {}

  ngOnInit(): void {
    this.drawerService.drawerState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        if (state.visible) {
          this.mode = state.mode;
          this.discount = state.data as Discount;
          if (this.discount) {
            this.form.patchValue(this.discount as any);
          }
        } else {
          this.cleanup();
        }
      });
  }

  cleanup() {
    this.form.reset();
    this.discount = null;
    this.mode = 'add';
  }

  getFormControl(name: string) {
    return this.form.get(name) as FormControl;
  }

  submit() {
    const payload = this.createPayload();

    const sendRequest =
      this.mode === 'add'
        ? this.discountService.addNewDiscount(payload)
        : this.discountService.updateDiscount(payload);

    sendRequest.subscribe(() => {
      this.drawerService.close();
      this.cleanup();
      this.submitted.emit();
    });
  }

  createPayload() {
    const data = this.form.value as Discount;

    return {
      ...data,
      value: Number(data.value),
    };
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
