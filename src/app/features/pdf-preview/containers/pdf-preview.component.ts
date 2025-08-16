import {Component, Inject, SecurityContext} from '@angular/core';
import {SafeResourceUrl, DomSanitizer} from '@angular/platform-browser';
import {Router, ActivatedRoute} from '@angular/router';
import {APP_ENVIRONMENT} from '@core/constants';
import {Environment} from '@core/models';
import {PdfPreviewService} from '../services/pdf-preview.service';
import {PrintTemplate} from '@orders/enums/print.enum';

@Component({
  selector: 'pdf-preview',
  templateUrl: './pdf-preview.component.html',
  styleUrls: ['./pdf-preview.component.scss'],
  standalone: false,
})
export class PdfPreviewComponent {
  pdfUrl: SafeResourceUrl | null = null;
  isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  pdfBlobUrl: string | null = null;

  constructor(
    @Inject(APP_ENVIRONMENT) private environment: Environment,
    private sanitizer: DomSanitizer,
    private router: Router,
    private route: ActivatedRoute,
    private pdfPreviewService: PdfPreviewService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    const identity = this.route.snapshot.queryParams['identity'];
    const lang = this.route.snapshot.queryParams['lang'] || 'ar';
    const template = this.route.snapshot.paramMap.get(
      'template',
    ) as PrintTemplate;

    if (!identity) {
      console.warn('Permission denied, hash is required to preview the page');
      this.router.navigate(['/orders']);
      return;
    }

    const queryParams = {
      ...this.route.snapshot.queryParams,
      lang: lang,
    };

    this.pdfPreviewService
      .preview(id.toString(), template, queryParams)
      .subscribe({
        next: (response) => {
          const blob = new Blob([response.body as Blob], {
            type: 'application/pdf',
          });

          const url = window.URL.createObjectURL(blob);
          if (this.isMobile) {
            // window.open(url, '_blank');
            window.location.href = url;
            return;
          }
          this.pdfBlobUrl = url;
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        },
      });
  }

  ngOnDestroy() {
    if (this.pdfBlobUrl) {
      URL.revokeObjectURL(this.pdfBlobUrl);
    }
  }

  downloadPdf() {
    if (this.pdfUrl) {
      const url = this.sanitizer.sanitize(SecurityContext.URL, this.pdfUrl);

      if (url) {
        if (url.startsWith('data:application/pdf;base64,')) {
          const binary = atob(url.split(',')[1]);
          const array = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            array[i] = binary.charCodeAt(i);
          }
          const blob = new Blob([array], {type: 'application/pdf'});
          const downloadUrl = window.URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = 'document.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl);
        } else {
          fetch(url)
            .then((response) => response.blob())
            .then((blob) => {
              const downloadUrl = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = downloadUrl;
              link.download = 'document.pdf';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(downloadUrl);
            });
        }
      }
    }
  }

  close() {
    this.router.navigate(['/orders']);
  }
}
