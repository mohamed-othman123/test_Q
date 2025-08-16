import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
    selector: 'app-confirmation-dialog',
    template: `
    @if (visible) {
      <div class="confirmation-dialog-backdrop">
        <div class="confirmation-dialog-container">
          <div class="confirmation-dialog-header">
            <h5>{{ title }}</h5>
            <button class="close-btn" (click)="onCancel()">
              <i class="pi pi-times"></i>
            </button>
          </div>
          <div class="confirmation-dialog-content">
            <p>{{ message }}</p>
          </div>
          <div class="confirmation-dialog-actions">
            <button class="action-button secondary" (click)="onCancel()">
              <i class="pi pi-times"></i> {{ cancelText }}
            </button>
            <button class="action-button" (click)="onContinue()">
              <i class="pi pi-check"></i> {{ continueText }}
            </button>
            @if (showSaveOption) {
              <button
                class="action-button primary"
                (click)="onSave()">
                <i class="pi pi-save"></i> {{ saveText }}
              </button>
            }
          </div>
        </div>
      </div>
    }
    `,
    styles: [
        `
      .confirmation-dialog-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .confirmation-dialog-container {
        background-color: white;
        border-radius: 8px;
        width: 90%;
        max-width: 550px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        animation: dialogFadeIn 0.3s ease;
      }

      @keyframes dialogFadeIn {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .confirmation-dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #efefef;
      }

      .confirmation-dialog-header h5 {
        margin: 0;
        font-weight: 600;
        color: #1eaa8f;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 1.1rem;
        cursor: pointer;
        color: #666;
        transition: color 0.2s ease;
      }

      .close-btn:hover {
        color: #333;
      }

      .confirmation-dialog-content {
        padding: 1.5rem;
        color: #333;
      }

      .confirmation-dialog-actions {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        border-top: 1px solid #efefef;
      }

      .action-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .action-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }

      .action-button.secondary {
        background-color: #f8f9fa;
        color: #6c757d;
      }

      .action-button.primary {
        background-color: #1eaa8f;
        color: white;
      }

      .action-button:not(.secondary):not(.primary) {
        background-color: #e9ecef;
        color: #495057;
      }

      .action-button.primary:hover {
        background-color: #19967e;
      }
    `,
    ],
    standalone: false
})
export class ConfirmationDialogComponent {
  @Input() visible: boolean = false;
  @Input() title: string = 'Confirmation';
  @Input() message: string = 'Are you sure you want to proceed?';
  @Input() continueText: string = 'Continue';
  @Input() cancelText: string = 'Cancel';
  @Input() saveText: string = 'Save';
  @Input() showSaveOption: boolean = true;

  @Output() cancel = new EventEmitter<void>();
  @Output() continue = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  onCancel(): void {
    this.cancel.emit();
  }

  onContinue(): void {
    this.continue.emit();
  }

  onSave(): void {
    this.save.emit();
  }
}
