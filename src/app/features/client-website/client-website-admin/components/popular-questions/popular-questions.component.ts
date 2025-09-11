import {Component, OnChanges, Input, SimpleChanges, ElementRef, ViewChild, AfterViewInit} from '@angular/core';
import {
  ControlContainer,
  FormArray,
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import {LandingPageService} from '../../services/landing-page.service';
import {LandingGeneralInformationDto} from '@client-website-admin/models/landing-page.model';
import {LandingPageSection} from '@client-website-admin/models/section.model';
import {noDoubleSpaceValidator} from '@core/validators';
import {NotificationService} from '@core/services';
import {DragCoordinationService} from '@core/services/drag-coordination.service';
import Sortable from 'sortablejs';

@Component({
    selector: 'app-popular-questions',
    templateUrl: './popular-questions.component.html',
    styleUrls: ['./popular-questions.component.scss'],
    viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
    standalone: false
})
export class PopularQuestionsComponent implements OnChanges, AfterViewInit {
  @Input() landingPageData: LandingGeneralInformationDto | null = null;
  @Input() section: LandingPageSection | null = null;

  @ViewChild('questionsList') questionsList!: ElementRef;

  maxQuestions = 10;
  activeQuestion: any = null;
  isEditingExisting = false;
  private sortableInstance: Sortable | null = null;
  private currentSavedQuestions: any[] = [];

  constructor(
    private controlContainer: ControlContainer,
    private fb: FormBuilder,
    private landingPageService: LandingPageService,
    private notificationService: NotificationService,
    private dragCoordination: DragCoordinationService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['landingPageData'] && this.section) {
      this.updateQuestions(this.section);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => this.initializeSortable(), 500);
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

    this.initializeSortable();
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
    this.initializeSortable();
  }

  removeQuestion(index: number) {
    const question = this.questions.at(index).value;

    if (question.id) {
      this.landingPageService.deleteQuestion(question.id).subscribe({
        next: () => {
          this.questions.removeAt(index);
          this.updateQuestionOrders();
          this.initializeSortable();
          this.notificationService.showSuccess('landing.questionDeleted');
        },
      });
    } else {
      this.questions.removeAt(index);
      this.updateQuestionOrders();
      this.initializeSortable();
      this.notificationService.showSuccess('landing.questionDeleted');
    }
  }

  private initializeSortable() {
    if (this.questionsList?.nativeElement) {
      if (this.sortableInstance) {
        this.sortableInstance.destroy();
      }

      this.sortableInstance = Sortable.create(this.questionsList.nativeElement, {
        animation: 150,
        handle: '.question-drag-handle',
        disabled: !!this.activeQuestion || this.dragCoordination.shouldDisableDrag('questions', 'main-sections'),
        onEnd: (evt) => {
          this.dragCoordination.endDrag();
          this.onSortableEnd(evt);
        },
        onStart: () => {
          this.dragCoordination.startDrag('questions');
          return true;
        }
      });
    }
  }

  private onSortableEnd(evt: any) {
    const { oldIndex, newIndex } = evt;
    if (oldIndex !== newIndex) {
      const controls = this.questions.controls;
      const item = controls[oldIndex];
      controls.splice(oldIndex, 1);
      controls.splice(newIndex, 0, item);
      this.updateQuestionOrders();

      this.updateQuestionsOrder();

      this.notificationService.showSuccess('landing.questionsReordered');
    }
  }

  private updateQuestionsOrder() {
    this.questions.controls.forEach((control, index) => {
      const questionId = control.get('id')?.value;
      if (questionId) {
        this.landingPageService.updateQuestion(questionId, {
          question: control.get('question')?.value,
          answer: control.get('answer')?.value,
          order: index + 1,
        }).subscribe();
      }
    });
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
    this.initializeSortable();
  }

  editQuestion(control: any) {
    if (this.activeQuestion) {
      return;
    }

    this.activeQuestion = control;
    this.isEditingExisting = true;
    this.initializeSortable();
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
        next: (response) => {
          this.currentSavedQuestions = this.questions.controls.map(control => control.value);
          this.activeQuestion = null;
          this.isEditingExisting = false;
          this.initializeSortable();
          this.notificationService.showSuccess('landing.questionUpdated');
        },
      });
    } else {
      this.landingPageService.addQuestion({
        ...questionData,
        sectionId: this.section!.id!,
      }).subscribe({
        next: (response) => {
          this.activeQuestion.patchValue({ id: response.id });
          this.currentSavedQuestions = this.questions.controls.map(control => control.value);
          this.activeQuestion = null;
          this.isEditingExisting = false;
          this.initializeSortable();
          this.notificationService.showSuccess('landing.questionAdded');
        },
      });
    }
  }
}
