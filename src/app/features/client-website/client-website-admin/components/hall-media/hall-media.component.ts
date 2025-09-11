import {
  Component,
  OnChanges,
  Input,
  SimpleChanges,
  EventEmitter,
  Output,
} from '@angular/core';
import {
  ControlContainer,
  FormArray,
  FormBuilder,
  FormGroup,
  FormGroupDirective,
} from '@angular/forms';
import {LandingPageService} from '../../services/landing-page.service';
import {finalize} from 'rxjs';
import {
  LandingGeneralInformationDto,
  MediaConfig,
  MediaItem,
  MediaType,
} from '@client-website-admin/models/landing-page.model';
import {LandingPageSection} from '@client-website-admin/models/section.model';
import {NotificationService} from '@core/services/notification.service';

@Component({
  selector: 'app-hall-media',
  templateUrl: './hall-media.component.html',
  styleUrls: ['./hall-media.component.scss'],
  viewProviders: [{provide: ControlContainer, useExisting: FormGroupDirective}],
  standalone: false,
})
export class HallMediaComponent implements OnChanges {
  @Input() landingPageData: LandingGeneralInformationDto | null = null;
  @Input() section: LandingPageSection | null = null;
  @Output() mediaUpdated = new EventEmitter<LandingGeneralInformationDto>();

  banners: MediaItem[] = [];
  images: MediaItem[] = [];
  loading = false;

  private readonly mediaConfig: Record<MediaType, MediaConfig> = {
    banners: {maxItems: 5, formKey: 'hallBanner', translationKey: 'banner'},
    images: {maxItems: 12, formKey: 'hallImages', translationKey: 'image'},
  };

  constructor(
    private controlContainer: ControlContainer,
    private landingPageService: LandingPageService,
    private fb: FormBuilder,
    private notificationService: NotificationService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['landingPageData'] && this.section) {
      this.updateWithNewData(this.section);
    }
  }

  get form(): FormGroup {
    return this.controlContainer.control as FormGroup;
  }

  addMediaItem(type: MediaType) {
    const array = this.getMediaArray(type);
    const config = this.mediaConfig[type];

    if (array.length < config.maxItems) {
      array.push({file: null, order: array.length + 1});
      this.updateFormArrays();
    }
  }

  onDirectFileUpload(event: Event, type: MediaType) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.addMediaItem(type);
      const array = this.getMediaArray(type);
      this.onFileSelected(event, type, array.length - 1);
      (event.target as HTMLInputElement).value = '';
    }
  }

  removeMediaItem(type: MediaType, index: number) {
    const array = this.getMediaArray(type);
    const item = array[index];
    const config = this.mediaConfig[type];

    if (item.id && this.landingPageData?.id) {
      this.loading = true;
      this.landingPageService
        .deleteMedia(type, item.id)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: () => {
            array.splice(index, 1);
            this.updateFormArrays();
            this.refreshAndUpdateData();
            this.notificationService.showSuccess(
              `landing.${config.translationKey}Deleted`,
            );
          },
          error: () => {
            this.notificationService.showError(
              `landing.${config.translationKey}DeleteError`,
            );
          },
        });
    } else {
      array.splice(index, 1);
      this.updateFormArrays();
      this.notificationService.showSuccess(
        `landing.${config.translationKey}Deleted`,
      );
    }
  }

  onFileSelected(event: Event, type: MediaType, index: number) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (
      !file ||
      !file.type.startsWith('image/') ||
      file.size > 5 * 1024 * 1024
    ) {
      return;
    }

    const array = this.getMediaArray(type);
    const config = this.mediaConfig[type];

    array[index] = {
      ...array[index],
      file,
      url: URL.createObjectURL(file),
      isUploading: false,
      error: undefined,
    };

    this.landingPageService
      .uploadMedia(this.section?.id!, [file], type)
      .subscribe((res) => {
        this.updateMediaArray(type, res);
        this.notificationService.showSuccess(
          `landing.${config.translationKey}Saved`,
        );
      });
  }

  onOrderChange(event: any, type: MediaType, id: number) {
    const config = this.mediaConfig[type];

    this.landingPageService
      .updateMediaOrder(type, id, event.value)
      .subscribe((res) => {
        this.updateMediaArray(type, res);
        this.notificationService.showSuccess(
          `landing.${config.translationKey}sReordered`,
        );
      });
  }

  getOrderOptions(totalItems: number): any[] {
    return Array.from({length: totalItems}, (_, i) => ({
      label: `${i + 1}`,
      value: i + 1,
    }));
  }

  canAddNewMedia(type: MediaType): boolean {
    const array = this.getMediaArray(type);
    const config = this.mediaConfig[type];

    return (
      array.length < config.maxItems &&
      (array.length === 0 ||
        !!(array[array.length - 1]?.file || array[array.length - 1]?.url))
    );
  }

  getMediaArray(type: MediaType): MediaItem[] {
    return type === 'banners' ? this.banners : this.images;
  }

  private updateMediaArray(type: MediaType, serverItems: any[]): void {
    const processedItems = serverItems.map((item) => ({
      id: item.id,
      url: item.path,
      file: null,
      order: item.order,
      mimetype: item.mimetype,
    }));

    if (type === 'banners') {
      this.banners = [...processedItems];
    } else {
      this.images = [...processedItems];
    }
  }

  private updateWithNewData(data: LandingPageSection) {
    if (!data) return;

    const processItems = (items: any[]): MediaItem[] =>
      (items || [])
        .map((item) => ({
          id: item.id,
          url: item.path,
          file: null,
          order: Number(item.order) || 0,
          mimetype: item.mimetype,
          isUploading: false,
          error: undefined,
        }))
        .sort((a, b) => (a.order || 0) - (b.order || 0));

    this.banners = processItems(data.banners || []);
    this.images = processItems(data.images || []);
    this.updateFormArrays();
  }

  private updateFormArrays() {
    Object.entries(this.mediaConfig).forEach(([type, config]) => {
      const array = this.getMediaArray(type as MediaType);
      const formArray = this.form.get(config.formKey) as FormArray;

      formArray.clear();
      array.forEach((item) =>
        formArray.push(this.fb.control(item.file || item.url)),
      );
    });
  }

  private refreshAndUpdateData() {
    if (this.landingPageData?.id) {
      this.loading = true;
      this.landingPageService
        .getLandingPageInformation(this.landingPageData?.hall?.id!)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (updatedData) => {
            if (updatedData) {
              this.landingPageData = updatedData;
              this.mediaUpdated.emit(updatedData);
            }
          },
        });
    }
  }
}
