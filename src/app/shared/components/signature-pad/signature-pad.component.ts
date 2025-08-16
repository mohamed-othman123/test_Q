import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import SignaturePad from 'signature_pad';

@Component({
    selector: 'app-signature-pad',
    templateUrl: './signature-pad.component.html',
    styleUrls: ['./signature-pad.component.scss'],
    standalone: false
})
export class SignaturePadComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
  @ViewChild('signatureCanvas') signatureCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() width: number = 400;
  @Input() height: number = 200;
  @Input() backgroundColor: string = 'rgb(255, 255, 255)';
  @Input() penColor: string = 'rgb(0, 0, 0)';
  @Input() existingSignatureData: string | null = null;
  @Input() disabled: boolean = false;
  @Input() label: string = 'Signature';
  @Input() instructions: string = 'Sign here';

  @Output() signatureChange = new EventEmitter<string | null>();
  @Output() signatureStart = new EventEmitter<void>();
  @Output() signatureEnd = new EventEmitter<void>();
  @Output() signatureCleared = new EventEmitter<void>();

  signaturePad!: SignaturePad;
  isDrawing: boolean = false;
  isSigned: boolean = false;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initializeSignaturePad();

    // Handle window resize
    window.addEventListener('resize', this.resizeCanvas.bind(this));
    this.resizeCanvas();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      this.signaturePad &&
      changes['existingSignatureData'] &&
      changes['existingSignatureData'].currentValue
    ) {
      this.loadExistingSignature();
    }

    if (this.signaturePad && changes['disabled']) {
      if (changes['disabled'].currentValue) {
        this.signaturePad.off();
      } else {
        this.signaturePad.on();
      }
    }

    if (
      this.signaturePad &&
      (changes['penColor'] || changes['backgroundColor'])
    ) {
      this.updatePadOptions();
    }
  }

  private initializeSignaturePad(): void {
    const canvas = this.signatureCanvas.nativeElement;

    this.signaturePad = new SignaturePad(canvas, {
      backgroundColor: this.backgroundColor,
      penColor: this.penColor,
      minWidth: 1,
      maxWidth: 2.5,
      throttle: 16,
      velocityFilterWeight: 0.7,
    });

    this.signaturePad.addEventListener('beginStroke', () => {
      this.isDrawing = true;
      this.signatureStart.emit();
    });

    this.signaturePad.addEventListener('endStroke', () => {
      this.isDrawing = false;
      this.isSigned = !this.signaturePad.isEmpty();
      this.signatureEnd.emit();

      if (this.isSigned) {
        this.emitSignatureData();
      }
    });

    if (this.existingSignatureData) {
      this.loadExistingSignature();
    }

    if (this.disabled) {
      this.signaturePad.off();
    }
  }

  private loadExistingSignature(): void {
    if (!this.signaturePad || !this.existingSignatureData) {
      return;
    }
    this.signaturePad.clear();
    this.isSigned = true;
    const img = new Image();
    img.onload = () => {
      this.signaturePad.clear();
      setTimeout(() => {
        this.signaturePad.fromDataURL(this.existingSignatureData!);
        this.isSigned = true;
      }, 50);
    };
    img.onerror = () => {
      this.signaturePad.clear();
      this.isSigned = false;
    };

    img.src = this.existingSignatureData;
  }

  private updatePadOptions(): void {
    if (this.signaturePad) {
      this.signaturePad.penColor = this.penColor;
      this.signaturePad.backgroundColor = this.backgroundColor;
    }
  }

  resizeCanvas(): void {
    const canvas = this.signatureCanvas.nativeElement;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);

    const currentData =
      this.signaturePad && !this.signaturePad.isEmpty()
        ? this.signaturePad.toDataURL()
        : null;

    const parentWidth = canvas.parentElement?.offsetWidth || this.width;

    canvas.width = parentWidth * ratio;
    canvas.height = this.height * ratio;
    canvas.style.width = `${parentWidth}px`;
    canvas.style.height = `${this.height}px`;

    const context = canvas.getContext('2d');
    if (context) {
      context.scale(ratio, ratio);
    }

    if (this.signaturePad) {
      this.signaturePad.off();
    }

    this.signaturePad = new SignaturePad(canvas, {
      backgroundColor: this.backgroundColor,
      penColor: this.penColor,
      minWidth: 1,
      maxWidth: 2.5,
      throttle: 16,
      velocityFilterWeight: 0.7,
    });

    this.signaturePad.addEventListener('beginStroke', () => {
      this.isDrawing = true;
      this.signatureStart.emit();
    });

    this.signaturePad.addEventListener('endStroke', () => {
      this.isDrawing = false;
      this.isSigned = !this.signaturePad.isEmpty();
      this.signatureEnd.emit();
      if (this.isSigned) {
        this.emitSignatureData();
      }
    });

    if (currentData) {
      setTimeout(() => {
        this.signaturePad.fromDataURL(currentData);
        this.isSigned = true;
      }, 0);
    }

    if (this.disabled) {
      this.signaturePad.off();
    }
  }

  clear(): void {
    if (this.signaturePad) {
      this.signaturePad.clear();
      this.isSigned = false;
      this.signatureChange.emit(null);
      this.signatureCleared.emit();
    }
  }

  toDataURL(type: string = 'image/png', encoderOptions?: number): string {
    return this.signaturePad
      ? this.signaturePad.toDataURL(type, encoderOptions)
      : '';
  }

  isEmpty(): boolean {
    return this.signaturePad
      ? this.signaturePad.isEmpty() && !this.isSigned
      : !this.isSigned;
  }

  emitSignatureData(): void {
    setTimeout(() => {
      if (this.signaturePad && !this.signaturePad.isEmpty()) {
        const signatureData = this.signaturePad.toDataURL();
        this.signatureChange.emit(signatureData);
      } else {
        this.signatureChange.emit(null);
      }
    }, 50);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeCanvas.bind(this));
    if (this.signaturePad) {
      this.signaturePad.off();
    }
  }
}
