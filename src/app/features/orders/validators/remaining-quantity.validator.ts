import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import {InventoryItem} from '@inventory/models/inventory';

export const remainingQuantityValidator = (): ValidatorFn => {
  return (fg: AbstractControl<FormGroup>): ValidationErrors | null => {
    const product = fg.get('product')?.value;
    const quantity = fg.get('quantity')?.value;
    if (product && quantity) {
      if (product && quantity > (product as InventoryItem).totalQuantity!) {
        return {exceedsRemainingQuantity: true};
      }
    }
    return null;
  };
};
