import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import {Comment} from '../../models/comment';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'comment-item',
    templateUrl: './comment-item.component.html',
    styleUrls: ['./comment-item.component.scss'],
    standalone: false
})
export class CommentItemComponent {
  @Input() comment!: Comment;
  @Input() canEdit = false;
  @Output() edit!: EventEmitter<string>;
  @Output() delete!: EventEmitter<void>;
  @ViewChild('editTextarea') editTextarea!: ElementRef;

  editMode = false;
  editContent = '';
  editError = '';
  showDropdown = false;

  constructor(public translateService: TranslateService) {
    this.edit = new EventEmitter();
    this.delete = new EventEmitter();
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    this.showDropdown = !this.showDropdown;

    if (this.editMode) {
      this.editContent = this.comment.content;
      this.editError = '';

      setTimeout(() => {
        if (this.editTextarea) {
          const textarea = this.editTextarea.nativeElement;
          textarea.focus();
          textarea.setSelectionRange(
            textarea.value.length,
            textarea.value.length,
          );
        }
      }, 0);
    }
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  closeDropdown(): void {
    this.showDropdown = false;
  }

  saveEdit(): void {
    const newContent = this.editContent.trim();
    if (!newContent) {
      this.editError = 'Comment cannot be empty';
      return;
    }

    if (newContent !== this.comment.content) {
      this.edit.emit(newContent);
    }
    this.editMode = false;
    this.editError = '';
  }

  cancelEdit(): void {
    this.editMode = false;
    this.editError = '';
  }

  confirmDelete(): void {
    this.delete.emit();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
}
