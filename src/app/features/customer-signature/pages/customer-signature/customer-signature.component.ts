import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {SafeHtml} from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';
import {LanguageService} from '@core/services';
import {LandingPageService} from '@core/services/landing-page.service';
import {TranslateService} from '@ngx-translate/core';
import {ConfirmationService} from 'primeng/api';
import {CustomerSignatureService} from '../../services/customer-signature.service';
import {ShakeableService} from '@core/services/shakeable.service';
import {validateDoubleName} from '@core/validators';

@Component({
  selector: 'app-customer-signature',
  templateUrl: './customer-signature.component.html',
  styleUrl: './customer-signature.component.scss',
  standalone: false,
})
export class CustomerSignatureComponent implements OnInit {
  contractId!: string;

  contractHash!: string;

  signatureData!: string | null;

  captchaSvg!: SafeHtml;

  captchaId!: string;

  active = 0;

  contractInfo: any;

  isLoading = true;

  customerSignatureForm = this.fb.group({
    signature: new FormControl<File | null>(null, {
      validators: [Validators.required],
    }),
    signatureName: new FormControl<string | null>(null, {
      validators: [Validators.required, validateDoubleName()],
    }),
    captchaText: [null, Validators.required],
  });

  constructor(
    private confirmationService: ConfirmationService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
    public lang: LanguageService,
    private landingPageService: LandingPageService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private customerSignatureService: CustomerSignatureService,
    private shakeableService: ShakeableService,
  ) {}

  ngOnInit(): void {
    this.contractId = this.route.snapshot.params['id'];
    this.contractHash = this.route.snapshot.queryParams['identity'];
    this.getContractInfo();
  }

  getContractInfo() {
    this.customerSignatureService
      .getContractInfo(this.contractId, this.contractHash)
      .subscribe((res) => {
        this.contractInfo = res;
        this.isLoading = false;
        console.log(res);
      });
  }

  openPrintDialog(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: this.translate.instant('orders.print'),
      icon: 'pi pi-print',
      acceptLabel: this.translate.instant('orders.printAr'),
      rejectLabel: this.translate.instant('orders.printEn'),
      acceptButtonStyleClass: 'accept-arabic',
      accept: () => {
        const url = this.router.serializeUrl(
          this.router.createUrlTree(
            ['../../', 'contract', 'preview', this.contractId?.toString()],
            {
              queryParams: {lang: 'ar', identity: this.contractHash},
              relativeTo: this.route,
            },
          ),
        );

        window.open(url, '_blank');
      },
      reject: () => {
        const url = this.router.serializeUrl(
          this.router.createUrlTree(
            ['../../', 'contract', 'preview', this.contractId?.toString()],
            {
              queryParams: {lang: 'en', identity: this.contractHash},
              relativeTo: this.route,
            },
          ),
        );

        window.open(url, '_blank');
      },
    });
  }

  // This method is called when the user selects a file for the signature
  signatureChange(signatureData: string | null) {
    this.signatureData = signatureData;
    if (this.signatureData) {
      const file = this.dataURLtoFile(
        this.signatureData,
        `${this.contractHash}-signature.png`,
      );

      this.customerSignatureForm?.get('signature')?.setValue(file);
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
    this.customerSignatureForm?.get('signature')?.setValue(null);
  }

  changeLang(lang: string) {
    this.lang.setLanguage(lang);
  }

  next(skip?: boolean) {
    if (skip) {
      this.active = 1;
      this.cdr.detectChanges();
      return;
    }

    if (
      !this.signatureData ||
      !this.customerSignatureForm?.get('signatureName')?.value
    ) {
      this.customerSignatureForm?.get('signature')?.markAsTouched();
      this.customerSignatureForm?.get('signatureName')?.markAsTouched();
      this.shakeableService.shakeInvalid();
      return;
    }

    if (!this.captchaSvg) {
      this.loadCaptcha();
    }

    this.active += 1;
  }

  prev() {
    if (this.active === 0) {
      return;
    }

    this.active -= 1;
    this.cdr.detectChanges();
  }

  private loadCaptcha() {
    this.landingPageService.getCaptcha().subscribe((response) => {
      this.captchaSvg = response.svg;
      this.captchaId = response.captchaId;
    });
  }

  refreshCaptcha() {
    this.loadCaptcha();
  }

  submit() {
    if (this.customerSignatureForm?.get('captchaText')?.invalid) {
      this.customerSignatureForm?.get('captchaText')?.markAsTouched();
      this.shakeableService.shakeInvalid();
      return;
    }

    const payload = this.generatePayload();
    this.customerSignatureService.updateCustomerSignature(payload).subscribe({
      next: () => {
        this.active = 3;
      },
      error: () => {
        this.refreshCaptcha();
        this.customerSignatureForm?.get('captchaText')?.setValue(null);
      },
    });
  }

  generatePayload() {
    const formDate = new FormData();

    const signature = this.customerSignatureForm?.get('signature')?.value;
    const captchaText = this.customerSignatureForm?.get('captchaText')?.value;
    const signatureName =
      this.customerSignatureForm?.get('signatureName')?.value;

    formDate.append('signature', signature!);
    formDate.append('contractId', this.contractId);
    formDate.append('signatureName', signatureName!);
    formDate.append('hash', this.contractHash);
    formDate.append('captchaText', captchaText!);
    formDate.append('captchaId', this.captchaId);

    return formDate;
  }
}
