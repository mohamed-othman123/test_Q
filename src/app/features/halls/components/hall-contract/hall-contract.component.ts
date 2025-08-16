import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnDestroy,
} from '@angular/core';
import {Hall} from '@halls/models/halls.model';
import {HallContract} from '@halls/models/hall-contract.model';
import {BookingFacadeService} from '@orders/services/booking-facade.service';
import {Subject} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {LanguageService} from '@core/services';
import {FormStateService} from '@halls/services/form-state.service';

@Component({
    selector: 'app-hall-contract',
    templateUrl: './hall-contract.component.html',
    styleUrls: ['./hall-contract.component.scss'],
    providers: [BookingFacadeService],
    standalone: false
})
export class HallContractComponent implements OnInit, OnDestroy {
  @Input() hallId!: string;
  @Input() hallData!: Hall;
  @Output() contractsUpdated = new EventEmitter<Hall>();
  @Output() formChanged = new EventEmitter<void>();

  showContractForm: boolean = false;
  showContractAttachments: boolean = false;

  isEditMode: boolean = false;
  editedContract: HallContract | null = null;

  @Input() eventTypes: any[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    public translateService: TranslateService,
    public lang: LanguageService,
    private formStateService: FormStateService,
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openContractForm(): void {
    this.showContractForm = true;
  }

  closeEdit() {
    this.showContractForm = false;
    this.showContractAttachments = false;
    this.isEditMode = false;
    this.editedContract = null;
  }

  editContract(contract: HallContract): void {
    this.isEditMode = true;

    this.editedContract = contract;

    this.showContractForm = true;
  }

  uploadAttachments(contract: HallContract): void {
    this.isEditMode = true;
    this.editedContract = contract;
    this.showContractAttachments = true;
  }
}
