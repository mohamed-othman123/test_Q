import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HallsService} from '@halls/services/halls.service';
import {Hall} from '@halls/models/halls.model';
import {debounceTime, finalize} from 'rxjs/operators';
import {noDoubleSpaceValidator, requireOneOf} from '@core/validators';
import {Subject, takeUntil} from 'rxjs';
import {FormStateService} from '@halls/services/form-state.service';

@Component({
    selector: 'app-hall-details',
    templateUrl: './hall-details.component.html',
    styleUrls: ['./hall-details.component.scss'],
    standalone: false
})
export class HallDetailsComponent implements OnInit {
  @Input() hallId!: string;
  @Input() hallData!: Hall;
  @Output() detailsUpdated = new EventEmitter<Hall>();
  @Output() formChanged = new EventEmitter<void>();

  detailsForm!: FormGroup;
  file: File | null = null;
  isSubmitting: boolean = false;
  shouldRemoveLogo: boolean = false;

  showColorExtractor: boolean = false;
  logoPreviewUrl: string = '';
  colorExtractionComplete: boolean = false;
  isMobileView: boolean = false;
  uploadedImageHasTransparency: boolean = false;

  private destroy$ = new Subject<void>();
  private originalFormValues: any = null;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private hallsService: HallsService,
    private formStateService: FormStateService,
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    this.initForm();

    if (this.hallData) {
      this.patchFormValues();
      setTimeout(() => {
        this.originalFormValues = JSON.parse(
          JSON.stringify(this.detailsForm.value),
        );

        this.detailsForm.valueChanges
          .pipe(debounceTime(200), takeUntil(this.destroy$))
          .subscribe(() => {
            if (this.hasFormChanged()) {
              this.formChanged.emit();
            }
          });

        this.formStateService
          .getResetEvent()
          .pipe(takeUntil(this.destroy$))
          .subscribe((tabIndex) => {
            if (tabIndex === 0) {
              this.resetForm();
            }
          });
      });
    }

    this.checkScreenSize();
  }

  private hasFormChanged(): boolean {
    if (!this.originalFormValues) return false;

    if (this.file || this.shouldRemoveLogo) {
      return true;
    }

    const currentValues = this.detailsForm.value;

    for (const key in this.originalFormValues) {
      if (key === 'logo') continue;

      if (
        typeof this.originalFormValues[key] === 'string' ||
        typeof currentValues[key] === 'string'
      ) {
        const originalValue = this.originalFormValues[key] || '';
        const currentValue = currentValues[key] || '';

        if (originalValue.trim() !== currentValue.trim()) {
          return true;
        }
      } else if (this.originalFormValues[key] !== currentValues[key]) {
        return true;
      }
    }

    return false;
  }

  private checkScreenSize(): void {
    this.isMobileView = window.innerWidth < 768;
  }

  get logoUrl(): string {
    if (
      this.detailsForm.get('logo')?.value &&
      typeof this.detailsForm.get('logo')?.value === 'string'
    ) {
      return this.detailsForm.get('logo')?.value;
    }

    if (this.hallData?.logo_url) {
      return this.hallData.logo_url;
    }

    return '';
  }

  private initForm(): void {
    this.detailsForm = this.fb.group(
      {
        name: ['', noDoubleSpaceValidator()],
        name_ar: ['', noDoubleSpaceValidator()],
        description: [''],
        primary_color: ['', noDoubleSpaceValidator()],
        secondary_color: ['', noDoubleSpaceValidator()],
        logo: [''],
        dailyTempBookings: [
          null,
          [Validators.min(0), noDoubleSpaceValidator()],
        ],
        autoCancelDaysTempBookings: [
          null,
          [Validators.min(1), Validators.max(30), noDoubleSpaceValidator()],
        ],
      },
      {
        validators: requireOneOf(['name', 'name_ar']),
      },
    );
  }

  private patchFormValues(): void {
    if (!this.hallData || !this.detailsForm) return;

    const {
      name,
      name_ar,
      description,
      primary_color,
      secondary_color,
      dailyTempBookings,
      autoCancelDaysTempBookings,
    } = this.hallData;

    this.detailsForm.patchValue({
      name: name || '',
      name_ar: name_ar || '',
      description: description || '',
      primary_color: primary_color || '',
      secondary_color: secondary_color || '',
      dailyTempBookings: dailyTempBookings,
      autoCancelDaysTempBookings: autoCancelDaysTempBookings,
    });

    this.cdr.detectChanges();
  }

  onChangePhoto(files: FileList | null): void {
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];

    if (!file.type.match(/image\/(jpeg|jpg|png|gif|bmp|svg\+xml|webp)/)) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (event: any) => {
      this.logoPreviewUrl = event.target.result;
      this.file = file;
      this.shouldRemoveLogo = false;
      this.formChanged.emit();

      this.checkImageTransparency(event.target.result);

      this.showColorExtractor = true;
      this.colorExtractionComplete = false;
      this.cdr.detectChanges();
    };

    reader.readAsDataURL(file);
  }

  private checkImageTransparency(dataUrl: string): void {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 255) {
            this.uploadedImageHasTransparency = true;
            return;
          }
        }
        this.uploadedImageHasTransparency = false;
      }
    };
    img.src = dataUrl;
  }

  deleteLogo(): void {
    this.detailsForm.get('logo')?.reset();
    this.file = null;
    this.shouldRemoveLogo = true;
    this.logoPreviewUrl = '';
    this.formChanged.emit();
    this.cdr.detectChanges();
  }

  openColorPickerFromLogo(): void {
    if (!this.logoUrl) {
      return;
    }

    this.logoPreviewUrl = this.logoUrl;
    this.showColorExtractor = true;
    this.colorExtractionComplete = false;
    this.cdr.detectChanges();
  }

  closeColorExtractor(): void {
    this.showColorExtractor = false;
    this.cdr.detectChanges();
  }

  onColorSelected(event: {type: 'primary' | 'secondary'; color: string}): void {
    this.detailsForm.get(`${event.type}_color`)?.setValue(event.color);
    this.colorExtractionComplete = true;
    this.formChanged.emit();
  }

  updateColorManually(controlName: string, event: any): void {
    const colorValue = event.target.value;

    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(colorValue)) {
      let hexColor = colorValue;
      if (hexColor.length === 4) {
        hexColor =
          '#' +
          hexColor[1] +
          hexColor[1] +
          hexColor[2] +
          hexColor[2] +
          hexColor[3] +
          hexColor[3];
      }

      this.detailsForm.get(controlName)?.setValue(hexColor.toUpperCase());
      event.target.classList.remove('invalid');
      this.formChanged.emit();
    } else {
      event.target.classList.add('invalid');
    }
  }

  confirmColorSelection(): void {
    if (this.file) {
      this.detailsForm.get('logo')?.setValue(this.logoPreviewUrl);
      this.formChanged.emit();
    }
    this.closeColorExtractor();
  }

  resetColors(): void {
    this.detailsForm.patchValue({
      primary_color: '#3B82F6',
      secondary_color: '#64748B',
    });
    this.formChanged.emit();
  }

  submitDetails(): void {
    if (this.detailsForm.invalid) {
      this.detailsForm.markAllAsTouched();
      return;
    }

    const formData = this.prepareFormData();
    this.isSubmitting = true;

    this.hallsService
      .updateHall(+this.hallId, formData)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        }),
      )
      .subscribe({
        next: (updatedHall) => {
          this.hallData = updatedHall;
          this.patchFormValues();
          this.detailsUpdated.emit(updatedHall);
          this.file = null;
          this.shouldRemoveLogo = false;
          this.originalFormValues = JSON.parse(
            JSON.stringify(this.detailsForm.value),
          );
        },
      });
  }

  private prepareFormData(): FormData {
    const formValue = this.detailsForm.value;
    const formData = new FormData();

    formData.append('name', formValue.name || '');
    formData.append('name_ar', formValue.name_ar || '');
    formData.append('description', formValue.description || '');
    formData.append('primary_color', formValue.primary_color || '');
    formData.append('secondary_color', formValue.secondary_color || '');

    if (
      formValue.dailyTempBookings !== null &&
      formValue.dailyTempBookings !== undefined
    ) {
      formData.append(
        'dailyTempBookings',
        formValue.dailyTempBookings.toString(),
      );
    }

    if (
      formValue.autoCancelDaysTempBookings !== null &&
      formValue.autoCancelDaysTempBookings !== undefined
    ) {
      formData.append(
        'autoCancelDaysTempBookings',
        formValue.autoCancelDaysTempBookings.toString(),
      );
    }

    if (this.file) {
      formData.append('logo', this.file);
    } else if (this.shouldRemoveLogo) {
      formData.append('removeLogo', 'true');
    }

    return formData;
  }

  private resetForm(): void {
    if (this.originalFormValues) {
      this.file = null;
      this.shouldRemoveLogo = false;
      this.detailsForm.patchValue(this.originalFormValues, {emitEvent: false});
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
