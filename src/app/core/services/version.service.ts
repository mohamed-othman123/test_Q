import { HttpClient, HttpParams } from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {APP_ENVIRONMENT} from '@core/constants';
import {DataTableFilter, Environment, TableData, Version} from '@core/models';
import {ApiConfigService} from './api-config.service';

@Injectable({
  providedIn: 'root',
})
export class VersionService {
  module = 'version';
  apiVersionUrl = this.apiConfigService.getApiBaseUrl(this.module as any);

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService,
  ) {}

  getVersions(filters: DataTableFilter) {
    const params = new HttpParams({fromObject: filters});
    return this.http.get<TableData<Version>>(this.apiVersionUrl, {params});
  }
}
