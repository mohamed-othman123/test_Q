import {
  Directive,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ConfirmationService} from 'primeng/api';

@Directive({
    selector: '[appConfirmDeleteDialog]',
    standalone: false
})
export class ConfirmDeleteDialogDirective {
  @Output() acceptDelete = new EventEmitter<boolean>();
  @Input({required: true}) deletedItem!: string;
  @Input() message?: string;

  @HostListener('click', ['$event'])
  click($event: Event) {
    $event.stopPropagation();
    this.confirmationService.confirm({
      target: $event.target as EventTarget,
      message:
        this.message ||
        this.translate.instant('common.deleteRecord', {
          deletedItem: this.deletedItem,
        }),
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      acceptLabel: this.translate.instant('common.yes'),
      rejectLabel: this.translate.instant('common.no'),
      accept: () => {
        this.acceptDelete.emit();
      },
      reject: () => {},
    });
  }

  constructor(
    private confirmationService: ConfirmationService,
    private translate: TranslateService,
  ) {}
}
