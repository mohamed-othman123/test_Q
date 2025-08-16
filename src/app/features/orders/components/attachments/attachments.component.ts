import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {LanguageService} from '@core/services';
import {BookingAttachments} from '@orders/models';
import {OrderAttachmentsService} from '@orders/services/order-attachments.service';
import {OrderFormService} from '@orders/services/order-form.service';
import {FileUploadComponent} from '@shared/components/file-upload/file-upload.component';
import {noDoubleSpaceValidator} from '@core/validators';
import {ACCEPTED_FILE_TYPES} from '@core/constants';

@Component({
    selector: 'app-attachments',
    templateUrl: './attachments.component.html',
    styleUrl: './attachments.component.scss',
    standalone: false
})
export class AttachmentsComponent implements OnInit {
  @Input({required: true}) currentStep!: number;

  @Output() currentStepChange = new EventEmitter<number>();

  acceptedFileTypes = ACCEPTED_FILE_TYPES;

  attachmentForm = new FormGroup({
    name: new FormControl<string | null>(null, [
      Validators.required,
      noDoubleSpaceValidator(),
    ]),
    file: new FormControl<File | null>(null, [Validators.required]),
  });

  selectedAttachments: BookingAttachments[] = [];

  @ViewChild(FileUploadComponent) fileUpload!: FileUploadComponent;

  editedAttachmentIndex: number | null = null;

  mode!: string;

  editAttachmentMode = false;

  constructor(
    public lang: LanguageService,
    private orderFormService: OrderFormService,
    private orderAttachmentService: OrderAttachmentsService,
  ) {}

  ngOnInit(): void {
    const attachments =
      this.orderFormService.attachmentsForm.controls.attachments.value;
    if (attachments) {
      this.selectedAttachments = attachments;
    }

    this.mode = this.orderFormService.mode;
  }

  get formControls() {
    return this.orderFormService.attachmentsForm.controls;
  }

  get form() {
    return this.orderFormService.attachmentsForm;
  }

  changeStep(step: number) {
    this.orderFormService.changeStep(step, this.form);
  }

  deleteAttachment(index: number) {
    const attachmentId = String(this.selectedAttachments[index].id);
    if (this.orderFormService.bookingId) {
      this.orderAttachmentService
        .deleteAttachment(
          this.orderFormService.bookingId.toString(),
          attachmentId,
        )
        .subscribe(() => {
          this.selectedAttachments.splice(index, 1);
          this.formControls.attachments.setValue(this.selectedAttachments);
        });
    } else {
      this.selectedAttachments.splice(index, 1);
      this.formControls.attachments.setValue(this.selectedAttachments);
    }
  }

  addAttachment() {
    if (this.orderFormService.bookingId) {
      this.orderAttachmentService
        .addAttachment(
          this.orderFormService.bookingId.toString(),
          this.createFormDateForAttachment(),
        )
        .subscribe((res) => {
          this.addAttachmentToTableView(res);
        });
    } else {
      this.addAttachmentToTableView();
    }
  }

  addAttachmentToTableView(attachments?: BookingAttachments[]) {
    if (attachments) {
      this.selectedAttachments = attachments;
    } else {
      this.selectedAttachments.push(
        this.attachmentForm.value as BookingAttachments,
      );
    }

    // this.attachmentForm.reset();
    // this.fileUpload.deleteFile(new Event('click'));
    this.formControls.attachments.setValue(this.selectedAttachments);
    this.cancelEdit();
  }

  createFormDateForAttachment() {
    const attachment = this.attachmentForm.value;

    const formData = new FormData();

    formData.append(attachment.name as string, attachment.file as File);

    return formData;
  }

  openAttachment(attachment: BookingAttachments) {
    if (attachment.path) {
      window.open(attachment.path, '_blank');
      return;
    }

    window.open(URL.createObjectURL(attachment.file), '_blank');
  }

  editAttachment(attachment: BookingAttachments, index: number) {
    this.editedAttachmentIndex = index;
    this.editAttachmentMode = true;
    const attachmentObj = {
      name: attachment.name,
      file: new File([attachment.file], attachment.name),
    };
    this.attachmentForm.patchValue(attachmentObj);
    this.fileUpload.setFile(attachmentObj.file);
  }

  updateAttachment() {
    if (this.editedAttachmentIndex !== null) {
      const attachmentId =
        this.selectedAttachments[this.editedAttachmentIndex].id;
      const attachmentName = this.attachmentForm.value.name;

      if (this.orderFormService.bookingId) {
        this.orderAttachmentService
          .editAttachment(
            this.orderFormService.bookingId.toString(),
            attachmentId as any,
            attachmentName as string,
          )
          .subscribe((res) => {
            this.updateAttachmentInTableView(res);
          });
      } else {
        this.updateAttachmentInTableView();
      }
    }
  }

  updateAttachmentInTableView(attachment?: BookingAttachments) {
    if (attachment) {
      this.selectedAttachments[this.editedAttachmentIndex!] = attachment;
    } else {
      this.selectedAttachments[this.editedAttachmentIndex!] = this
        .attachmentForm.value as BookingAttachments;
    }

    this.formControls.attachments.setValue(this.selectedAttachments);
    this.editedAttachmentIndex = null;
    this.editAttachmentMode = false;
    this.attachmentForm.reset();
  }

  submit() {
    if (this.attachmentForm.invalid) {
      this.attachmentForm.markAllAsTouched();
      return;
    }
    if (this.editedAttachmentIndex === null) {
      this.addAttachment();
    } else {
      this.updateAttachment();
    }
  }

  cancelEdit() {
    this.editedAttachmentIndex = null;
    this.editAttachmentMode = false;
    this.attachmentForm.reset();
    this.fileUpload?.deleteFile(new Event('click'));
  }
}
