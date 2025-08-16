import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService, LanguageService} from '@core/services';
import {InvoiceAttachment} from '@purchases/models/invoice-attachment.model';
import {PurchaseAttachment} from '@purchases/models/purchase-model';
import {PurchasesAttachmentService} from '@purchases/services/purchases-attachment.service';
import {PurchasesService} from '@purchases/services/purchases.service';
import {FileUploadComponent} from '@shared/components/file-upload/file-upload.component';
import {Subscription, switchMap, tap} from 'rxjs';
import {noDoubleSpaceValidator} from '@core/validators';
import {PermissionsService} from '@core/services/permissions.service';
import {PermissionTypes} from '@auth/models';
import {ACCEPTED_FILE_TYPES} from '@core/constants';

@Component({
    selector: 'app-invoice-attachment',
    templateUrl: './invoice-attachment.component.html',
    styleUrl: './invoice-attachment.component.scss',
    standalone: false
})
export class InvoiceAttachmentComponent implements OnInit, OnDestroy {
  isViewMode = false;

  @Output() submitting = new EventEmitter<void>();

  purchasesId!: string;

  loading = false;

  acceptedFileTypes = ACCEPTED_FILE_TYPES;

  attachmentForm = new FormGroup({
    name: new FormControl<string | null>(null, [
      Validators.required,
      noDoubleSpaceValidator(),
    ]),
    file: new FormControl<File | null>(null, [Validators.required]),
  });

  selectedAttachments: PurchaseAttachment[] = [];

  @ViewChild(FileUploadComponent) fileUpload!: FileUploadComponent;

  editedAttachmentIndex: number | null = null;
  editAttachmentMode: boolean = false;

  subs = new Subscription();

  constructor(
    public lang: LanguageService,
    private purchasesAttachmentServices: PurchasesAttachmentService,
    private route: ActivatedRoute,
    public purchasesService: PurchasesService,
    private router: Router,
    private permissionsService: PermissionsService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.isViewMode = this.route.snapshot.url[0].path === 'view';
    this.subs.add(
      this.route.params
        .pipe(
          switchMap((params) => {
            if (params['id']) {
              this.purchasesId = params['id'];
            }
            return this.purchasesService.currentPurchase$.pipe(
              tap((data) => {
                if (data) {
                  this.selectedAttachments = data.attachments || [];
                }
              }),
            );
          }),
        )
        .subscribe(),
    );
  }

  deleteAttachment(index: number) {
    const attachmentId = String(this.selectedAttachments[index].id);
    if (this.purchasesId) {
      this.purchasesAttachmentServices
        .deleteAttachment(this.purchasesId, attachmentId)
        .subscribe(() => {
          this.selectedAttachments.splice(index, 1);
        });
    } else {
      this.selectedAttachments.splice(index, 1);
    }
  }

  addAttachment() {
    if (this.purchasesId) {
      this.purchasesAttachmentServices
        .addAttachment(this.purchasesId, this.createFormDateForAttachment())
        .subscribe(() => {
          this.addAttachmentToTableView();
        });
    } else {
      this.addAttachmentToTableView();
    }
  }

  addAttachmentToTableView() {
    this.selectedAttachments.push(
      this.attachmentForm.value as PurchaseAttachment,
    );
    this.attachmentForm.reset();
    this.fileUpload.deleteFile(new Event('click'));
  }

  createFormDateForAttachment() {
    const attachment = this.attachmentForm.value;

    const formData = new FormData();

    formData.append(attachment.name as string, attachment.file as File);

    return formData;
  }

  openAttachment(attachment: InvoiceAttachment) {
    window.open(URL.createObjectURL(attachment.file), '_blank');
  }

  editAttachment(attachment: InvoiceAttachment, index: number) {
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

      if (this.purchasesId) {
        this.purchasesAttachmentServices
          .editAttachment(
            this.purchasesId,
            attachmentId as any,
            attachmentName as string,
          )
          .subscribe(() => {
            this.updateAttachmentInTableView();
          });
      } else {
        this.updateAttachmentInTableView();
      }
    }
  }

  updateAttachmentInTableView() {
    this.selectedAttachments[this.editedAttachmentIndex!] = this.attachmentForm
      .value as PurchaseAttachment;
    this.editedAttachmentIndex = null;
    this.editAttachmentMode = false;
    this.attachmentForm.reset();
    this.fileUpload.deleteFile(new Event('click'));
  }

  addOrUpdate() {
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
    this.fileUpload.deleteFile(new Event('click'));
  }

  previousStep(index: number) {
    this.purchasesService.currentStep$.next(index);
  }

  submitPurchases() {
    const value = {
      ...this.purchasesService.currentPurchase$.value,
      attachments: this.selectedAttachments,
    };
    this.purchasesService.currentPurchase$.next(value as any);
    this.submitting.emit();
  }

  switchToEdit() {
    this.router.navigate(['purchases/edit', this.purchasesId]);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  hasPermissionToEdit() {
    const canEdit =
      this.purchasesService.currentPurchase$.value?.created_by ===
        this.authService.userData?.user.userId ||
      this.authService.userData?.user.permissionType ===
        PermissionTypes.GENERAL;

    return (
      this.isViewMode &&
      this.permissionsService.hasPermission('update:expense') &&
      canEdit
    );
  }
}
