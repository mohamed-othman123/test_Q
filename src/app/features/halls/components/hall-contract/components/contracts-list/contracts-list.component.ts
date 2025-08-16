import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {DataTableFilter} from '@core/models';
import {LanguageService, NotificationService} from '@core/services';
import {HallContract} from '@halls/models/hall-contract.model';
import {HallContractsService} from '@halls/services/hall-contracts.service';
import {Subject, takeUntil} from 'rxjs';

@Component({
    selector: 'app-contracts-list',
    templateUrl: './contracts-list.component.html',
    styleUrl: './contracts-list.component.scss',
    standalone: false
})
export class ContractsListComponent implements OnInit, OnDestroy {
  @Input() hallId!: string;

  @Output() editContract = new EventEmitter<HallContract>();
  @Output() uploadAttachment = new EventEmitter<HallContract>();

  contracts: HallContract[] = [];

  rows = 10;
  totalContracts = 0;
  rowsPerPageOptions = [10, 20, 50];

  destroy$ = new Subject<void>();

  constructor(
    private hallContractsService: HallContractsService,
    public lang: LanguageService,
  ) {}

  ngOnInit(): void {
    this.loadContracts();
  }

  onLazyLoad(event: any) {
    this.loadContracts(event);
  }

  loadContracts(event?: any): void {
    const filters: DataTableFilter = {
      page: event?.first ? Math.floor(event.first / event.rows) + 1 : 1,
      limit: event?.rows || this.rows,
      hallId: +this.hallId,
    };

    this.hallContractsService
      .getContracts(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.contracts = response.items;
          this.totalContracts = response.totalItems;
        },
      });
  }

  edit(contract: HallContract) {
    this.editContract.emit(contract);
  }

  deleteContract(contract: HallContract): void {
    this.confirmDeleteContract(contract);
  }

  confirmDeleteContract(contract: HallContract): void {
    this.hallContractsService.deleteContract(contract.id).subscribe({
      next: () => {
        this.loadContracts();
      },
    });
  }

  uploadAttachments(contract: HallContract) {
    this.uploadAttachment.emit(contract);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
