import {
  ChangeDetectorRef,
  Component,
  Input,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
    selector: 'app-file-upload',
    templateUrl: './file-upload.component.html',
    styleUrl: './file-upload.component.scss',
    standalone: false
})
export class FileUploadComponent {
  @Input({required: true}) control!: FormControl<File | null>;
  @Input({required: true}) title!: string;
  @Input() imgUrl: string | null = null;
  @Input() hint!: string;
  @Input() disabled = false;
  @Input() accept: string | null = null;
  @ViewChild('fileUpload') fileUpload!: ElementRef;

  uploadedFileType: string | null = null;

  constructor(private cd: ChangeDetectorRef) {}

  private updateFile(file: File) {
    this.control.setValue(file);

    this.setFileType(file.type);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.imgUrl = reader.result as string;
      this.cd.markForCheck();
    };
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.updateFile(file);
    }
  }

  deleteFile(event: Event) {
    event.stopPropagation();
    this.imgUrl = null;
    this.control.setValue(null);
    this.fileUpload.nativeElement.value = '';
  }

  setFile(file: File) {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    this.fileUpload.nativeElement.files = dataTransfer.files;
    this.updateFile(file);
  }

  setFileType(fileType: string) {
    if (fileType.startsWith('image/')) {
      this.uploadedFileType = 'image';
    } else if (fileType === 'application/pdf') {
      this.uploadedFileType = 'pdf';
    } else if (
      fileType === 'application/msword' ||
      fileType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      this.uploadedFileType = 'word';
    } else {
      this.uploadedFileType = 'other';
    }
  }
}
