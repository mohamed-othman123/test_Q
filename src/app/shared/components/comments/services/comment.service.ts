import { HttpClient, HttpParams } from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {APP_ENVIRONMENT} from '@core/constants';
import {Environment, TableData} from '@core/models';
import {CreateCommentDto} from './dtos/create-comment.dto';
import {NotificationService} from '@core/services';
import {tap} from 'rxjs';
import {Comment} from '../models/comment';
import {UpdateCommentDto} from './dtos/update-comment.dto';
import {GetCommentsDto} from './dtos/get-comments.dto';

@Injectable()
export class CommentService {
  constructor(
    @Inject(APP_ENVIRONMENT) private environment: Environment,
    private http: HttpClient,
    private notificationService: NotificationService,
  ) {}

  createOne(data: CreateCommentDto) {
    return this.http
      .post<Comment>(`${this.environment.baseUrl}comments`, data)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('comments.commentCreated'),
        ),
      );
  }

  updateOne(id: string, data: UpdateCommentDto) {
    return this.http
      .put<Comment>(`${this.environment.baseUrl}comments/${id}`, data)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('comments.commentUpdated'),
        ),
      );
  }

  deleteOne(id: string) {
    return this.http
      .delete<void>(`${this.environment.baseUrl}comments/${id}`)
      .pipe(
        tap(() =>
          this.notificationService.showSuccess('comments.commentDeleted'),
        ),
      );
  }

  getAll(query?: GetCommentsDto) {
    const params = new HttpParams({fromObject: query});
    return this.http.get<TableData<Comment>>(
      `${this.environment.baseUrl}comments`,
      {params},
    );
  }
}
