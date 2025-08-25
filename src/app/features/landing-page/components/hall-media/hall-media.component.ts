import {
  Component,
  OnChanges,
  Input,
  SimpleChanges,
  EventEmitter,
  Output,
  ChangeDetectorRef,
} from '@angular/core';
import {
  ControlContainer,
  FormArray,
  FormBuilder,
  FormGroup,
  FormGroupDirective,
} from '@angular/forms';
import {LandingPageService} from '../../services/landing-page.service';
import {finalize, forkJoin, map, Observable, switchMap} from 'rxjs';
import {
  LandingGeneralInformationDto,
  MediaItem,
  MediaOrderItem,
  MediaUploadResponse,
} from '@admin-landing-page/models/landing-page.model';
import {LandingPageSection} from '@admin-landing-page/models/section.model';

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
  maxBanners = 5;
  maxImages = 12;
  loading = false;

  constructor(
    private controlContainer: ControlContainer,
    private landingPageService: LandingPageService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['landingPageData'] && this.section) {
      this.updateWithNewData(this.section);
    }
  }

  get form(): FormGroup {
    return this.controlContainer.control as FormGroup;
  }

  finishEditing() {
    this.refreshAndUpdateData();
  }

  addMediaItem(type: 'banners' | 'images') {
    const array = type === 'banners' ? this.banners : this.images;
    const maxItems = type === 'banners' ? this.maxBanners : this.maxImages;

    if (array.length < maxItems) {
      array.push({
        file: null,
        order: array.length + 1,
      });
      this.updateFormArrays();
    }
  }

  onDirectFileUpload(event: Event, type: 'banners' | 'images') {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.addMediaItem(type);
      const array = type === 'banners' ? this.banners : this.images;
      const index = array.length - 1;

      this.onFileSelected(event, type, index);

      (event.target as HTMLInputElement).value = '';
    }
  }

  removeMediaItem(type: 'banners' | 'images', index: number) {
    const array = type === 'banners' ? this.banners : this.images;
    const item = array[index];
    const landingPageId = this.landingPageData?.id;

    if (item.id && landingPageId) {
      this.loading = true;
      this.landingPageService
        .deleteMedia(type, item.id)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: () => {
            array.splice(index, 1);
            this.updateFormArrays();
            this.refreshAndUpdateData();
          },
        });
    } else {
      array.splice(index, 1);
      this.updateFormArrays();
    }
  }

  onFileSelected(event: Event, type: 'banners' | 'images', index: number) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return;
      }

      const array = type === 'banners' ? this.banners : this.images;
      const previewUrl = URL.createObjectURL(file);

      array[index] = {
        ...array[index],
        file,
        url: previewUrl,
        isUploading: false,
        error: undefined,
      };

      this.landingPageService
        .uploadMedia(this.section?.id!, [file], type)
        .subscribe((res) => {
          const serverItems = res.map((serverItem) => ({
            id: serverItem.id,
            url: serverItem.path,
            file: null,
            order: serverItem.order,
            mimetype: serverItem.mimetype,
          }));

          if (type === 'banners') {
            this.banners = [...serverItems];
          } else {
            this.images = [...serverItems];
          }
        });

      // this.updateFormArrays();
    }
  }

  onOrderChange(event: any, type: 'banners' | 'images', id: number) {
    const newOrder = event.value;

    this.landingPageService
      .updateMediaOrder(type, id, newOrder)
      .subscribe((res) => {
        const serverItems = res.map((serverItem) => ({
          id: serverItem.id,
          url: serverItem.path,
          file: null,
          order: serverItem.order,
          mimetype: serverItem.mimetype,
        }));

        if (type === 'banners') {
          this.banners = [...serverItems];
        } else {
          this.images = [...serverItems];
        }
      });
  }

  saveMedia() {
    const sectionId = this.section?.id;
    if (!sectionId || this.loading) {
      return;
    }

    const bannersToUpload = this.banners
      .filter((b) => b.file)
      .map((b) => b.file!);
    const imagesToUpload = this.images
      .filter((i) => i.file)
      .map((i) => i.file!);

    if (!bannersToUpload.length && !imagesToUpload.length) {
      return;
    }

    this.loading = true;
    const uploads: Observable<MediaOrderItem[] | null>[] = [];

    if (bannersToUpload.length) {
      uploads.push(
        this.landingPageService.uploadMedia(
          sectionId,
          bannersToUpload,
          'banners',
        ),
      );
    }

    if (imagesToUpload.length) {
      uploads.push(
        this.landingPageService.uploadMedia(
          sectionId,
          imagesToUpload,
          'images',
        ),
      );
    }

    forkJoin(uploads)
      .pipe(
        switchMap(() => {
          return this.landingPageService.getLandingPageInformation(
            this.landingPageData?.hall?.id!,
          );
        }),
        finalize(() => {
          this.loading = false;
          this.cleanupBlobUrls();
        }),
      )
      .subscribe({
        next: (updatedLandingPageData) => {
          this.landingPageData = updatedLandingPageData;
          this.mediaUpdated.emit(updatedLandingPageData);
        },
      });
  }

  getOrderOptions(totalItems: number): any[] {
    return Array.from({length: totalItems}, (_, i) => ({
      label: `${i + 1}`,
      value: i + 1,
    }));
  }

  canAddNewMedia(type: 'banners' | 'images'): boolean {
    const array = type === 'banners' ? this.banners : this.images;
    const maxItems = type === 'banners' ? this.maxBanners : this.maxImages;

    if (array.length >= maxItems) {
      return false;
    }

    if (array.length === 0) {
      return true;
    }

    const lastItem = array[array.length - 1];
    return !!(lastItem.file || lastItem.url);
  }

  hasUnsavedChanges(): boolean {
    return this.banners.some((b) => b.file) || this.images.some((i) => i.file);
  }

  private updateWithNewData(data: LandingPageSection) {
    if (!data) return;

    const processItems = (items: any[]): MediaItem[] => {
      const processed = (items || [])
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

      return processed;
    };

    this.banners = processItems(data.banners || []);
    this.images = processItems(data.images || []);
    this.updateFormArrays();
  }

  private updateFormArrays() {
    const hallBannerArray = this.form.get('hallBanner') as FormArray;
    const hallImagesArray = this.form.get('hallImages') as FormArray;

    while (hallBannerArray.length) {
      hallBannerArray.removeAt(0);
    }
    while (hallImagesArray.length) {
      hallImagesArray.removeAt(0);
    }

    this.banners.forEach((banner) => {
      hallBannerArray.push(this.fb.control(banner.file || banner.url));
    });

    this.images.forEach((image) => {
      hallImagesArray.push(this.fb.control(image.file || image.url));
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
              this.cdr.detectChanges();
            }
          },
        });
    }
  }

  private cleanupBlobUrls() {
    this.banners.forEach((banner) => {
      if (banner.url?.startsWith('blob:')) {
        URL.revokeObjectURL(banner.url);
      }
    });
    this.images.forEach((image) => {
      if (image.url?.startsWith('blob:')) {
        URL.revokeObjectURL(image.url);
      }
    });
  }
}
