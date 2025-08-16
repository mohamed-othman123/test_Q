import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {NotificationService} from '@core/services/notification.service';
import {ProfileRequest, ProfileResponse} from '../models/profile';
import {ApiConfigService} from '@core/services/api-config.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  module = 'users';
  apiUsersUrl = this.apiConfigService.getApiBaseUrl(this.module as any);

  constructor(
    private apiConfigService: ApiConfigService,
    private http: HttpClient,
    private notificationService: NotificationService,
  ) {}

  getProfile(): Observable<ProfileResponse> {
    const url = `${this.apiUsersUrl}/profile`;
    return this.http.get<ProfileResponse>(url);
  }

  getUserProfile(id: string): Observable<ProfileResponse> {
    const url = `${this.apiUsersUrl}/${id}`;
    return this.http.get<ProfileResponse>(url);
  }

  updateProfile(data: Partial<ProfileRequest>): Observable<ProfileResponse> {
    const url = `${this.apiUsersUrl}/profile`;
    return this.http
      .patch<ProfileResponse>(url, data)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('profile.profile_updated'),
        ),
      );
  }
}
