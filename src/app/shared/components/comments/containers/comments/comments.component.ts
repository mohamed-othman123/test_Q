import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {Comment, CommentType} from '../../models/comment';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {finalize, Subject, takeUntil} from 'rxjs';
import {CommentService} from '../../services/comment.service';
import {GetCommentsDto} from '../../services/dtos/get-comments.dto';
import {CreateCommentDto} from '../../services/dtos/create-comment.dto';
import {TranslateService} from '@ngx-translate/core';
import {HallsService} from '@halls/services/halls.service';
import {AuthService} from '@core/services';

@Component({
    selector: 'comments',
    templateUrl: './comments.component.html',
    styleUrls: ['./comments.component.scss'],
    standalone: false
})
export class CommentsComponent implements OnInit, OnDestroy {
  @Input() entityId!: number;
  @Input() type!: CommentType;

  commentForm!: FormGroup;
  comments: Comment[] = [];
  loading = false;
  loadingMore = false;
  submitting = false;
  error: string | null = null;
  currentPage = 1;
  hallId: number | null = null;
  limit = 10;
  totalComments = 0;
  allLoaded = false;
  currentUserId: number | null = null;
  isExpanded = false;

  @ViewChild('commentInput') commentInput!: ElementRef;
  @ViewChild('commentsContainer') commentsContainer!: ElementRef;
  private destroy$!: Subject<void>;
  private scrollHeightBeforeLoad = 0;

  constructor(
    private fb: FormBuilder,
    private commentService: CommentService,
    public translateService: TranslateService,
    private hallService: HallsService,
    private authService: AuthService,
  ) {
    this.destroy$ = new Subject();
  }

  ngOnInit(): void {
    this.commentForm = this.fb.group({
      content: [null, [Validators.required]],
    });

    this.currentUserId = this.authService.userData?.user.userId!;

    this.hallId = this.hallService.getCurrentHall()?.id!;

    this.getInitialComments();
  }

  getInitialComments(): void {
    this.loading = true;
    this.error = null;

    const query: GetCommentsDto = {
      limit: this.limit,
      page: 1,
      type: this.type,
      hallId: this.hallId,
      entityId: this.entityId,
    };

    this.commentService
      .getAll(query)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.scrollToBottom();
        }),
      )
      .subscribe({
        next: (response) => {
          this.comments = response.items;
          this.totalComments = response.totalItems;
          this.allLoaded = this.comments.length >= this.totalComments;
          this.currentPage = 1;
        },
        error: (error) => {
          this.error = 'Failed to load comments. Please try again.';
          console.error('Error loading comments:', error);
        },
      });
  }

  onCommentsScroll(): void {
    if (this.loadingMore || this.allLoaded) {
      return;
    }

    const container = this.commentsContainer.nativeElement;

    const scrollTop = container.scrollTop;
    const scrollThreshold = 100;

    if (scrollTop <= scrollThreshold) {
      this.scrollHeightBeforeLoad = container.scrollHeight;
      this.loadMoreComments();
    }
  }

  private loadMoreComments(): void {
    this.loadingMore = true;

    const nextPage = this.currentPage + 1;

    const query: GetCommentsDto = {
      limit: this.limit,
      page: nextPage,
      type: this.type,
      hallId: this.hallId,
      entityId: this.entityId,
    };

    this.commentService
      .getAll(query)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingMore = false;

          setTimeout(() => this.maintainScrollPosition(), 0);
        }),
      )
      .subscribe({
        next: (response) => {
          const newComments = response.items;

          if (newComments.length > 0) {
            this.comments = [...newComments, ...this.comments];
            this.currentPage = nextPage;
          }

          this.totalComments = response.totalItems;
          this.allLoaded = this.comments.length >= this.totalComments;
        },
        error: (_) => {
          this.error = 'Failed to load more comments. Please try again.';
        },
      });
  }

  maintainScrollPosition(): void {
    if (this.commentsContainer) {
      const container = this.commentsContainer.nativeElement;
      const newScrollHeight = container.scrollHeight;
      const scrollDiff = newScrollHeight - this.scrollHeightBeforeLoad;

      container.scrollTop = scrollDiff;
    }
  }

  onSubmit(): void {
    if (this.commentForm.invalid || this.submitting) return;

    const content = this.commentForm.get('content')?.value.trim();
    if (!content) return;

    this.submitting = true;

    const payload: CreateCommentDto = {
      content,
      entityId: this.entityId,
      type: this.type as CommentType,
      hallId: this.hallId!,
    };

    this.commentService
      .createOne(payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.submitting = false)),
      )
      .subscribe({
        next: (newComment) => {
          this.comments = [...this.comments, newComment];
          this.totalComments++;
          this.commentForm.reset();

          setTimeout(() => this.scrollToBottom(), 0);

          if (this.commentInput) {
            this.commentInput.nativeElement.focus();
          }
        },
        error: (error) => {
          console.error('Error adding comment:', error);
        },
      });
  }

  onEditComment(comment: Comment, content: string): void {
    this.commentService
      .updateOne(comment.id.toString(), {content})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const index = this.comments.findIndex((c) => c.id === res.id);
          if (index !== -1) {
            this.comments[index] = res;
            Object.assign(this.comments[index], res);
          }
        },
        error: (error) => {
          console.error('Error updating comment:', error);
        },
      });
  }

  onDeleteComment(commentId: number): void {
    this.commentService
      .deleteOne(commentId.toString())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const index = this.comments.findIndex(
            (item) => item.id === commentId,
          );
          if (index !== -1) {
            this.comments.splice(index, 1);
          }
          this.totalComments--;
        },
        error: (error) => {
          console.error('Error deleting comment:', error);
        },
      });
  }

  canEditComment(comment: Comment): boolean {
    return comment.created_by?.id === this.currentUserId;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;

    if (this.isExpanded) {
      if (this.comments.length === 0) {
        this.getInitialComments();
      } else {
        requestAnimationFrame(() => {
          this.scrollToBottom();

          setTimeout(() => {
            if (this.commentInput) {
              this.commentInput.nativeElement.focus();
            }
          }, 50);
        });
      }
    }
  }

  scrollToBottom(): void {
    if (this.commentsContainer) {
      const container = this.commentsContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }
  }
}
