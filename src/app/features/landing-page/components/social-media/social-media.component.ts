import {
  Component,
  OnInit,
  OnChanges,
  Input,
  SimpleChanges,
} from '@angular/core';
import {
  ControlContainer,
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  Validators,
  AbstractControl,
} from '@angular/forms';
import {LandingPageService} from '../../services/landing-page.service';
import {LandingGeneralInformationDto} from '@admin-landing-page/models/landing-page.model';
import {TranslateService} from '@ngx-translate/core';
import {LandingPageSection} from '@admin-landing-page/models/section.model';

@Component({
    selector: 'app-social-media',
    templateUrl: './social-media.component.html',
    styleUrls: ['./social-media.component.scss'],
    viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
    standalone: false
})
export class SocialMediaComponent implements OnInit, OnChanges {
  @Input() landingPageData: LandingGeneralInformationDto | null = null;
  @Input() section: LandingPageSection | null = null;

  isEditMode = false;
  isSaving = false;

  readonly socialMediaPlatforms: any = [
    {
      key: 'facebook',
      icon: 'pi pi-facebook',
      label: this.translate.instant('landing.facebook'),
    },
    {
      key: 'instagram',
      icon: 'pi pi-instagram',
      label: this.translate.instant('landing.instagram'),
    },
    {
      key: 'x',
      icon: 'pi pi-twitter',
      label: this.translate.instant('landing.x'),
    },
    {
      key: 'linkedin',
      icon: 'pi pi-linkedin',
      label: this.translate.instant('landing.linkedin'),
    },
    {
      key: 'snapChat',
      iconClass: 'snap-icon',
      label: this.translate.instant('landing.snapchat'),
    },
    {
      key: 'tiktok',
      icon: 'pi pi-tiktok',
      label: this.translate.instant('landing.tiktok'),
    },
  ];

  readonly urlPattern =
    /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;

  constructor(
    private controlContainer: ControlContainer,
    private fb: FormBuilder,
    private landingPageService: LandingPageService,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.initializeSocialLinksForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['landingPageData'] && this.section) {
      this.updateSocialLinks(this.section);
    }
  }

  private initializeSocialLinksForm() {
    if (!this.form.contains('socialLinks')) {
      this.form.addControl(
        'socialLinks',
        this.fb.group({
          facebook: [null, [Validators.pattern(this.urlPattern)]],
          instagram: [null, [Validators.pattern(this.urlPattern)]],
          x: [null, [Validators.pattern(this.urlPattern)]],
          linkedin: [null, [Validators.pattern(this.urlPattern)]],
          snapChat: [null, [Validators.pattern(this.urlPattern)]],
          tiktok: [null, [Validators.pattern(this.urlPattern)]],
        }),
      );
    }
  }

  private updateSocialLinks(data: LandingPageSection) {
    this.isEditMode = false;

    if (data.socialLinks) {
      const links = data.socialLinks;
      this.socialLinks.patchValue(
        {
          facebook: links.facebook || null,
          instagram: links.instagram || null,
          x: links.x || null,
          linkedin: links.linkedin || null,
          snapChat: links.snapChat || null,
          tiktok: links.tiktok || null,
        },
        {emitEvent: false},
      );
    } else {
      this.socialLinks.reset();
    }
  }

  get form(): FormGroup {
    return this.controlContainer.control as FormGroup;
  }

  get socialLinks(): FormGroup {
    return this.form.get('socialLinks') as FormGroup;
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  async saveSocialLinks() {
    if (!this.landingPageData?.id || this.isSaving) return;

    if (this.socialLinks.invalid) {
      this.socialLinks.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    try {
      const sanitizedSocialLinks = Object.fromEntries(
        Object.entries(this.socialLinks.value).map(([key, value]) => [
          key,
          value === '' ? null : value,
        ]),
      );

      await this.landingPageService
        .updateSocialLinks(this.section?.id!, sanitizedSocialLinks)
        .toPromise();

      if (this.section) {
        this.section.socialLinks = sanitizedSocialLinks;
      }
      this.isEditMode = false;
    } catch (error) {
      if (this.section) {
        this.updateSocialLinks(this.section);
      }
    } finally {
      this.isSaving = false;
    }
  }

  cancelEdit() {
    this.isEditMode = false;
    if (this.section) {
      this.updateSocialLinks(this.section);
    }
  }

  isValidUrl(url: string): boolean {
    if (!url) return true;
    return this.urlPattern.test(url);
  }

  getErrorMessage(control: AbstractControl): string {
    if (control.hasError('pattern')) {
      return 'landing.invalidUrl';
    }
    return '';
  }

  hasAnySocialLinks(): boolean {
    return this.socialMediaPlatforms.some(
      (platform: {key: any}) => !!this.socialLinks.get(platform.key)?.value,
    );
  }
}
