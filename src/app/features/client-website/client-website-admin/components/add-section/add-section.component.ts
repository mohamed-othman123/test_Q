import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {
  LandingPageSectionType,
  SectionTemplate,
  CreateLandingPageSectionDto,
} from '@client-website-admin/models/section.model';
import {LandingPageService} from '@client-website-admin/services/landing-page.service';
import {LandingGeneralInformationDto} from '@client-website-admin/models/landing-page.model';
import {LanguageService, NotificationService} from '@core/services';
import {noDoubleSpaceValidator, requiredIf} from '@core/validators';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {Hall} from '@halls/models/halls.model';

@Component({
  selector: 'add-section',
  templateUrl: './add-section.component.html',
  styleUrls: ['./add-section.component.scss'],
  standalone: false,
})
export class AddSectionComponent implements OnInit, AfterViewInit {
  @Input() landingPageData!: LandingGeneralInformationDto;
  @Input() currentHall: Hall | null = null;
  @Output() sectionsReordered = new EventEmitter<void>();
  @Output() mediaUpdated = new EventEmitter<any>();

  @ViewChild('sectionsList') sectionsList!: ElementRef;

  sectionTemplates: SectionTemplate[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private landingPageService: LandingPageService,
    public lang: LanguageService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeSectionTemplates();
    this.mapExistingSections();
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  private initializeSectionTemplates(): void {
    const templates = [
      {
        type: LandingPageSectionType.SERVICES,
        label: {en: 'Services', ar: 'الخدمات'},
        description: {
          en: 'Showcase your hall services',
          ar: 'عرض خدمات القاعة',
        },
        icon: 'pi pi-briefcase',
      },
      {
        type: LandingPageSectionType.FEATURES,
        label: {en: 'Features', ar: 'المميزات'},
        description: {
          en: 'Highlight key features',
          ar: 'تسليط الضوء على الميزات الرئيسية',
        },
        icon: 'pi pi-star',
      },
      {
        type: LandingPageSectionType.CUSTOMERS,
        label: {en: 'Customers', ar: 'العملاء'},
        description: {
          en: 'Display customer testimonials',
          ar: 'عرض قائمة العملاء',
        },
        icon: 'pi pi-users',
      },
      {
        type: LandingPageSectionType.POPULAR_QUESTION,
        label: {en: 'FAQ', ar: 'الأسئلة الشائعة'},
        description: {
          en: 'Common questions and answers',
          ar: 'الأسئلة والأجوبة الشائعة',
        },
        icon: 'pi pi-question-circle',
      },
      {
        type: LandingPageSectionType.IMAGES,
        label: {en: 'Gallery', ar: 'معرض الصور'},
        description: {en: 'Image gallery showcase', ar: 'عرض معرض الصور'},
        icon: 'pi pi-images',
      },
      {
        type: LandingPageSectionType.BANNERS,
        label: {en: 'Banners', ar: 'اللافتات'},
        description: {en: 'Promotional banners', ar: 'لافتات ترويجية'},
        icon: 'pi pi-image',
      },
      {
        type: LandingPageSectionType.SOCIAL_LINKS,
        label: {en: 'Social Media', ar: 'وسائل التواصل'},
        description: {
          en: 'Social media links',
          ar: 'روابط وسائل التواصل الاجتماعي',
        },
        icon: 'pi pi-share-alt',
      },
      {
        type: LandingPageSectionType.HALL_SECTIONS,
        label: {en: 'Hall Sections', ar: 'أقسام القاعة'},
        description: {
          en: 'Display hall sections',
          ar: 'عرض أقسام القاعة',
        },
        icon: 'pi pi-chart-bar',
      },
      {
        type: LandingPageSectionType.EVENTS,
        label: {en: 'Hall Events', ar: 'مناسبات القاعة'},
        description: {
          en: 'Showcase hall events',
          ar: 'عرض مناسبات القاعة',
        },
        icon: 'pi pi-calendar',
      },
    ];

    this.sectionTemplates = templates.map((template, index) => ({
      ...template,
        isEnabled: false,
        isExpanded: false,
        isEditing: false,
        isBasicDetailsExpanded: false,
        isEditingBasicDetails: false,
        order: index + 1,
      form: this.createSectionForm(),
    }));
  }

  private mapExistingSections(): void {
    if (this.landingPageData?.sections) {
      this.landingPageData.sections.forEach((section) => {
        const template = this.sectionTemplates.find(
          (t) => t.type === section.type,
        );
        if (template) {
          template.isEnabled = section.isActive;
          template.data = section;
          template.order = section.order;

          if (section.isActive) {
            template.form = this.createSectionFormWithValidation(template);
            template.isBasicDetailsExpanded = true;

            template.form?.patchValue({
              title_en: section.title_en || '',
              title_ar: section.title_ar || '',
              description_en: section.description_en || '',
              description_ar: section.description_ar || '',
            });
          } else {
            template.form = this.createSectionForm();
            template.isBasicDetailsExpanded = false;
            template.isExpanded = false;
          }
        }
      });

      this.sectionTemplates.sort((a, b) => {
        if (a.data?.isActive && b.data?.isActive) {
          return a.order - b.order;
        }
        if (a.data?.isActive && !b.data?.isActive) return -1;
        if (!a.data?.isActive && b.data?.isActive) return 1;
        return 0;
      });
    }
  }

  private createSectionForm(): FormGroup {
    return this.fb.group({
      title_en: ['', [noDoubleSpaceValidator()]],
      title_ar: ['', [noDoubleSpaceValidator()]],
      description_en: ['', [noDoubleSpaceValidator()]],
      description_ar: ['', [noDoubleSpaceValidator()]],
    });
  }

  private createSectionFormWithValidation(template: SectionTemplate): FormGroup {
    return this.fb.group({
      title_en: ['', [noDoubleSpaceValidator()]],
      title_ar: ['', [noDoubleSpaceValidator()]],
      description_en: ['', [noDoubleSpaceValidator()]],
      description_ar: ['', [noDoubleSpaceValidator()]],
    });
  }

  onSectionToggle(template: SectionTemplate, isEnabled: boolean): void {
    if (isEnabled) {
      this.enableSection(template);
    } else {
      this.disableSection(template);
    }
  }

  deleteSection(template: SectionTemplate): void {
    if (!template.data?.id) {
      return;
    }

    this.isLoading = true;

    this.landingPageService.removeSection(template.data.id).subscribe({
      next: () => {
        template.isEnabled = false;
        template.isExpanded = false;
        template.isBasicDetailsExpanded = false;
        template.data = undefined;
        template.form?.reset();
        template.form = this.createSectionForm();

        this.updateLandingPageData();
        this.reorderSectionTemplates();
        this.isLoading = false;
        this.notificationService.showSuccess('landing.sectionDeleted');
        this.refreshLandingPageData();
      },
      error: (error) => {
        console.error('Error deleting section:', error);
        this.isLoading = false;
        this.notificationService.showError('landing.sectionDeleteError');
      },
    });
  }

  private enableSection(template: SectionTemplate): void {
    const enabledSections = this.sectionTemplates.filter(
      (t) => t.data?.isActive && t !== template,
    );
    template.order = enabledSections.length + 1;

    if (template.data?.id) {
      this.landingPageService.updateSection(template.data.id, { isActive: true }).subscribe({
        next: (updatedSection) => {
          template.isEnabled = true;
          template.data = updatedSection;
          template.form = this.createSectionFormWithValidation(template);
          template.isBasicDetailsExpanded = true;
          template.isExpanded = true;
          this.updateLandingPageData();
          this.reorderSectionTemplates();
          this.notificationService.showSuccess('landing.sectionActivated');
          this.refreshLandingPageData();
        },
        error: (error) => {
          template.isEnabled = false;
          this.notificationService.showError('landing.sectionActivateError');
        },
      });
    } else {
      template.form = this.createSectionFormWithValidation(template);
      template.isBasicDetailsExpanded = true;
      template.isExpanded = true;
      this.createSection(template);
    }
  }

  private createSection(template: SectionTemplate): void {
    this.isLoading = true;

    const sectionData: CreateLandingPageSectionDto = {
      landingPageId: this.landingPageData.id!,
      type: template.type,
      title_en: '',
      title_ar: '',
      description_en: '',
      description_ar: '',
      order: template.order,
      isActive: true,
    };

    this.landingPageService
      .addSection(sectionData)
      .subscribe({
        next: (newSection) => {
          template.data = newSection;
          template.isEnabled = true;

          template.form = this.createSectionFormWithValidation(template);

          this.sectionTemplates.forEach(t => {
            if (t !== template) {
              t.isExpanded = false;
            }
          });
          template.isExpanded = true;
          this.updateLandingPageData();
          this.isLoading = false;

          setTimeout(() => {
            this.scrollToSection(template);
          }, 300);

          this.notificationService.showSuccess('landing.sectionAdded');
          this.refreshLandingPageData();
        },
        error: (error) => {
          console.error('Error creating section:', error);
          template.isEnabled = false;
          this.isLoading = false;
          this.notificationService.showError('landing.sectionAddError');
        },
      });
  }

  private disableSection(template: SectionTemplate): void {
    if (template.data?.id) {
      this.landingPageService.updateSection(template.data.id, { isActive: false }).subscribe({
        next: (updatedSection) => {
          template.isEnabled = false;
          template.isExpanded = false;
          template.isBasicDetailsExpanded = false;
          template.data = updatedSection;
          template.form?.reset();

          template.form = this.createSectionForm();
          this.updateLandingPageData();
          this.reorderSectionTemplates();

          this.notificationService.showSuccess('landing.sectionDeactivated');
          this.refreshLandingPageData();
        },
        error: (error) => {
          console.error('Error deactivating section:', error);
          template.isEnabled = true;
          this.notificationService.showError('landing.sectionDeactivateError');
        },
      });
    } else {
      template.isEnabled = false;
      template.isExpanded = false;
      template.isBasicDetailsExpanded = false;

      template.form = this.createSectionForm();

      this.notificationService.showSuccess('landing.sectionDisabled');
    }
  }

  onSectionExpand(template: SectionTemplate): void {
    const wasExpanding = !template.isExpanded;

    if (wasExpanding) {
      this.sectionTemplates.forEach(t => {
        if (t !== template) {
          t.isExpanded = false;
        }
      });
    }

    template.isExpanded = !template.isExpanded;
    this.cdr.detectChanges();

    if (wasExpanding) {
      setTimeout(() => {
        this.scrollToSection(template);
      }, 300);
    }
  }

  onSectionDropped(event: CdkDragDrop<SectionTemplate[]>) {
    if (event.previousIndex !== event.currentIndex) {
      const enabledSections = this.getEnabledSections();
      const movedSection = enabledSections[event.previousIndex];

      moveItemInArray(enabledSections, event.previousIndex, event.currentIndex);

      enabledSections.forEach((section, index) => {
        section.order = index + 1;
      });

      this.updateSectionOrders(movedSection);
      this.reorderSectionTemplates();
    }
  }

  private scrollToSection(template: SectionTemplate): void {
    setTimeout(() => {
      const sectionElement = document.querySelector(`.enabled-sections [data-section-type="${template.type}"]`);

      if (sectionElement) {
        sectionElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      } else {
        const enabledContainer = document.querySelector('.enabled-sections');
        if (enabledContainer) {
          enabledContainer.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
        }
      }
    }, 250);
  }

  onMediaUpdated(updatedData: any): void {
    this.mediaUpdated.emit(updatedData);
  }

  hasExpandedSection(): boolean {
    return this.sectionTemplates.some(template => template.isExpanded);
  }


  private updateSectionOrders(movedSection: SectionTemplate): void {
    if (movedSection && movedSection.data?.id) {
      this.landingPageService
        .updateSection(movedSection.data.id, {order: movedSection.order})
        .subscribe({
          next: (updatedSection) => {
            movedSection.data = updatedSection;
            this.updateLandingPageData();
            this.notificationService.showSuccess('landing.sectionsReordered');
            this.sectionsReordered.emit();
          },
          error: (error) => {
            this.notificationService.showError('landing.sectionsReorderError');
          },
        });
    }
  }

  private reorderSectionTemplates(): void {
    this.sectionTemplates.sort((a, b) => {
      if (a.data?.isActive && b.data?.isActive) {
        return a.order - b.order;
      }
      if (a.data?.isActive && !b.data?.isActive) return -1;
      if (!a.data?.isActive && b.data?.isActive) return 1;
      return 0;
    });
  }

  private updateLandingPageData(): void {
    this.landingPageData.sections = this.sectionTemplates
      .filter((t) => t.data?.isActive && t.data)
      .map((t) => t.data!)
      .sort((a, b) => a.order - b.order);
  }

  private refreshLandingPageData(): void {
    if (this.landingPageData?.hall?.id) {
      this.landingPageService
        .getLandingPageInformation(this.landingPageData.hall.id)
        .subscribe({
          next: (updatedData) => {
            if (updatedData) {
              this.landingPageData = updatedData;
              this.mapExistingSections();
            }
          }
        });
    }
  }

  getEnabledSections(): SectionTemplate[] {
    return this.sectionTemplates.filter((t) => t.data?.isActive === true);
  }

  getDisabledSections(): SectionTemplate[] {
    return this.sectionTemplates.filter((t) => !t.data?.isActive);
  }


  toggleBasicDetails(template: SectionTemplate): void {
    template.isBasicDetailsExpanded = !template.isBasicDetailsExpanded;
    this.cdr.detectChanges();
  }

  editBasicDetails(template: SectionTemplate, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    template.form = this.createSectionFormWithValidation(template);

    if (template.data) {
      template.form.patchValue({
        title_en: template.data.title_en || '',
        title_ar: template.data.title_ar || '',
        description_en: template.data.description_en || '',
        description_ar: template.data.description_ar || '',
      });
    }

    template.isEditingBasicDetails = true;
    template.isBasicDetailsExpanded = true;
    this.cdr.detectChanges();
  }

  saveBasicDetails(template: SectionTemplate): void {
    if (!template.form?.valid) {
      template.form?.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formData = template.form.value;

    if (template.data?.id) {
      this.landingPageService.updateSection(template.data.id, {
        title_en: formData.title_en,
        title_ar: formData.title_ar,
        description_en: formData.description_en,
        description_ar: formData.description_ar,
      }).subscribe({
        next: (updatedSection) => {
          template.data = updatedSection;
          template.isEditingBasicDetails = false;
          this.isLoading = false;
          this.notificationService.showSuccess('landing.sectionUpdated');
        },
        error: (error) => {
          this.isLoading = false;
          this.notificationService.showError('landing.sectionUpdateError');
        },
      });
    } else {
      const sectionData: CreateLandingPageSectionDto = {
        landingPageId: this.landingPageData.id!,
        type: template.type,
        title_en: formData.title_en,
        title_ar: formData.title_ar,
        description_en: formData.description_en,
        description_ar: formData.description_ar,
        order: template.order,
        isActive: true,
      };

      this.landingPageService.addSection(sectionData).subscribe({
        next: (newSection) => {
          template.data = newSection;
          template.isEditingBasicDetails = false;
          this.updateLandingPageData();
          this.isLoading = false;
          this.notificationService.showSuccess('landing.sectionAdded');
          this.refreshLandingPageData();
        },
        error: (error) => {
          console.error('Error creating section:', error);
          this.isLoading = false;
          this.notificationService.showError('landing.sectionAddError');
        },
      });
    }
  }

  cancelEditBasicDetails(template: SectionTemplate): void {
    if (template.data) {
      template.form?.patchValue({
        title_en: template.data.title_en || '',
        title_ar: template.data.title_ar || '',
        description_en: template.data.description_en || '',
        description_ar: template.data.description_ar || '',
      });
    }
    template.isEditingBasicDetails = false;
    this.cdr.detectChanges();
  }
}
