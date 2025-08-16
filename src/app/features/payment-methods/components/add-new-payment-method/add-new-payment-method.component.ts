import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {FormMode} from '@core/models';
import {DrawerService} from '@core/services/drawer.service';
import {PaymentMethod, PaymentType} from '@paymentmethods/models/payment.model';
import {PaymentMethodsService} from '@paymentmethods/services/payment-methods.service';
import {Subscription} from 'rxjs';
import {HallsService} from '@halls/services/halls.service';
import {Hall} from '@halls/models/halls.model';
import {noDoubleSpaceValidator, requireOneOf} from '@core/validators';

@Component({
    selector: 'app-new-payment-method',
    templateUrl: './add-new-payment-method.component.html',
    styleUrl: './add-new-payment-method.component.scss',
    standalone: false
})
export class AddNewPaymentMethodComponent implements OnInit, OnDestroy {
  paymentMethod: PaymentMethod | null = null;
  currentHall: Hall | null = null;

  @Input() paymentTypes: PaymentType[] = [];
  mode: FormMode = 'add';

  @Output() refreshDataTable = new EventEmitter();
  subs = new Subscription();

  success: boolean = false;

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private paymentMethodsService: PaymentMethodsService,
    public drawerService: DrawerService,
    private hallsService: HallsService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupDrawerSubscription();
    this.setupHallSubscription();
  }

  private setupDrawerSubscription() {
    const drawerSub = this.drawerService.drawerState$.subscribe((state) => {
      if (state.visible) {
        this.mode = state.mode;
        this.paymentMethod = state.data as PaymentMethod;
        if (this.paymentMethod) {
          this.form.patchValue({
            name: this.paymentMethod.name ?? '',
            name_ar: this.paymentMethod.name_ar ?? '',
            description: this.paymentMethod.description ?? '',
          });
        }
      } else {
        this.cleanUp();
      }
    });
    this.subs.add(drawerSub);
  }

  private setupHallSubscription() {
    const hallSub = this.hallsService.currentHall$.subscribe((hall) => {
      this.currentHall = hall;
    });
    this.subs.add(hallSub);
  }

  get f() {
    return this.form.controls;
  }

  cleanUp() {
    this.paymentMethod = null;
    this.form.reset();
  }

  submit(): void {
    if (this.form.invalid || !this.currentHall) {
      return;
    }

    const payload = {
      name: this.form.get('name')?.value || '',
      name_ar: this.form.get('name_ar')?.value || '',
      description: this.form.get('description')?.value || '',
      halls: [
        {
          id: this.currentHall.id,
          name: this.currentHall.name,
        },
      ],
    };

    const submissionApi =
      this.mode === 'add'
        ? this.paymentMethodsService.addPaymentMethod(payload)
        : this.paymentMethodsService.updatePaymentMethod(
            this.paymentMethod?.id!,
            payload,
          );

    const submitSub = submissionApi.subscribe(() => {
      this.drawerService.close();
      this.refreshDataTable.emit();
    });

    this.subs.add(submitSub);
  }

  private initializeForm() {
    this.form = this.fb.group(
      {
        name: ['', [noDoubleSpaceValidator()]],
        name_ar: ['', [noDoubleSpaceValidator()]],
        description: ['', [noDoubleSpaceValidator()]],
      },
      {
        validators: requireOneOf(['name', 'name_ar']),
      },
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
