import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ApiConfigService} from '@core/services/api-config.service';

@Injectable({providedIn: 'root'})
export class ZatcaService {
  module = 'zatca';
  url = this.apiConfigService.getApiBaseUrl(this.module as any);

  constructor(
    private httpClient: HttpClient,
    private apiConfigService: ApiConfigService,
  ) {}

  integrate(OTP: string) {
    return this.httpClient.post<void>(`${this.url}`, {OTP});
  }

  clearance(invoiceId: number) {
    return this.httpClient.post<{message: string}>(
      `${this.url}/clearance/${invoiceId}`,
      {},
    );
  }

  reporting(invoiceId: number) {
    return this.httpClient.post<{message: string}>(
      `${this.url}/reporting/${invoiceId}`,
      {},
    );
  }
}
