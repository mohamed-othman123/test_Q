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
  OnDestroy,
} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {
  LandingPageSection,
  LandingPageSectionType,
  SectionTemplate,
} from '@client-website-admin/models/section.model';
import {LandingPageService} from '@client-website-admin/services/landing-page.service';
import {LandingGeneralInformationDto} from '@client-website-admin/models/landing-page.model';
import {LanguageService, NotificationService} from '@core/services';
import {DragCoordinationService} from '@core/services/drag-coordination.service';
import {noDoubleSpaceValidator} from '@core/validators';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {Hall} from '@halls/models/halls.model';

@Component({
  selector: 'add-section',
  templateUrl: './add-section.component.html',
  styleUrls: ['./add-section.component.scss'],
  standalone: false,
})
export class AddSectionComponent implements OnInit, AfterViewInit, OnDestroy {
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
    private cdr: ChangeDetectorRef,
    private dragCoordination: DragCoordinationService,
  ) {}

  ngOnInit(): void {
    this.initializeSectionTemplates();
    this.mapExistingSections();
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    // Cleanup if needed
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
          template.isEnabled = true;
          template.data = section;
          template.order = section.order;
          template.form?.patchValue({
            title_en: section.title_en || '',
            title_ar: section.title_ar || '',
            description_en: section.description_en || '',
            description_ar: section.description_ar || '',
          });
        }
      });

      this.sectionTemplates.sort((a, b) => {
        if (a.isEnabled && b.isEnabled) {
          return a.order - b.order;
        }
        if (a.isEnabled && !b.isEnabled) return -1;
        if (!a.isEnabled && b.isEnabled) return 1;
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

  onSectionToggle(template: SectionTemplate, event: any): void {
    const isEnabled = event.target ? event.target.checked : event;
    if (isEnabled) {
      this.enableSection(template);
    } else {
      this.disableSection(template);
    }
  }

  private enableSection(template: SectionTemplate): void {
    const enabledSections = this.sectionTemplates.filter(
      (t) => t.isEnabled && t !== template,
    );
    template.order = enabledSections.length + 1;

    this.createSection(template);
  }

  private createSection(template: SectionTemplate): void {
    this.isLoading = true;

    const sectionData: Partial<LandingPageSection> = {
      type: template.type,
      title_en: '',
      title_ar: '',
      description_en: '',
      description_ar: '',
      order: template.order,
    };

    this.landingPageService
      .addSection({
        data: sectionData as LandingPageSection,
        landingPageId: this.landingPageData.id!,
      })
      .subscribe({
        next: (newSection) => {
          template.data = newSection;
          template.isEnabled = true;
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
          }, 200);

          this.notificationService.showSuccess('landing.sectionAdded');
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
      this.landingPageService.removeSection(template.data.id).subscribe({
        next: () => {
          template.isEnabled = false;
          template.isExpanded = false;
          template.data = undefined;
          template.form?.reset();
          this.notificationService.showSuccess('landing.sectionRemoved');
        },
        error: (error) => {
          console.error('Error removing section:', error);
          template.isEnabled = true;
          this.notificationService.showError('landing.sectionRemoveError');
        },
      });
    } else {
      template.isEnabled = false;
      template.isExpanded = false;
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
      moveItemInArray(enabledSections, event.previousIndex, event.currentIndex);
      
      // Update order for all sections
      enabledSections.forEach((section, index) => {
        section.order = index + 1;
      });

      this.updateSectionOrders(enabledSections);
      this.reorderSectionTemplates();
    }
  }

  private scrollToSection(template: SectionTemplate): void {
    const sectionElement = document.querySelector(`[data-section-type="${template.type}"]`);
    if (sectionElement) {
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const elementRect = sectionElement.getBoundingClientRect();
      const elementTop = elementRect.top + currentScrollTop;
      const offset = 100;
      const targetScrollTop = elementTop - offset;

      window.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth'
      });
    }
  }

  onMediaUpdated(updatedData: any): void {
    this.mediaUpdated.emit(updatedData);
  }

  hasExpandedSection(): boolean {
    return this.sectionTemplates.some(template => template.isExpanded);
  }


  private updateSectionOrders(enabledSections: SectionTemplate[]): void {
    const updatePromises = enabledSections
      .filter((section) => section.data?.id)
      .map((section) =>
        this.landingPageService
          .updateSection(section.data!.id, {order: section.order})
          .toPromise(),
      );

    Promise.all(updatePromises)
      .then(() => {
        this.updateLandingPageData();
        this.notificationService.showSuccess('landing.sectionsReordered');
        this.refreshLandingPageData();
        this.sectionsReordered.emit();
      })
      .catch((error) => {
        this.notificationService.showError('landing.sectionsReorderError');
      });
  }

  private reorderSectionTemplates(): void {
    this.sectionTemplates.sort((a, b) => {
      if (a.isEnabled && b.isEnabled) {
        return a.order - b.order;
      }
      if (a.isEnabled && !b.isEnabled) return -1;
      if (!a.isEnabled && b.isEnabled) return 1;
      return 0;
    });
  }

  private updateLandingPageData(): void {
    this.landingPageData.sections = this.sectionTemplates
      .filter((t) => t.isEnabled && t.data)
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
    return this.sectionTemplates.filter((t) => t.isEnabled);
  }

  getDisabledSections(): SectionTemplate[] {
    return this.sectionTemplates.filter((t) => !t.isEnabled);
  }


  toggleBasicDetails(template: SectionTemplate): void {
    template.isBasicDetailsExpanded = !template.isBasicDetailsExpanded;
    this.cdr.detectChanges();
  }

  editBasicDetails(template: SectionTemplate, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    template.isEditingBasicDetails = true;
    template.isBasicDetailsExpanded = true;
    this.cdr.detectChanges();
  }

  saveBasicDetails(template: SectionTemplate): void {
    if (!template.form?.valid) {
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
        next: () => {
          template.data!.title_en = formData.title_en;
          template.data!.title_ar = formData.title_ar;
          template.data!.description_en = formData.description_en;
          template.data!.description_ar = formData.description_ar;
          template.isEditingBasicDetails = false;
          this.isLoading = false;
          this.notificationService.showSuccess('landing.sectionUpdated');
        },
        error: (error) => {
          console.error('Error updating section:', error);
          this.isLoading = false;
          this.notificationService.showError('landing.sectionUpdateError');
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
