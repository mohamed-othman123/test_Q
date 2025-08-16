import {map} from 'rxjs/operators';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import {inject} from '@angular/core';
import {RefundRequestsService} from '@refund-requests/services/refund-request.service';
import {RefundRequest} from '@refund-requests/models/refund-request.model';

export const GetRefundRequestResolver: ResolveFn<RefundRequest> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const id = route.paramMap.get('id');

  const _refundRequestService = inject(RefundRequestsService);

  return _refundRequestService.getOne(+id!).pipe(
    map((data) => {
      return data;
    }),
  );
};
