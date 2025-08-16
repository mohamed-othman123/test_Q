import {Injectable} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {TableData} from '@core/models';
import {DataTableFilter} from '@core/models';
import {
  CreateContractRequest,
  HallContract,
  UpdateContractRequest,
} from '@halls/models/hall-contract.model';
import {ApiConfigService} from '@core/services/api-config.service';
import {NotificationService} from '@core/services';

@Injectable({
  providedIn: 'root',
})
export class HallContractsService {
  module = 'halls';
  apiHallsUrl = this.apiConfigService.getApiBaseUrl(this.module as any);

  constructor(
    private apiConfigService: ApiConfigService,
    private http: HttpClient,
    private notificationService: NotificationService,
  ) {}

  /**
   * Get contracts for a hall
   * @param filters Filter parameters including hallId
   */
  getContracts(filters?: DataTableFilter): Observable<TableData<HallContract>> {
    const params = new HttpParams({fromObject: filters as any});
    return this.http.get<TableData<HallContract>>(
      `${this.apiHallsUrl}/contracts`,
      {params},
    );
  }

  /**
   * Get a specific contract by ID
   * @param id Contract ID
   */
  getContract(id: number): Observable<HallContract> {
    return this.http.get<HallContract>(`${this.apiHallsUrl}/contracts/${id}`);
  }

  /**
   * Create a new contract for a hall
   * @param hallId Hall ID
   * @param contractData Contract data
   */
  createContract(
    hallId: number,
    contractData: CreateContractRequest,
  ): Observable<HallContract[]> {
    return this.http
      .post<
        HallContract[]
      >(`${this.apiHallsUrl}/contracts/${hallId}`, contractData)
      .pipe(
        tap(() => {
          this.notificationService.showSuccess('halls.contract_created');
        }),
      );
  }

  /**
   * Update an existing contract
   * @param id Contract ID
   * @param contractData Updated contract data
   */
  updateContract(
    id: number,
    contractData: UpdateContractRequest,
  ): Observable<HallContract> {
    return this.http
      .patch<HallContract>(`${this.apiHallsUrl}/contracts/${id}`, contractData)
      .pipe(
        tap(() => {
          this.notificationService.showSuccess('halls.contract_updated');
        }),
      );
  }

  /**
   * Delete a contract
   * @param id Contract ID
   */
  deleteContract(id: number): Observable<HallContract> {
    return this.http
      .delete<HallContract>(`${this.apiHallsUrl}/contracts/${id}`)
      .pipe(
        tap(() => {
          this.notificationService.showSuccess('halls.contract_deleted');
        }),
      );
  }
}
