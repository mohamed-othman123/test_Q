import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {LanguageService} from '@core/services';
import {noDoubleSpaceValidator} from '@core/validators';
import {ContractAttachment} from '@halls/models/contract-attachment.model';
import {HallContract} from '@halls/models/hall-contract.model';
import {ContractAttachmentsService} from '@halls/services/contract-attachments.service';
import {FormStateService} from '@halls/services/form-state.service';
import {FileUploadComponent} from '@shared/components/file-upload/file-upload.component';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-contract-attachments',
    templateUrl: './contract-attachments.component.html',
    styleUrl: './contract-attachments.component.scss',
    standalone: false
})
export class ContractAttachmentsComponent {
  @Input() isEditMode!: boolean;
  @Input() editedContract: HallContract | null = null;

  @Output() closeAttachments = new EventEmitter<void>();

  attachments: ContractAttachment[] = [];

  isLoading = true;

  attachmentForm = new FormGroup({
    name: new FormControl<string | null>(null, [
      Validators.required,
      noDoubleSpaceValidator(),
    ]),
    file: new FormControl<File | null>(null, [Validators.required]),
  });

  @ViewChild(FileUploadComponent) fileUpload!: FileUploadComponent;

  editedAttachmentId: number | null = null;
  editAttachmentMode: boolean = false;

  subs = new Subscription();

  constructor(
    public lang: LanguageService,
    private contractAttachmentsService: ContractAttachmentsService,
    private formStateService: FormStateService,
  ) {}

  ngOnInit(): void {
    this.getAllAttachments();

    this.subs.add(
      this.attachmentForm.valueChanges.subscribe(() => {
        this.formStateService.markTabAsDirty(3);
      }),
    );
  }

  getAllAttachments() {
    if (!this.editedContract?.id) {
      return;
    }

    this.isLoading = true;
    this.contractAttachmentsService
      .getAttachments(this.editedContract.id)
      .subscribe((res) => {
        this.attachments = res;
        this.isLoading = false;
      });
  }

  addOrUpdate() {
    if (this.attachmentForm.invalid) {
      this.attachmentForm.markAllAsTouched();
      return;
    }

    if (this.editedAttachmentId === null) {
      this.addAttachment();
    } else {
      this.updateAttachment();
    }
  }

  addAttachment() {
    const formData = this.createFormDateForAttachment();
    this.contractAttachmentsService
      .addAttachment(this.editedContract?.id!, formData)
      .subscribe((res) => {
        this.attachmentForm.reset();
        this.fileUpload.deleteFile(new Event('click'));
        this.attachments = res;
        this.formStateService.markTabAsClean(3);
      });
  }

  updateAttachment() {
    if (this.editedAttachmentId === null) return;

    const payload = {name: this.attachmentForm.value.name!};
    this.contractAttachmentsService
      .updateAttachment(
        +this.editedContract?.id!,
        this.editedAttachmentId,
        payload,
      )
      .subscribe((res) => {
        this.cancelEdit();
        this.getAllAttachments();
        this.formStateService.markTabAsClean(3);
      });
  }

  editAttachment(attachment: ContractAttachment) {
    this.editedAttachmentId = attachment.id!;
    this.editAttachmentMode = true;

    this.attachmentForm.patchValue({
      name: attachment.name,
    });
    this.attachmentForm.controls.file.disable();
  }

  createFormDateForAttachment() {
    const attachment = this.attachmentForm.value;

    const formData = new FormData();

    formData.append(attachment.name as string, attachment.file as File);

    return formData;
  }

  deleteAttachment(attachment: ContractAttachment) {
    if (!this.editedContract?.id || !attachment.id) {
      return;
    }

    this.contractAttachmentsService
      .deleteAttachment(this.editedContract.id, attachment.id)
      .subscribe((res) => {
        this.attachments = res;
      });
  }

  openAttachment(attachment: ContractAttachment) {
    window.open(attachment.path, '_blank');
  }

  updateAttachmentInTableView() {}

  cancelEdit() {
    this.editedAttachmentId = null;
    this.editAttachmentMode = false;
    this.attachmentForm.reset();
    this.attachmentForm.controls.file.enable();
    // this.fileUpload.deleteFile(new Event('click'));
  }

  cancel() {
    this.closeAttachments.emit();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
