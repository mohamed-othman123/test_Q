import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import {Hall} from '@halls/models/halls.model';
import {Subscription, Observable, of, takeUntil, Subject} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {CanComponentDeactivate} from '@core/guards/pending-changes.guard';
import {FormStateService, TabState} from '@halls/services/form-state.service';
import {EventsService} from '@events/services/events.service';

interface Tab {
  title: string;
  icon: string;
}

@Component({
  selector: 'hall-form',
  templateUrl: './hall-form.component.html',
  styleUrls: ['./hall-form.component.scss'],
  standalone: false,
})
export class HallFormComponent
  implements OnInit, OnDestroy, CanComponentDeactivate
{
  @Input() lang: string = 'en';
  @Input() hall!: Hall;
  @Input() hallId!: string;

  @Input() set showLeaveConfirmation(value: boolean) {
    if (value) {
      this.showNavigationConfirmDialog();
    }
  }

  @Output() onHallUpdated: EventEmitter<Hall> = new EventEmitter<Hall>();
  @Output() confirmationResolved = new EventEmitter<boolean>();

  tabs: Tab[] = [
    {title: 'halls.mainDetails', icon: 'pi pi-info-circle'},
    {title: 'halls.hallSections', icon: 'pi pi-th-large'},
    {title: 'halls.hallSignatureAndStamp', icon: 'pi pi-pen-to-square'},
    {title: 'halls.contractSettings', icon: 'pi pi-file'},
    {title: 'halls.hallPrices', icon: 'sar-icon sar-color'},
    {title: 'halls.teamData', icon: 'pi pi-users'},
  ];

  activeTabIndex: number = 0;
  previousTabIndex: number = 0;
  tabStates: TabState[] = [];
  showConfirmDialog: boolean = false;
  pendingTabChange: boolean = false;
  targetTabIndex: number = -1;
  eventTypes: any[] = [];

  private stateSubscription: Subscription;
  private unsubscribe: Subject<void>;
  dialogTitle: string = '';
  dialogMessage: string = '';
  dialogContinueText: string = '';
  dialogCancelText: string = '';
  dialogSaveText: string = '';

  constructor(
    public formStateService: FormStateService,
    private translateService: TranslateService,
    private eventsService: EventsService,
  ) {
    this.stateSubscription = this.formStateService
      .getTabStates()
      .subscribe((states) => (this.tabStates = states));

    this.unsubscribe = new Subject();
  }

  ngOnInit() {
    this.formStateService.initTabStates(this.tabs);
    this.updateDialogTexts();
    this.translateService.onLangChange.subscribe(() => {
      this.updateDialogTexts();
    });
    this.loadEventTypes();
  }

  ngOnDestroy() {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  private setDialogTextsForNavigation(): void {
    this.dialogMessage = this.translateService.instant(
      'common.leavePageConfirmation',
    );
    this.dialogContinueText = this.translateService.instant('common.leavePage');
    this.dialogCancelText = this.translateService.instant('common.stayOnPage');
    this.dialogSaveText = this.translateService.instant('common.saveAndLeave');
  }

  private setDialogTextsForTabChange(): void {
    this.dialogMessage = this.translateService.instant(
      'common.unsavedChangesMessage',
    );
    this.dialogContinueText = this.translateService.instant(
      'common.discardChanges',
    );
    this.dialogCancelText = this.translateService.instant('common.cancel');
    this.dialogSaveText = this.translateService.instant('common.saveChanges');
  }

  private updateDialogTexts(): void {
    this.dialogTitle = this.translateService.instant('common.unsavedChanges');
    this.dialogMessage = this.translateService.instant(
      'common.unsavedChangesMessage',
    );
    this.dialogContinueText = this.translateService.instant(
      'common.discardChanges',
    );
    this.dialogCancelText = this.translateService.instant('common.cancel');
    this.dialogSaveText = this.translateService.instant('common.saveChanges');
  }

  private showNavigationConfirmDialog(): void {
    this.dialogTitle = this.translateService.instant('common.unsavedChanges');
    this.dialogMessage = this.translateService.instant(
      'common.leavePageConfirmation',
    );
    this.dialogContinueText = this.translateService.instant('common.leavePage');
    this.dialogCancelText = this.translateService.instant('common.stayOnPage');
    this.dialogSaveText = this.translateService.instant('common.saveAndLeave');

    this.showConfirmDialog = true;
  }

  setActiveTab(index: number): void {
    if (index === this.activeTabIndex) {
      return;
    }

    if (this.formStateService.isTabDirty(this.activeTabIndex)) {
      this.previousTabIndex = this.activeTabIndex;
      this.targetTabIndex = index;
      this.pendingTabChange = true;
      this.setDialogTextsForTabChange();
      this.showConfirmDialog = true;
    } else {
      this.activeTabIndex = index;
    }
  }

  private loadEventTypes(): void {
    this.eventsService
      .getListEvents({hallId: +this.hallId})
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: (response) => {
          this.eventTypes = response.items.map((event) => ({
            id: event.id,
            name: event.name,
            name_ar: event.name_ar,
          }));
        },
      });
  }

  onDialogCancel(): void {
    this.showConfirmDialog = false;
    this.pendingTabChange = false;
    this.targetTabIndex = -1;
    this.confirmationResolved.emit(false);
  }

  onDialogContinue(): void {
    this.showConfirmDialog = false;
    if (this.formStateService.isTabDirty(this.activeTabIndex)) {
      this.formStateService.resetTab(this.activeTabIndex);
    }
    this.formStateService.resetAllTabStates();
    if (this.pendingTabChange) {
      this.activeTabIndex = this.targetTabIndex;
      this.pendingTabChange = false;
      this.targetTabIndex = -1;
    } else {
      this.confirmationResolved.emit(true);
    }
  }

  onDialogSave(): void {
    this.showConfirmDialog = false;
    const currentTabIndex = this.activeTabIndex;
    let savePromise: Promise<void>;
    switch (this.activeTabIndex) {
      case 0:
        savePromise = new Promise<void>((resolve) => {
          const saveButton = document.querySelector(
            '#details-save-btn',
          ) as HTMLElement;
          if (saveButton) {
            saveButton.click();
            setTimeout(resolve, 500);
          } else {
            resolve();
          }
        });
        break;
      case 1:
        savePromise = new Promise<void>((resolve) => {
          const saveButton = document.querySelector(
            '#sections-save-btn',
          ) as HTMLElement;
          if (saveButton) {
            saveButton.click();
            setTimeout(resolve, 500);
          } else {
            resolve();
          }
        });
        break;
      case 2:
        savePromise = new Promise<void>((resolve) => {
          const saveButton = document.querySelector(
            '#contracts-save-btn',
          ) as HTMLElement;
          if (saveButton) {
            saveButton.click();
            setTimeout(resolve, 1500);
          } else {
            resolve();
          }
        });
        break;
      case 3:
        savePromise = new Promise<void>((resolve) => {
          const saveButton = document.querySelector(
            '#pricing-save-btn',
          ) as HTMLElement;
          if (saveButton) {
            saveButton.click();
            setTimeout(resolve, 500);
          } else {
            resolve();
          }
        });
        break;
      case 4:
        savePromise = new Promise<void>((resolve) => {
          const saveButton = document.querySelector(
            '#team-save-btn',
          ) as HTMLElement;
          if (saveButton) {
            saveButton.click();
            setTimeout(resolve, 500);
          } else {
            resolve();
          }
        });
        break;
      default:
        savePromise = Promise.resolve();
    }

    savePromise.then(() => {
      this.formStateService.markTabAsClean(currentTabIndex);
      if (this.pendingTabChange) {
        this.activeTabIndex = this.targetTabIndex;
        this.pendingTabChange = false;
        this.targetTabIndex = -1;
      } else {
        this.confirmationResolved.emit(true);
      }
    });
  }

  canDeactivate(): Observable<boolean> {
    if (this.formStateService.hasUnsavedChanges()) {
      this.setDialogTextsForNavigation();
      this.showConfirmDialog = true;
      return new Observable<boolean>((observer) => {
        this.confirmationResolved.subscribe((result) => {
          observer.next(result);
          observer.complete();
        });
      });
    }
    return of(true);
  }

  private handleTabUpdate(updatedHall: Hall, tabIndex: number): void {
    this.formStateService.ignoreChanges(true);

    this.hall = {...this.hall, ...updatedHall};

    this.onHallUpdated.emit(this.hall);

    this.formStateService.markTabAsClean(tabIndex);

    setTimeout(() => {
      this.formStateService.ignoreChanges(false);
    }, 200);
  }

  handleDetailsUpdated(updatedHall: Hall): void {
    this.handleTabUpdate(updatedHall, 0);
  }

  handleSignatureUpdate(updatedHall: Hall): void {
    this.handleTabUpdate(updatedHall, 2);
  }

  handleContractsUpdated(updatedHall: Hall): void {
    this.handleTabUpdate(updatedHall, 3);
  }

  handlePricingUpdated(updatedHall: Hall): void {
    this.handleTabUpdate(updatedHall, 4);
  }

  handleTeamUpdated(updatedHall: Hall): void {
    this.handleTabUpdate(updatedHall, 5);
  }

  isTabDirty(index: number): boolean {
    return this.tabStates[index]?.dirty || false;
  }

  isRtl(): boolean {
    return this.translateService.currentLang === 'ar';
  }
}
