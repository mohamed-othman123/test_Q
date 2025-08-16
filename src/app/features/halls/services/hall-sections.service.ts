import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {TableData} from '@core/models';
import {NotificationService} from '@core/services';
import {ApiConfigService} from '@core/services/api-config.service';
import {HallSection} from '@halls/models/halls.model';
import {tap} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HallSectionsService {
  private module = 'halls';
  private apiHallsUrl = this.apiConfigService.getApiBaseUrl(this.module as any);

  constructor(
    private apiConfigService: ApiConfigService,
    private http: HttpClient,
    private notificationService: NotificationService,
  ) {}

  /**
   * Get sections for a hall
   * @param hallId Hall ID
   */
  getSections(hallId: string) {
    return this.http.get<TableData<HallSection>>(
      `${this.apiHallsUrl}/${hallId}/sections`,
    );
  }
  /**
   * Create a new section for a hall
   * @param hallId Hall ID
   * @param section Section data
   */
  createSection(hallId: string, section: HallSection) {
    return this.http
      .post<HallSection>(`${this.apiHallsUrl}/${hallId}/sections`, section)
      .pipe(
        tap(() => {
          this.notificationService.showSuccess('halls.section_added');
        }),
      );
  }
  /**
   * Update an existing section for a hall
   * @param hallId Hall ID
   * @param section Section data
   */
  updateSection(hallId: string, section: HallSection) {
    return this.http
      .patch<HallSection>(
        `${this.apiHallsUrl}/${hallId}/sections/${section.id}`,
        section,
      )
      .pipe(
        tap(() => {
          this.notificationService.showSuccess('halls.section_updated');
        }),
      );
  }
  /**
   * Delete a section from a hall
   * @param hallId Hall ID
   * @param sectionId Section ID
   */
  deleteSection(hallId: string, sectionId: number) {
    return this.http
      .delete(`${this.apiHallsUrl}/${hallId}/sections/${sectionId}`)
      .pipe(
        tap(() => {
          this.notificationService.showSuccess('halls.section_deleted');
        }),
      );
  }
}
