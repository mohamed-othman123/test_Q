import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ApiConfigService} from '@core/services/api-config.service';

@Injectable({
  providedIn: 'root',
})
export class CustomerSignatureService {
  private module = 'booking';
  private apiBookingUrl = this.apiConfigService.getApiBaseUrl(
    this.module as any,
  );

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService,
  ) {}

  updateCustomerSignature(payload: FormData) {
    return this.http.post(`${this.apiBookingUrl}/customer-signature`, payload);
  }

  getContractInfo(id: string, identity: string) {
    const url = `${this.apiConfigService.getApiBaseUrl('contract')}/${id}?identity=${identity}`;

    return this.http.get(url);
  }
}
