import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {TableData} from '@core/models';
import {NotificationService} from '@core/services';
import {ApiConfigService} from '@core/services/api-config.service';
import {HallTeamMember} from '@halls/models/halls.model';
import {tap} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HallTeamMembersService {
  private module = 'halls';
  private apiHallsUrl = this.apiConfigService.getApiBaseUrl(this.module as any);

  constructor(
    private apiConfigService: ApiConfigService,
    private http: HttpClient,
    private notificationService: NotificationService,
  ) {}
  /**
   * Get team members for a hall
   * @param hallId Hall ID
   */
  getTeamMembers(hallId: string) {
    return this.http.get<TableData<HallTeamMember>>(
      `${this.apiHallsUrl}/${hallId}/members`,
    );
  }
  /**
   * Create a new team member for a hall
   * @param hallId Hall ID
   * @param member Team member data
   */
  createTeamMember(hallId: string, member: HallTeamMember) {
    return this.http
      .post<HallTeamMember>(`${this.apiHallsUrl}/${hallId}/members`, member)
      .pipe(
        tap(() => {
          this.notificationService.showSuccess('halls.team_member_added');
        }),
      );
  }
  /**
   * Update an existing team member for a hall
   * @param hallId Hall ID
   * @param member Team member data
   */
  updateTeamMember(hallId: string, member: HallTeamMember) {
    return this.http
      .patch<HallTeamMember>(
        `${this.apiHallsUrl}/${hallId}/members/${member.id}`,
        member,
      )
      .pipe(
        tap(() => {
          this.notificationService.showSuccess('halls.team_member_updated');
        }),
      );
  }
  /**
   * Delete a team member from a hall
   * @param hallId Hall ID
   * @param memberId Team member ID
   */
  deleteTeamMember(hallId: string, memberId: number) {
    return this.http
      .delete(`${this.apiHallsUrl}/${hallId}/members/${memberId}`)
      .pipe(
        tap(() => {
          this.notificationService.showSuccess('halls.team_member_deleted');
        }),
      );
  }
}
