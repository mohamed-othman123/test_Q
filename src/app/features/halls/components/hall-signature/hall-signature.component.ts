import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {LanguageService} from '@core/services';
import {ShakeableService} from '@core/services/shakeable.service';
import {Hall, HallDocument} from '@halls/models/halls.model';
import {HallsService} from '@halls/services/halls.service';

@Component({
    selector: 'app-hall-signature',
    templateUrl: './hall-signature.component.html',
    styleUrl: './hall-signature.component.scss',
    standalone: false
})
export class HallSignatureComponent implements OnInit {
  signatureData!: string | null;

  @Input() hallId!: string;
  @Input() hallData!: Hall;

  @Output() signatureUpdated = new EventEmitter<Hall>();
  @Output() formChanged = new EventEmitter<void>();

  stampUrl!: string;
  signatureUrl!: string;

  signatureForm!: FormGroup;

  get documentsArray(): FormArray {
    return this.signatureForm.get('documentsArray') as FormArray;
  }

  constructor(
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    public lang: LanguageService,
    private hallsService: HallsService,
    private shakeableService: ShakeableService,
  ) {}

  ngOnInit(): void {
    this.setInitialValues();
    this.formInit();
    this.setupFormListeners();
  }

  formInit() {
    this.signatureForm = this.fb.group({
      signatureName: new FormControl<string | null>(
        this.hallData.signatureName,
        Validators.required,
      ),
      signature: [null],
      stamp: [null],
      documentsArray: this.fb.array(this.generateDocumentsArray()),
    });
  }

  generateDocumentsArray() {
    return (
      this.hallData?.documents?.map((doc) =>
        this.fb.group({
          id: [doc.id],
          name: [doc.name],
          name_ar: [doc.name_ar],
          firstPartySignature: [doc.firstPartySignature],
          firstPartyStamp: [doc.firstPartyStamp],
          secondPartySignature: [doc.secondPartySignature],
        }),
      ) || []
    );
  }

  setupFormListeners() {
    this.signatureForm.valueChanges.subscribe(() => {
      this.formChanged.emit();
    });
    this.documentsArray.valueChanges.subscribe(() => {
      this.formChanged.emit();
    });
  }

  setInitialValues() {
    if (this.hallData?.stampUrl) {
      this.stampUrl = this.hallData?.stampUrl;
    }
    if (this.hallData?.signatureUrl) {
      this.signatureUrl = this.hallData?.signatureUrl;
    }
  }

  // This method is called when the user selects a file for the stamp
  onChangeStamp(files: FileList) {
    if (files) {
      const file: File = files[0];
      const reader = new FileReader();
      reader.onload = (event: any) => {
        this.stampUrl = event.target.result;
        this.cd.detectChanges();
      };
      reader.readAsDataURL(file);

      this.signatureForm?.get('stamp')?.setValue(file);
    }
  }

  deleteStamp() {
    this.stampUrl = '';
    this.formChanged.emit();
  }

  // This method is called when the user selects a file for the signature
  signatureChange(signatureData: string | null) {
    this.signatureData = signatureData;
    if (this.signatureData) {
      const file = this.dataURLtoFile(
        this.signatureData,
        `${this.hallId}-signature.png`,
      );

      this.signatureForm?.get('signature')?.setValue(file);
    }
  }

  private dataURLtoFile(dataURL: string, filename: string): File {
    const [header, base64] = dataURL.split(',');

    const mimeMatch = header.match(/data:(.+);base64/);
    if (!mimeMatch) {
      throw new Error('Invalid data URL');
    }
    const mime = mimeMatch[1];

    // Decode the base64 string
    const binary = atob(base64);
    const len = binary.length;
    const u8arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      u8arr[i] = binary.charCodeAt(i);
    }

    return new File([u8arr], filename, {type: mime});
  }

  clearSignature() {
    this.signatureData = null;
    this.formChanged.emit();
  }

  submit() {
    if (this.signatureForm.invalid) {
      this.signatureForm.markAllAsTouched();
      this.shakeableService.shakeInvalid();
      return;
    }

    const payload = this.generatePayload();
    this.hallsService
      .updateHallSignature(+this.hallId, payload)
      .subscribe((res) => {
        this.signatureUpdated.emit(res);
      });
  }

  generatePayload() {
    const values = this.signatureForm.value;

    const hallDocuments = this.documentsArray.value.map(
      (doc: HallDocument) => ({
        id: doc.id,
        firstPartySignature: String(doc.firstPartySignature),
        firstPartyStamp: String(doc.firstPartyStamp),
        secondPartySignature: String(doc.secondPartySignature),
      }),
    );

    const formData = new FormData();

    formData.append('signatureName', values.signatureName || '');

    if (values.signature) {
      formData.append('signature', values.signature);
    }

    if (values.stamp) {
      formData.append('stamp', values.stamp);
    }

    formData.append('hallDocuments', JSON.stringify(hallDocuments));

    return formData;
  }
}
