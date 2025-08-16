import {CommonModule} from '@angular/common';
import {
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import {LanguageService} from '@core/services';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {ProfileResponse} from '@profile/models/profile';
import {ProfileService} from '@profile/services/profile.service';
import {catchError, finalize, forkJoin, of, Subject, takeUntil} from 'rxjs';

interface ActivityEvent {
  type: 'created' | 'updated' | 'deleted';
  userId?: number;
  userDetails?: ProfileResponse;
  date?: string;
  isLoading?: boolean;
}

type TooltipPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center';

@Component({
  selector: 'info-tooltip',
  templateUrl: './info-tooltip.component.html',
  styleUrls: ['./info-tooltip.component.scss'],
  standalone: false,
})
export class InfoTooltipComponent implements OnInit, OnDestroy {
  @Input() createdBy?: number;
  @Input() createdAt?: string;
  @Input() updatedBy?: number;
  @Input() updatedAt?: string;
  @Input() deletedBy?: number;
  @Input() deletedAt?: string;
  @Input() position: TooltipPosition = 'top-right';

  private effectivePosition: TooltipPosition = 'top-right';

  @HostBinding('class') get positionClass() {
    return this.effectivePosition;
  }

  isVisible = false;
  events: ActivityEvent[] = [];
  private destroy$ = new Subject<void>();
  private userDetailsCache = new Map<number, ProfileResponse>();
  isRtl = false;

  constructor(
    private profileService: ProfileService,
    public translateService: TranslateService,
    private el: ElementRef,
    private renderer: Renderer2,
    public lang: LanguageService,
  ) {
    this.destroy$ = new Subject<void>();
  }

  ngOnInit(): void {
    this.initializeEvents();
    this.detectRtl();
    this.updateEffectivePosition();

    this.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.detectRtl();
        this.updateEffectivePosition();
      });
  }

  ngAfterViewInit(): void {
    this.setupParentContainerIfNeeded();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private detectRtl(): void {
    const currentLang = this.translateService.currentLang;

    this.isRtl = this.isRtlLanguage(currentLang);
  }

  private isRtlLanguage(lang: string): boolean {
    const rtlLanguages = ['ar'];

    if (lang) {
      return rtlLanguages.some(
        (rtlLang) => lang === rtlLang || lang.startsWith(`${rtlLang}-`),
      );
    }

    return false;
  }

  private updateEffectivePosition(): void {
    if (!this.isRtl) {
      this.effectivePosition = this.position;
      return;
    }

    switch (this.position) {
      case 'top-right':
        this.effectivePosition = 'top-left';
        break;
      case 'top-left':
        this.effectivePosition = 'top-right';
        break;
      case 'bottom-right':
        this.effectivePosition = 'bottom-left';
        break;
      case 'bottom-left':
        this.effectivePosition = 'bottom-right';
        break;
      default:
        this.effectivePosition = this.position;
    }
  }

  private setupParentContainerIfNeeded(): void {
    const parentElement = this.el.nativeElement.parentElement;

    if (parentElement) {
      const parentPosition = window.getComputedStyle(parentElement).position;

      if (parentPosition === 'static') {
        this.renderer.setStyle(parentElement, 'position', 'relative');
      }
    }
  }

  initializeEvents(): void {
    this.events = [
      {type: 'created' as const, userId: this.createdBy, date: this.createdAt},
      {type: 'updated' as const, userId: this.updatedBy, date: this.updatedAt},
      {type: 'deleted' as const, userId: this.deletedBy, date: this.deletedAt},
    ].filter((event) => event.userId && event.date);
  }

  showTooltip(): void {
    this.isVisible = true;
    this.loadUserDetails();
  }

  hideTooltip(): void {
    this.isVisible = false;
  }

  hasAnyActivity(): boolean {
    return this.events.length > 0;
  }

  hasNextEvent(event: ActivityEvent, currentIndex: number): boolean {
    for (let i = currentIndex + 1; i < this.events.length; i++) {
      if (this.events[i].userId || this.events[i].date) {
        return true;
      }
    }

    return false;
  }

  loadUserDetails(): void {
    const userIds = new Set<number>();

    this.events.forEach((event) => {
      if (event.userId && !this.userDetailsCache.has(event.userId)) {
        userIds.add(event.userId);
        event.isLoading = true;
      } else if (event.userId) {
        event.userDetails = this.userDetailsCache.get(event.userId);
        event.isLoading = false;
      }
    });

    if (userIds.size === 0) {
      return;
    }

    const requests = Array.from(userIds).map((userId) =>
      this.profileService.getUserProfile(userId.toString()).pipe(
        catchError(() => of(null)),
        takeUntil(this.destroy$),
      ),
    );

    forkJoin(requests)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.events.forEach((event) => {
            if (event.isLoading) {
              event.isLoading = false;
            }
          });
        }),
      )
      .subscribe((responses) => {
        const userIdsArray = Array.from(userIds);

        responses.forEach((response, index) => {
          const userId = userIdsArray[index];
          if (response) {
            this.userDetailsCache.set(userId, response);
          }
        });

        this.events.forEach((event) => {
          if (event.userId) {
            event.userDetails = this.userDetailsCache.get(event.userId);
            event.isLoading = false;
          }
        });
      });
  }
}
