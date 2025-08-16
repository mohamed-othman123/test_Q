import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {LanguageService} from '@core/services';
import {noDoubleSpaceValidator} from '@core/validators';
import {Event} from '@events/models/events.model';
import {
  ContractDTO,
  CreateContractRequest,
  CUSTOMER_TYPES,
  HallContract,
  UpdateContractRequest,
} from '@halls/models/hall-contract.model';
import {Hall} from '@halls/models/halls.model';
import {FormStateService} from '@halls/services/form-state.service';
import {HallContractsService} from '@halls/services/hall-contracts.service';
import {Observable, Subject, takeUntil} from 'rxjs';

@Component({
    selector: 'app-edit-contract',
    templateUrl: './edit-contract.component.html',
    styleUrl: './edit-contract.component.scss',
    standalone: false
})
export class EditContractComponent implements OnInit, OnDestroy {
  @Input() isEditMode!: boolean;
  @Input() hallId!: string;
  @Input() hallData!: Hall;
  @Input() eventTypes!: Event[];
  @Input() editedContract: HallContract | null = null;

  @Output() closeForm = new EventEmitter<void>();

  customerTypes = CUSTOMER_TYPES;

  isLoading = true;

  showImagePopup: boolean = false;
  selectedImg: string | null = null;

  contractForm = this.fb.group({
    eventId: new FormControl<number[] | null>(null, [
      Validators.required,
      noDoubleSpaceValidator(),
    ]),
    customerType: new FormControl<string[] | null>(null, [
      Validators.required,
      noDoubleSpaceValidator(),
    ]),
    terms_and_conditions_ar: ['', noDoubleSpaceValidator()],
    terms_and_conditions_en: ['', noDoubleSpaceValidator()],
    firstPartySignature: [false],
    firstPartyStamp: [false],
    secondPartySignature: [false],
  });

  destroy$ = new Subject<void>();
  ignoreNextChange = false;

  constructor(
    private fb: FormBuilder,
    public lang: LanguageService,
    private hallContractsService: HallContractsService,
    private formStateService: FormStateService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.initFormListeners();
  }

  initializeForm() {
    if (this.isEditMode && this.editedContract) {
      this.contractForm.patchValue({
        eventId: [this.editedContract.event.id],
        customerType: [this.editedContract.customerType],
        terms_and_conditions_ar: this.editedContract.terms_and_conditions_ar,
        terms_and_conditions_en: this.editedContract.terms_and_conditions_en,
        firstPartySignature: this.editedContract.firstPartySignature,
        firstPartyStamp: this.editedContract.firstPartyStamp,
        secondPartySignature: this.editedContract.secondPartySignature,
      });

      this.contractForm.get('customerType')?.disable();
      this.contractForm.get('eventId')?.disable();
    }
    this.isLoading = false;
  }

  initFormListeners() {
    this.contractForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.formStateService.markTabAsDirty(3);
      });
  }

  submitContract() {
    if (this.contractForm.invalid) {
      this.contractForm.markAllAsTouched();
      return;
    }

    const payload = this.isEditMode
      ? this.generateUpdatePayload()
      : this.generateCreatePayload();

    const request = this.isEditMode
      ? this.hallContractsService.updateContract(
          this.editedContract!.id,
          payload as UpdateContractRequest,
        )
      : this.hallContractsService.createContract(
          +this.hallId,
          payload as CreateContractRequest,
        );

    (request as Observable<HallContract>).subscribe(() => {
      this.formStateService.markTabAsClean(3);
      this.closeForm.emit();
    });
  }

  generateCreatePayload(): CreateContractRequest {
    const values = this.contractForm.value;

    const contractsInfo: ContractDTO[] = [];

    values.eventId?.forEach((eventId) => {
      for (let customerType of values.customerType!) {
        contractsInfo.push({
          eventId,
          customerType,
          terms_and_conditions_ar: values.terms_and_conditions_ar || null,
          terms_and_conditions_en: values.terms_and_conditions_en || null,
        });
      }
    });

    return {
      contractsInfo,
      firstPartySignature: values.firstPartySignature,
      firstPartyStamp: values.firstPartyStamp,
      secondPartySignature: values.secondPartySignature,
    };
  }

  generateUpdatePayload(): UpdateContractRequest {
    const values = this.contractForm.value;

    return {
      terms_and_conditions_ar: values.terms_and_conditions_ar || null,
      terms_and_conditions_en: values.terms_and_conditions_en || null,
      firstPartySignature: values.firstPartySignature,
      firstPartyStamp: values.firstPartyStamp,
      secondPartySignature: values.secondPartySignature,
    };
  }

  cancel() {
    this.formStateService.markTabAsClean(3);
    this.closeForm.emit();
  }

  openImagePopup(imageUrl: string): void {
    this.selectedImg = imageUrl;
    this.showImagePopup = true;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
