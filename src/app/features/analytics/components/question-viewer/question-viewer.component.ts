import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject, takeUntil, switchMap, of } from 'rxjs';
import {
  AIAnalyticsService,
  Question,
  QuestionUrl,
} from '../../a-i-analytics.service';
import { HallsService } from '@halls/services/halls.service';

@Component({
  selector: 'app-question-viewer',
  templateUrl: './question-viewer.component.html',
  styleUrls: ['./question-viewer.component.scss'],
  standalone: false
})
export class QuestionViewerComponent implements OnInit, OnDestroy {
  @ViewChild('questionIframe', { static: false }) iframeElement!: ElementRef<HTMLIFrameElement>;

  question: Question | null = null;
  questionUrl: SafeResourceUrl | null = null;
  rawQuestionUrl: string | null = null;
  questionId: number | null = null;
  loading = true;
  error: string | null = null;
  iframeLoading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private analyticsService: AIAnalyticsService,
    private hallsService: HallsService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          const id = params.get('id');
          if (!id || isNaN(Number(id))) {
            this.error = 'Invalid question ID';
            this.loading = false;
            return of(null);
          }

          this.questionId = Number(id);
          this.loadQuestion(this.questionId);
          return of(null);
        })
      )
      .subscribe({
        next: () => {},
        error: (error) => {
          this.error = 'Failed to load question. Please try again.';
          this.loading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadQuestion(questionId: number): void {
    this.loading = true;
    this.error = null;
    this.iframeLoading = true;

    const hallIds = this.getEffectiveHallIds();

    this.analyticsService.getQuestionUrl(questionId, hallIds)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: QuestionUrl) => {
          this.rawQuestionUrl = response.url;
          this.questionUrl = this.sanitizer.bypassSecurityTrustResourceUrl(response.url);
          this.loading = false;
          this.loadQuestionMetadata(questionId);
        },
        error: (error) => {
          this.error = 'Failed to load question. Please try again.';
          this.loading = false;
          this.iframeLoading = false;
        }
      });
  }

  private getEffectiveHallIds(): number[] {
    const currentHall = this.hallsService.getCurrentHall();
    const availableHalls = this.hallsService.halls;

    if (currentHall) {
      return [currentHall.id];
    }

    if (availableHalls.length > 0) {
      return [availableHalls[0].id];
    }

    return [];
  }

  private loadQuestionMetadata(questionId: number): void {
    this.analyticsService.getAvailableQuestions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (questions) => {
          this.question = questions.find(q => q.id === questionId) || null;
          if (!this.question) {
            this.question = {
              id: questionId,
              name: `Question #${questionId}`,
              description: 'Data visualization and chart with specific business insights',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
          }
        },
        error: (error) => {
          this.question = {
            id: questionId,
            name: `Question #${questionId}`,
            description: 'Data visualization and chart with specific business insights',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
      });
  }

  onIframeLoad(): void {
    this.iframeLoading = false;
  }

  onIframeError(): void {
    this.iframeLoading = false;
    this.error = 'Failed to load question content. The question may be temporarily unavailable.';
  }

  onBackToAnalytics(): void {
    this.router.navigate(['/analytics']);
  }

  onRefresh(): void {
    if (this.questionId) {
      this.loadQuestion(this.questionId);
    }
  }

  onFullscreen(): void {
    if (this.iframeElement && this.iframeElement.nativeElement.requestFullscreen) {
      this.iframeElement.nativeElement.requestFullscreen();
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Unknown';

    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  }
}
