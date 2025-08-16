import { HttpParams } from '@angular/common/http';

export function HttpParamsGenerator(queryParams: any): HttpParams {
  let params = new HttpParams();

  if (queryParams) {
    Object.keys(queryParams).forEach((key) => {
      if (queryParams[key] !== undefined && queryParams[key] !== null) {
        params = params.append(key, queryParams[key].toString());
      }
    });
  }

  return params;
}
