import {
  AbstractControl,
  FormArray,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export function duplicateItemValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const fa = control as FormArray;
    if (!fa.controls || fa.controls.length === 0) {
      return null;
    }

    fa.controls.forEach((fg: AbstractControl) => {
      const group = fg as FormGroup;
      if (group.hasError('duplicate')) {
        group.setErrors(null);
      }
    });

    const mapByName: Record<string, FormGroup[]> = {};
    const mapByNameAr: Record<string, FormGroup[]> = {};

    fa.controls.forEach((fg: AbstractControl) => {
      const group = fg as FormGroup;
      const typeVal = group.get('type')?.value;
      const nameVal =
        group.get('name')?.value?.name?.trim() ||
        group.get('name')?.value?.trim();
      const nameArVal =
        group.get('nameAr')?.value?.nameAr?.trim() ||
        group.get('nameAr')?.value?.trim();

      if (typeVal != null && nameVal != null && nameVal !== '') {
        const key = `${typeVal}::${nameVal}`;
        if (!mapByName[key]) {
          mapByName[key] = [];
        }
        mapByName[key].push(group);
      }
      if (typeVal != null && nameArVal != null && nameArVal !== '') {
        const keyAr = `${typeVal}::${nameArVal}`;
        if (!mapByNameAr[keyAr]) {
          mapByNameAr[keyAr] = [];
        }
        mapByNameAr[keyAr].push(group);
      }
    });

    let foundDuplicate = false;

    Object.values(mapByName).forEach((groupList) => {
      if (groupList.length > 1) {
        foundDuplicate = true;
        groupList.forEach((grp) => {
          const existing = grp.errors || {};
          grp.setErrors({...existing, duplicate: true});
        });
      }
    });

    Object.values(mapByNameAr).forEach((groupList) => {
      if (groupList.length > 1) {
        foundDuplicate = true;
        groupList.forEach((grp) => {
          const existing = grp.errors || {};
          grp.setErrors({...existing, duplicate: true});
        });
      }
    });

    return foundDuplicate ? {duplicateItems: true} : null;
  };
}
