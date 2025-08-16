import {Component, Input, OnInit, OnDestroy} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HallSection} from '@halls/models/halls.model';
import {noDoubleSpaceValidator, requireOneOf} from '@core/validators';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {FormStateService} from '@halls/services/form-state.service';
import {HallSectionsService} from '@halls/services/hall-sections.service';

@Component({
  selector: 'app-hall-sections',
  templateUrl: './hall-sections.component.html',
  styleUrls: ['./hall-sections.component.scss'],
  standalone: false,
})
export class HallSectionsComponent implements OnInit, OnDestroy {
  @Input() hallId!: string;
  sections!: HallSection[];
  isLoading: boolean = true;
  sectionForm!: FormGroup;
  showSectionForm: boolean = false;
  editingSectionIndex: number = -1;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private formStateService: FormStateService,
    private hallSectionsService: HallSectionsService,
  ) {}

  ngOnInit(): void {
    this.getSections(this.hallId);
    this.initializeForms();
  }

  getSections(hallId: string): void {
    this.hallSectionsService
      .getSections(hallId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((sections) => {
        this.sections = sections.items;
        this.isLoading = false;
      });
  }

  private initializeForms(): void {
    this.sectionForm = this.fb.group(
      {
        id: [0],
        name: [null, [Validators.required, noDoubleSpaceValidator()]],
        name_ar: [null, [Validators.required, noDoubleSpaceValidator()]],
        capacity: ['', [Validators.min(0)]],
      },
      {validators: [requireOneOf(['name', 'name_ar'])]},
    );
  }

  addNewSection(): void {
    this.editingSectionIndex = -1;
    this.sectionForm.reset({
      id: 0,
      name: null,
      name_ar: null,
      capacity: 0,
    });
    this.showSectionForm = true;

    this.formStateService.markTabAsDirty(1);
  }

  editSection(index: number): void {
    this.editingSectionIndex = index;
    const section = this.sections?.[index];
    this.sectionForm.patchValue({
      id: section.id,
      name: section.name,
      name_ar: section.name_ar,
      capacity: section.capacity,
    });
    this.showSectionForm = true;

    this.formStateService.markTabAsDirty(1);
  }

  saveSection(): void {
    if (this.sectionForm.invalid) {
      this.sectionForm.markAllAsTouched();
      return;
    }

    const sectionData = this.sectionForm.value;

    const request$ =
      this.editingSectionIndex === -1
        ? this.hallSectionsService.createSection(this.hallId, sectionData)
        : this.hallSectionsService.updateSection(this.hallId, sectionData);

    request$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.cancelSectionEdit();
      this.getSections(this.hallId);
    });
  }

  cancelSectionEdit(): void {
    this.showSectionForm = false;
    this.editingSectionIndex = -1;
    this.sectionForm.reset({
      id: 0,
      name: null,
      name_ar: null,
      capacity: 0,
    });

    this.formStateService.markTabAsClean(1);
  }

  removeSection(index: number): void {
    const sectionId = this.sections[index]?.id;

    if (!sectionId) return;

    this.hallSectionsService
      .deleteSection(this.hallId, sectionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getSections(this.hallId);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
