import {
  Component,
  Input,
  forwardRef,
  ElementRef,
  ViewChild,
  OnChanges,
  HostListener,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import Quill from 'quill';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

@Component({
  selector: 'app-rich-text-editor',
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true,
    },
  ],
  standalone: false,
})
export class RichTextEditorComponent
  implements ControlValueAccessor, OnChanges, OnDestroy, AfterViewInit
{
  @ViewChild('editor', {static: true}) editorElement!: ElementRef;
  @ViewChild('quillContainer', {static: true}) quillContainer!: ElementRef;
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() label: string = '';
  @Input() required: boolean = false;
  @Input() maxLength: number = 0;
  @Input() isSimple: boolean = false;

  isEditMode: boolean = false;
  currentValue: string = '';
  tempValue: string = '';
  textDirection: 'rtl' | 'ltr' = 'ltr';
  hasMaxLengthError: boolean = false;
  currentLength: number = 0;
  showError: boolean = false;
  touched: boolean = false;
  private quill!: Quill;
  private onChange: any = () => {};
  private onTouched: any = () => {};
  private clickOutsideListener: any;
  private toolbarElement: HTMLElement | null = null;

  currentSafeValue: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngAfterViewInit() {
    this.initializeQuill();
    setTimeout(() => {
      this.setupClickOutsideListener();
    }, 0);
  }

  ngOnDestroy() {
    this.removeClickOutsideListener();
  }

  private setupClickOutsideListener() {
    this.clickOutsideListener = (event: MouseEvent) => {
      if (!this.isEditMode || !this.quill) return;

      if (!this.toolbarElement) {
        this.toolbarElement =
          this.quillContainer.nativeElement.querySelector('.ql-toolbar');
      }

      const isClickInsideEditor = this.quill.container.contains(
        event.target as Node,
      );
      const isClickInsideToolbar =
        this.toolbarElement &&
        this.toolbarElement.contains(event.target as Node);

      if (!isClickInsideEditor && !isClickInsideToolbar) {
        this.saveChanges();
      }
    };

    document.addEventListener('mousedown', this.clickOutsideListener);
  }

  private removeClickOutsideListener() {
    if (this.clickOutsideListener) {
      document.removeEventListener('mousedown', this.clickOutsideListener);
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent) {
    if (this.isEditMode) {
      this.cancelEdit();
      event.preventDefault();
    }
  }

  private initializeQuill() {
    const tools = !this.isSimple
      ? [
          [{'direction': 'rtl'}],
          [{'align': []}],
          [{'size': ['small', false, 'large', 'huge']}],
          [{'list': 'ordered'}, {'list': 'bullet'}],
          [{'color': []}, {'background': []}],
        ]
      : [];

    const toolbarOptions = {
      container: [['bold', 'underline', 'strike'], ...tools, ['clean']],
    };

    this.quill = new Quill(this.editorElement.nativeElement, {
      modules: {
        toolbar: toolbarOptions,
      },
      placeholder: this.placeholder,
      theme: 'snow',
      formats: [
        'bold',
        'italic',
        'underline',
        'strike',
        'align',
        'direction',
        'size',
        'list',
        'color',
        'background',
      ],
    });

    this.textDirection = this.detectTextDirection(
      this.currentValue || this.placeholder,
    );

    const editor = this.quill.container.querySelector(
      '.ql-editor',
    ) as HTMLElement;
    if (editor) {
      editor.setAttribute('dir', this.textDirection);
      editor.style.textAlign = this.textDirection === 'rtl' ? 'right' : 'left';
    }

    this.quill.on('text-change', () => {
      if (!this.quill) return;

      const editor = this.quill.container.querySelector(
        '.ql-editor',
      ) as HTMLElement;
      if (editor) {
        const plainText = editor.textContent || '';
        this.currentLength = plainText.length;

        if (this.maxLength > 0 && plainText.length > this.maxLength) {
          this.hasMaxLengthError = true;
          this.quill.root.innerHTML = this.tempValue;
          return;
        }

        this.hasMaxLengthError = false;
        this.tempValue = editor.innerHTML;

        if (editor.textContent?.trim()) {
          this.textDirection = this.detectTextDirection(editor.textContent);
          editor.setAttribute('dir', this.textDirection);
          editor.style.textAlign =
            this.textDirection === 'rtl' ? 'right' : 'left';
        }
        this.onTouched();
      }
    });
    this.toolbarElement =
      this.quillContainer.nativeElement.querySelector('.ql-toolbar');
  }

  toggleEditMode() {
    if (!this.disabled) {
      this.isEditMode = true;
      this.tempValue = this.currentValue;
      setTimeout(() => {
        if (this.quill) {
          this.quill.root.innerHTML = this.currentValue;
          this.quill.focus();
          if (this.currentValue.replace(/<[^>]*>/g, '').trim()) {
            this.showError = false;
          }
        }
      });
    }
  }

  saveChanges() {
    if (this.hasMaxLengthError) {
      return;
    }

    const cleanContent = this.tempValue.replace(/<[^>]*>/g, '').trim();
    if (!cleanContent && this.required) {
      this.showError = true;
      this.touched = true;
      this.tempValue = '';
      this.quill.root.innerHTML = '';
      this.onChange('');
      this.onTouched();
      return;
    }

    this.showError = false;
    this.currentValue = this.tempValue;
    this.currentSafeValue = this.sanitizer.bypassSecurityTrustHtml(
      this.currentValue.replace(/\n/g, '<br>'),
    );
    this.onChange(this.currentValue);
    this.onTouched();
    this.isEditMode = false;
  }

  cancelEdit() {
    this.isEditMode = false;
    this.tempValue = this.currentValue;
    if (this.quill) {
      this.quill.root.innerHTML = this.currentValue;
    }

    const cleanContent = this.currentValue.replace(/<[^>]*>/g, '').trim();
    this.showError = this.required && !cleanContent && this.touched;

    this.currentSafeValue = this.sanitizer.bypassSecurityTrustHtml(
      this.currentValue.replace(/\n/g, '<br>'),
    );
  }

  writeValue(value: any): void {
    this.currentValue = value || '';

    if (this.currentValue) {
      const textContent = this.currentValue.replace(/<[^>]*>/g, '');
      this.textDirection = this.detectTextDirection(textContent);
      this.currentLength = textContent.length;
    }

    this.currentSafeValue = this.sanitizer.bypassSecurityTrustHtml(
      this.currentValue.replace(/\n/g, '<br>'),
    );

    if (this.quill && this.isEditMode) {
      this.quill.root.innerHTML = value || '';
      const editor = this.quill.container.querySelector(
        '.ql-editor',
      ) as HTMLElement;
      if (editor) {
        editor.setAttribute('dir', this.textDirection);
        editor.style.textAlign =
          this.textDirection === 'rtl' ? 'right' : 'left';
      }
    }
  }

  private detectTextDirection(text: string): 'rtl' | 'ltr' {
    if (!text) return 'ltr';

    const arabicPattern =
      /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    const plainText = text.replace(/<[^>]*>/g, '').trim();
    if (!plainText) return 'ltr';
    const firstFewChars = plainText.substring(0, 10);
    if (arabicPattern.test(firstFewChars)) {
      return 'rtl';
    }
    let arabicCount = 0;
    let nonArabicCount = 0;

    for (let i = 0; i < plainText.length; i++) {
      if (arabicPattern.test(plainText[i])) {
        arabicCount++;
      } else if (/\S/.test(plainText[i])) {
        nonArabicCount++;
      }
    }
    if (arabicCount > 0 && arabicCount / (arabicCount + nonArabicCount) > 0.4) {
      return 'rtl';
    }

    return 'ltr';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = () => {
      this.touched = true;
      fn();
    };
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.quill) {
      this.quill.enable(!isDisabled);
    }
  }

  ngOnChanges(): void {
    this.currentSafeValue = this.sanitizer.bypassSecurityTrustHtml(
      this.currentValue.replace(/\n/g, '<br>'),
    );
  }
}
