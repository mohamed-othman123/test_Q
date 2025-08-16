import {Component, OnChanges, Input, SimpleChanges} from '@angular/core';
import {
  ControlContainer,
  FormArray,
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import {LandingPageService} from '../../services/landing-page.service';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {forkJoin} from 'rxjs';
import {LandingGeneralInformationDto} from '@admin-landing-page/models/landing-page.model';
import {DomSanitizer} from '@angular/platform-browser';
import {LandingPageSection} from '@admin-landing-page/models/section.model';
import {noDoubleSpaceValidator} from '@core/validators';

@Component({
    selector: 'app-popular-questions',
    templateUrl: './popular-questions.component.html',
    styleUrls: ['./popular-questions.component.scss'],
    viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
    standalone: false
})
export class PopularQuestionsComponent implements OnChanges {
  @Input() landingPageData: LandingGeneralInformationDto | null = null;
  @Input() section: LandingPageSection | null = null;

  isEditMode = false;
  maxQuestions = 10;
  expandedQuestions: Set<number> = new Set();
  isSaving = false;

  constructor(
    private controlContainer: ControlContainer,
    private fb: FormBuilder,
    private landingPageService: LandingPageService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['landingPageData'] && this.section) {
      this.updateQuestions(this.section);
    }
  }

  private updateQuestions(data: LandingPageSection) {
    const questionsArray = this.questions;

    while (questionsArray.length) {
      questionsArray.removeAt(0);
    }

    this.isEditMode = false;
    this.expandedQuestions.clear();

    if (data.popularQuestions?.length) {
      data.popularQuestions
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .forEach((q) => {
          questionsArray.push(
            this.fb.group({
              id: [q.id],
              question: [
                q.question,
                [
                  Validators.required,
                  Validators.maxLength(200),
                  noDoubleSpaceValidator(),
                ],
              ],
              answer: [
                q.answer,
                [
                  Validators.required,
                  Validators.maxLength(500),
                  noDoubleSpaceValidator(),
                ],
              ],
              order: [q.order],
            }),
          );
        });
    }
  }

  get form(): FormGroup {
    return this.controlContainer.control as FormGroup;
  }

  get questions(): FormArray {
    return this.form.get('popularQuestions') as FormArray;
  }

  hasEmptyQuestion(): boolean {
    return this.questions.controls.some((control) => {
      const question = control.get('question')?.value;
      const answer = control.get('answer')?.value;

      const cleanAnswer = answer ? answer.replace(/<[^>]*>/g, '').trim() : '';

      return !question?.trim() || !cleanAnswer || control.invalid;
    });
  }

  addQuestion() {
    if (this.questions.length < this.maxQuestions && !this.hasEmptyQuestion()) {
      const newQuestionGroup = this.fb.group({
        id: [null],
        question: [
          '',
          [
            Validators.required,
            Validators.maxLength(200),
            noDoubleSpaceValidator(),
          ],
        ],
        answer: [
          '',
          [
            Validators.required,
            Validators.maxLength(2000),
            noDoubleSpaceValidator(),
          ],
        ],
        order: [this.questions.length + 1],
      });
      this.questions.push(newQuestionGroup);
      this.isEditMode = true;
      this.expandedQuestions.clear();
      this.expandedQuestions.add(this.questions.length - 1);
    }
  }

  removeQuestion(index: number) {
    const question = this.questions.at(index).value;

    if (question.id) {
      this.landingPageService.deleteQuestion(question.id).subscribe({
        next: () => {
          this.questions.removeAt(index);
          this.expandedQuestions.delete(index);
          this.updateQuestionOrders();

          if (this.section) {
            this.section = {
              ...this.section,
              popularQuestions: this.questions.controls.map(
                (control) => control.value,
              ),
            };
          }
        },
      });
    } else {
      this.questions.removeAt(index);
      this.expandedQuestions.delete(index);
      this.updateQuestionOrders();
    }
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    this.expandedQuestions.clear();
  }

  toggleQuestion(index: number) {
    if (this.expandedQuestions.has(index)) {
      this.expandedQuestions.delete(index);
    } else {
      this.expandedQuestions.add(index);
    }
  }

  onDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.questions.controls,
      event.previousIndex,
      event.currentIndex,
    );
    this.updateQuestionOrders();
  }

  private updateQuestionOrders() {
    this.questions.controls.forEach((control, index) => {
      control.patchValue({order: index + 1}, {emitEvent: false});
    });
  }

  saveQuestions() {
    if (!this.landingPageData?.id || this.isSaving) {
      return;
    }

    if (this.questions.invalid || this.hasEmptyQuestion()) {
      this.questions.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const updates = this.questions.controls.map((control) => {
      const value = control.value;
      const questionData = {
        question: value.question,
        answer: value.answer,
        order: value.order,
      };

      if (value.id) {
        return this.landingPageService.updateQuestion(value.id, questionData);
      } else {
        return this.landingPageService.addQuestion({
          ...questionData,
          sectionId: this.section!.id!,
        });
      }
    });

    if (updates.length > 0) {
      forkJoin(updates).subscribe({
        next: (responses) => {
          responses.forEach((response, index) => {
            if (response?.id) {
              this.questions.at(index).patchValue(
                {
                  id: response.id,
                  question: response.question,
                  answer: response.answer,
                  order: response.order,
                },
                {emitEvent: false},
              );
            }
          });

          if (this.section) {
            this.section = {
              ...this.section,
              popularQuestions: this.questions.controls.map(
                (control) => control.value,
              ),
            };
          }

          this.isEditMode = false;
          this.isSaving = false;
        },
      });
    } else {
      this.isSaving = false;
    }
  }

  cancelEdit() {
    this.isEditMode = false;
    this.expandedQuestions.clear();
    if (this.section) {
      this.updateQuestions(this.section);
    }
  }

  getSafeHtml(html: string) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
