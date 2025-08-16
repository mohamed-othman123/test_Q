import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, NavigationStart, Router} from '@angular/router';
import {Hall} from '@halls/models/halls.model';
import {HallsService} from '@halls/services/halls.service';
import {Observable, of, Subject} from 'rxjs';
import {takeUntil} from 'rxjs';
import {CanComponentDeactivate} from '@core/guards/pending-changes.guard';
import {FormStateService} from '@halls/services/form-state.service';
import {HallFormComponent} from '@halls/components/hall-form/hall-form.component';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'edit-hall',
    templateUrl: './edit-hall.component.html',
    styleUrls: ['./edit-hall.component.scss'],
    standalone: false
})
export class EditHallComponent
  implements OnInit, OnDestroy, CanComponentDeactivate
{
  hallId!: string;
  hall!: Hall;
  showConfirmDialog: boolean = false;
  private confirmationSubject = new Subject<boolean>();
  private intendedRoute: string = '';

  @ViewChild(HallFormComponent) hallFormComponent!: HallFormComponent;

  private unsubscribeAll: Subject<void> = new Subject();

  constructor(
    private hallService: HallsService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formStateService: FormStateService,
    public translateService: TranslateService,
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.intendedRoute = event.url;
      }
    });
  }

  ngOnInit(): void {
    this.hallId = this.activatedRoute.snapshot.paramMap.get('id') as string;
    this.getHallById();
  }

  private getHallById() {
    this.hallService
      .getHall(this.hallId)
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe({
        next: (hall) => {
          this.hall = hall;
        },
      });
  }

  handleHallUpdated(updatedHall: Hall): void {
    this.hall = updatedHall;
  }

  prepareForNavigation(): void {
    if (this.hallFormComponent) {
      this.showConfirmDialog = true;
    }
  }

  canDeactivate(): Observable<boolean> {
    if (this.formStateService.hasUnsavedChanges()) {
      this.showConfirmDialog = true;
      return new Observable<boolean>((observer) => {
        this.confirmationSubject.subscribe((result) => {
          observer.next(result);
          observer.complete();
        });
      });
    }
    return of(true);
  }

  resolveConfirmation(result: boolean): void {
    this.confirmationSubject.next(result);
    this.showConfirmDialog = false;
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }
}
