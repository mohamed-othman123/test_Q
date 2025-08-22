import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {
  LandingPageSection,
  LandingPageSectionType,
  SectionTemplate,
} from '@admin-landing-page/models/section.model';
import {LandingPageService} from '@admin-landing-page/services/landing-page.service';
import {LandingGeneralInformationDto} from '@admin-landing-page/models/landing-page.model';
import {LanguageService} from '@core/services';
import {noDoubleSpaceValidator} from '@core/validators';

@Component({
  selector: 'add-section',
  templateUrl: './add-section.component.html',
  styleUrls: ['./add-section.component.scss'],
  standalone: false,
})
export class AddSectionComponent implements OnInit {
  @Input() landingPageData!: LandingGeneralInformationDto;

  sectionTemplates: SectionTemplate[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private landingPageService: LandingPageService,
    public lang: LanguageService,
  ) {}

  ngOnInit(): void {
    this.initializeSectionTemplates();
    this.mapExistingSections();
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

      // Sort by existing order
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

  onSectionToggle(template: SectionTemplate, isEnabled: boolean): void {
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

    template.isExpanded = true;
    template.isEditing = true;
  }

  private disableSection(template: SectionTemplate): void {
    if (template.data?.id) {
      this.landingPageService.removeSection(template.data.id).subscribe({
        next: () => {
          this.resetTemplate(template);
          this.updateLandingPageData();
        },
        error: (error) => {
          console.error('Error removing section:', error);
          template.isEnabled = true;
        },
      });
    } else {
      this.resetTemplate(template);
    }
  }

  private resetTemplate(template: SectionTemplate): void {
    template.isExpanded = false;
    template.isEditing = false;
    template.data = undefined;
    template.form?.reset();
  }

  onSectionExpand(template: SectionTemplate): void {
    template.isExpanded = !template.isExpanded;
    if (template.isExpanded && !template.data) {
      template.isEditing = true;
    }
  }

  onSectionEdit(template: SectionTemplate): void {
    template.isEditing = true;
    template.isExpanded = true;
  }

  onSectionSave(template: SectionTemplate): void {
    if (!template.form?.valid) {
      return;
    }

    this.isLoading = true;
    const formValue = template.form.value;

    const sectionData: Partial<LandingPageSection> = {
      type: template.type,
      title_en: formValue.title_en,
      title_ar: formValue.title_ar,
      description_en: formValue.description_en,
      description_ar: formValue.description_ar,
      order: template.order,
    };

    if (template.data?.id) {
      this.landingPageService
        .updateSection(template.data.id, sectionData)
        .subscribe({
          next: (updatedSection) => {
            template.data = {...template.data!, ...updatedSection};
            template.isEditing = false;
            this.updateLandingPageData();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error updating section:', error);
            this.isLoading = false;
          },
        });
    } else {
      this.landingPageService
        .addSection({
          data: sectionData as LandingPageSection,
          landingPageId: this.landingPageData.id!,
        })
        .subscribe({
          next: (newSection) => {
            template.data = newSection;
            template.isEditing = false;
            this.updateLandingPageData();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error creating section:', error);
            this.isLoading = false;
          },
        });
    }
  }

  onSectionCancel(template: SectionTemplate): void {
    if (!template.data) {
      template.isEnabled = false;
    }

    template.isEditing = false;
    template.isExpanded = false;

    if (template.data) {
      template.form?.patchValue({
        title_en: template.data.title_en || '',
        title_ar: template.data.title_ar || '',
        description_en: template.data.description_en || '',
        description_ar: template.data.description_ar || '',
      });
    } else {
      template.form?.reset();
    }
  }

  onDrop(event: CdkDragDrop<SectionTemplate[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      const enabledSections = this.sectionTemplates.filter((t) => t.isEnabled);
      const draggedItem = enabledSections[event.previousIndex];

      if (draggedItem) {
        moveItemInArray(
          enabledSections,
          event.previousIndex,
          event.currentIndex,
        );

        enabledSections.forEach((section, index) => {
          section.order = index + 1;
        });

        this.updateSectionOrders(enabledSections);
        this.reorderSectionTemplates();
      }
    }
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
      })
      .catch((error) => {
        console.error('Error updating section orders:', error);
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
    const enabledSections = this.sectionTemplates
      .filter((t) => t.isEnabled && t.data)
      .map((t) => t.data!)
      .sort((a, b) => a.order - b.order);

    this.landingPageData.sections = enabledSections;
  }

  getEnabledSections(): SectionTemplate[] {
    return this.sectionTemplates.filter((t) => t.isEnabled);
  }

  getDisabledSections(): SectionTemplate[] {
    return this.sectionTemplates.filter((t) => !t.isEnabled);
  }
}
