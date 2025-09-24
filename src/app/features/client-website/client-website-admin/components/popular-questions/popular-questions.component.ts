import {Component, OnChanges, Input, SimpleChanges, ElementRef, ViewChild} from '@angular/core';
import {
  ControlContainer,
  FormArray,
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import {LandingPageService} from '../../services/landing-page.service';
import {LandingGeneralInformationDto, QuestionResponseDto} from '@client-website-admin/models/landing-page.model';
import {LandingPageSection} from '@client-website-admin/models/section.model';
import {noDoubleSpaceValidator} from '@core/validators';
import {NotificationService} from '@core/services';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

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

  @ViewChild('questionsList') questionsList!: ElementRef;

  maxQuestions = 10;
  activeQuestion: any = null;
  isEditingExisting = false;
  private currentSavedQuestions: any[] = [];

  constructor(
    private controlContainer: ControlContainer,
    private fb: FormBuilder,
    private landingPageService: LandingPageService,
    private notificationService: NotificationService
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

    this.activeQuestion = null;

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
      this.currentSavedQuestions = [...data.popularQuestions];
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
    if (this.questions.length >= this.maxQuestions || this.activeQuestion) {
      return;
    }

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
    this.activeQuestion = newQuestionGroup;
    this.isEditingExisting = false;
  }

  removeQuestion(index: number) {
    const question = this.questions.at(index).value;

    if (question.id) {
      this.landingPageService.deleteQuestion(question.id).subscribe({
        next: (response: QuestionResponseDto[]) => {
          if (this.section) {
            this.section.popularQuestions = response;
            this.updateFormArrayFromResponse(response);
          }
          this.notificationService.showSuccess('landing.questionDeleted');
        },
      });
    } else {
      this.questions.removeAt(index);
      this.updateQuestionOrders();
      this.notificationService.showSuccess('landing.questionDeleted');
    }
  }

  onQuestionsDropped(event: CdkDragDrop<any[]>) {
    if (event.previousIndex !== event.currentIndex) {
      const controls = this.questions.controls;
      moveItemInArray(controls, event.previousIndex, event.currentIndex);

      const movedControl = controls[event.currentIndex];
      const questionId = movedControl.get('id')?.value;
      const newOrder = event.currentIndex + 1;

      if (questionId) {
        this.landingPageService.updateQuestion(questionId, {
          order: newOrder,
        }).subscribe({
          next: (response: QuestionResponseDto[]) => {
            if (this.section) {
              this.section.popularQuestions = response;
              this.updateFormArrayFromResponse(response);
            }
            this.notificationService.showSuccess('landing.questionsReordered');
          },
        });
      }
    }
  }

  private updateQuestionOrders() {
    this.questions.controls.forEach((control, index) => {
      control.patchValue({order: index + 1}, {emitEvent: false});
    });
  }

  cancelEdit() {
    if (this.activeQuestion) {
      if (!this.isEditingExisting && !this.activeQuestion.get('question')?.value?.trim() && !this.activeQuestion.get('answer')?.value?.trim()) {
        const index = this.questions.controls.indexOf(this.activeQuestion);
        if (index > -1) {
          this.questions.removeAt(index);
        }
      } else if (this.isEditingExisting) {
        const questionIndex = this.questions.controls.indexOf(this.activeQuestion);
        if (questionIndex >= 0 && questionIndex < this.currentSavedQuestions.length) {
          this.activeQuestion.patchValue({
            question: this.currentSavedQuestions[questionIndex].question,
            answer: this.currentSavedQuestions[questionIndex].answer
          });
        }
      }
    }
    this.activeQuestion = null;
    this.isEditingExisting = false;
  }

  editQuestion(control: any) {
    if (this.activeQuestion) {
      return;
    }

    this.activeQuestion = control;
    this.isEditingExisting = true;
  }

  saveQuestion() {
    if (!this.activeQuestion || !this.landingPageData?.id || this.activeQuestion.invalid) {
      return;
    }

    const questionValue = this.activeQuestion.value;
    const questionData = {
      question: questionValue.question,
      answer: questionValue.answer,
      order: questionValue.order,
    };

    if (questionValue.id) {
      this.landingPageService.updateQuestion(questionValue.id, questionData).subscribe({
        next: (response: QuestionResponseDto[]) => {
          if (this.section) {
            this.section.popularQuestions = response;
            this.updateFormArrayFromResponse(response);
          }
          this.activeQuestion = null;
          this.isEditingExisting = false;
          this.notificationService.showSuccess('landing.questionUpdated');
        },
      });
    } else {
      this.landingPageService.addQuestion({
        ...questionData,
        sectionId: this.section!.id!,
      }).subscribe({
        next: (response: QuestionResponseDto[]) => {
          if (this.section) {
            this.section.popularQuestions = response;
            this.updateFormArrayFromResponse(response);
          }
          this.activeQuestion = null;
          this.isEditingExisting = false;
          this.notificationService.showSuccess('landing.questionAdded');
        },
      });
    }
  }

  private updateFormArrayFromResponse(response: QuestionResponseDto[]) {
    while (this.questions.length !== 0) {
      this.questions.removeAt(0);
    }

    const sortedResponse = response.sort((a, b) => a.order - b.order);

    sortedResponse.forEach(question => {
      const formGroup = this.fb.group({
        id: [question.id],
        question: [question.question, [Validators.required, noDoubleSpaceValidator]],
        answer: [question.answer, [Validators.required, noDoubleSpaceValidator]],
        order: [question.order]
      });
      this.questions.push(formGroup);
    });
  }
}
