import {inject} from '@angular/core';
import {ActivatedRoute, ResolveFn, Router} from '@angular/router';
import {PriceRequestService} from '../services/price-request.service';
import {catchError, of} from 'rxjs';
import {PriceRequest} from '../models';

export const priceRequestResolver: ResolveFn<PriceRequest | null> = (
  route,
  state,
) => {
  const priceRequestService = inject(PriceRequestService);
  const router = inject(Router);

  const id = route.paramMap.get('id');

  if (!id) return of(null);

  return priceRequestService.getPriceRequestById(+id).pipe(
    catchError(() => {
      router.navigate(['/price-requests']);
      return of(null);
    }),
  );
};
