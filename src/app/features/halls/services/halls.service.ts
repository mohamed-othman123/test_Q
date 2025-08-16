import { HttpClient, HttpParams } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DataTableFilter, GaCustomEvents, TableData} from '@core/models';
import {
  BehaviorSubject,
  Observable,
  tap,
  catchError,
  of,
  switchMap,
  map,
} from 'rxjs';
import {Hall, HallSection} from '@halls/models/halls.model';
import {NotificationService} from '@core/services/notification.service';
import {StorageKeys} from '@core/enums';
import {ApiConfigService} from '@core/services/api-config.service';
import {GtagService} from '@core/analytics/gtag.service';
import {GaConfigService} from '@core/analytics/ga-config.service';

@Injectable({providedIn: 'root'})
export class HallsService {
  module = 'halls';
  apiHallsUrl = this.apiConfigService.getApiBaseUrl(this.module as any);

  private currentHallSubject = new BehaviorSubject<Hall | null>(null);
  currentHall$: Observable<Hall | null> =
    this.currentHallSubject.asObservable();

  private hallsSubject = new BehaviorSubject<Hall[]>([]);
  halls$ = this.hallsSubject.asObservable();

  constructor(
    private apiConfigService: ApiConfigService,
    private http: HttpClient,
    private notificationService: NotificationService,
    private gtag: GtagService,
    private gaConfig: GaConfigService,
  ) {}

  setCurrentHall(hall: Hall) {
    this.currentHallSubject.next(hall);
    localStorage.setItem(StorageKeys.LAST_SELECTED_HALL, JSON.stringify(hall));
  }

  getCurrentHall(): Hall | null {
    return this.currentHallSubject.getValue();
  }

  getHallsList(filters?: DataTableFilter): Observable<TableData<Hall>> {
    const params = new HttpParams({fromObject: filters});
    const url = `${this.apiHallsUrl}?${params}`;
    return this.http.get<TableData<Hall>>(url);
  }

  getAllHalls(): Observable<TableData<Hall>> {
    return this.http.get<TableData<Hall>>(this.apiHallsUrl).pipe(
      tap((halls) => {
        this.hallsSubject.next(halls.items);
      }),
    );
  }

  get halls() {
    return this.hallsSubject.value;
  }

  getHall(id: string) {
    return this.http.get<Hall>(`${this.apiHallsUrl}/${id}`);
  }

  addHall(hallData: any): Observable<Hall> {
    return this.http.post<Hall>(this.apiHallsUrl, hallData).pipe(
      tap(() => {
        this.notificationService.showSuccess('halls.hall_added');

        this.gtag.event(GaCustomEvents.CREATE_NEW_HALL, {
          organizationInfo: this.gaConfig.getOrganizationInfo(),
          hallInfo: this.gaConfig.getHallInfo(),
        });
      }),
      switchMap((newHall) => this.getAllHalls().pipe(map(() => newHall))),
    );
  }

  updateHall(id: number, hall: FormData): Observable<Hall> {
    return this.http.patch<Hall>(`${this.apiHallsUrl}/${id}`, hall).pipe(
      tap(() => {
        this.notificationService.showSuccess('halls.hall_updated');
      }),
      switchMap((updatedHall) =>
        this.getAllHalls().pipe(
          map(() => updatedHall),
          tap((updatedHall) => {
            if (updatedHall.id === this.currentHallSubject.getValue()?.id) {
              this.setCurrentHall(updatedHall);
            }
          }),
        ),
      ),
    );
  }

  updateHallPricing(id: number, pricingData: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiHallsUrl}/${id}/pricing`, pricingData)
      .pipe(
        tap(() => {
          this.notificationService.showSuccess('halls.pricing_updated');
        }),
      );
  }

  deleteHall(id: number | undefined) {
    return this.http.delete<Hall>(`${this.apiHallsUrl}/${id}`).pipe(
      tap(() => {
        this.notificationService.showSuccess('halls.hall_deleted');
      }),
      switchMap((deleteResponse) =>
        this.getAllHalls().pipe(
          map(() => deleteResponse),
          tap((deletedHall) => {
            if (deletedHall.id === this.currentHallSubject.getValue()?.id) {
              this.setCurrentHall(this.hallsSubject.getValue()[0]);
            }
          }),
        ),
      ),
    );
  }

  initializeHalls() {
    return this.getAllHalls().pipe(
      tap((halls) => {
        if (halls.items.length > 0) {
          const lastSelectedHall = localStorage.getItem(
            StorageKeys.LAST_SELECTED_HALL,
          );

          if (lastSelectedHall) {
            const parsedHall = JSON.parse(lastSelectedHall);
            const hallStillExists = halls.items.some(
              (h) => h.id === parsedHall.id,
            );

            if (hallStillExists) {
              const hall = halls.items.find((h) => h.id === parsedHall.id);
              this.setCurrentHall(hall!);
            } else {
              this.setCurrentHall(halls.items[0]);
            }
          } else {
            this.setCurrentHall(halls.items[0]);
          }
        }
      }),
      catchError(() => {
        return of({items: [], total: 0});
      }),
    );
  }

  getHallSections(hallId: number) {
    return this.http.get<HallSection[]>(
      `${this.apiHallsUrl}/${hallId}/sections`,
    );
  }

  getHallPricing(hallId: number, type: string) {
    let params = new HttpParams().set('type', type);

    return this.http.get<any[]>(`${this.apiHallsUrl}/${hallId}/pricing`, {
      params,
    });
  }

  updateEventPricing(
    pricingData: any,
    hallId: string,
    type: string,
    eventId?: string,
  ) {
    let params = new HttpParams().set('type', type);

    if (eventId) {
      params = params.set('eventId', eventId.toString());
    }

    return this.http.patch<Hall>(
      `${this.apiHallsUrl}/${hallId}/pricing`,
      pricingData,
      {params},
    );
  }

  deleteHallPricing(type: string, hallId: string, eventId?: string) {
    let params = new HttpParams().set('type', type);

    if (eventId) {
      params = params.set('eventId', eventId.toString());
    }

    return this.http.delete<Hall>(`${this.apiHallsUrl}/${hallId}/pricing`, {
      params,
    });
  }

  updateHallSignature(hallId: number, signatureData: FormData) {
    return this.http
      .patch<Hall>(`${this.apiHallsUrl}/${hallId}/signatures`, signatureData)
      .pipe(
        tap(() => {
          this.notificationService.showSuccess('halls.signature_updated');
        }),
      );
  }
}
