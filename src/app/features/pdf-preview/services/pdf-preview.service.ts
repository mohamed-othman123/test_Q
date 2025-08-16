import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {APP_ENVIRONMENT} from '@core/constants';
import {Environment} from '@core/models';
import {PrintTemplate} from '@orders/enums/print.enum';
import {map} from 'rxjs';

@Injectable()
export class PdfPreviewService {
  constructor(
    @Inject(APP_ENVIRONMENT) private environment: Environment,
    private http: HttpClient,
  ) {}

  preview(
    id: string,
    template: PrintTemplate,
    params: {[key: string]: string | number},
  ) {
    const httpParams = new HttpParams({fromObject: params});

    const headers = new HttpHeaders({
      'Accept-Language': params['lang'],
      Accept: 'application/pdf',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    });

    const url = `${this.environment.baseUrl}${template}/preview/${id}`;

    return this.http
      .get(url, {
        params: httpParams,
        headers,
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        map((res) => {
          return res;
        }),
      );
  }
}
