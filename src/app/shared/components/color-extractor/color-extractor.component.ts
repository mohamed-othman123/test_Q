import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import {extractColors} from 'extract-colors';

export interface ExtractedColor {
  hex: string;
  red: number;
  green: number;
  blue: number;
  hue: number;
  intensity: number;
  lightness: number;
  saturation: number;
  area: number;
}

@Component({
    selector: 'app-color-extractor',
    templateUrl: './color-extractor.component.html',
    styleUrls: ['./color-extractor.component.scss'],
    standalone: false
})
export class ColorExtractorComponent implements OnChanges {
  @Input() imageUrl: string = '';
  @Input() title: string = 'Extracted Colors';
  @Input() primaryColor: string = '';
  @Input() secondaryColor: string = '';
  @Output() colorSelected = new EventEmitter<{
    type: 'primary' | 'secondary';
    color: string;
  }>();

  colors: ExtractedColor[] = [];
  loading: boolean = false;
  error: string | null = null;
  activeColorType: 'primary' | 'secondary' = 'primary';
  previewPalette: {primary: string; secondary: string} = {
    primary: '',
    secondary: '',
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['imageUrl'] && this.imageUrl) {
      this.extractColorsFromImage();
    }

    if (changes['primaryColor']) {
      this.previewPalette.primary = this.primaryColor;
    }

    if (changes['secondaryColor']) {
      this.previewPalette.secondary = this.secondaryColor;
    }
  }

  private extractColorsFromImage(): void {
    this.loading = true;
    this.error = null;

    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      extractColors(img, {
        pixels: 10000,
        distance: 0.2,
        saturationDistance: 0.2,
        lightnessDistance: 0.2,
        hueDistance: 0.1,
      })
        .then((colors) => {
          this.colors = colors.sort((a, b) => b.area - a.area).slice(0, 12);
          this.loading = false;

          if (!this.previewPalette.primary && this.colors.length > 0) {
            this.previewPalette.primary = this.colors[0].hex;
          }

          if (!this.previewPalette.secondary && this.colors.length > 1) {
            this.previewPalette.secondary = this.colors[1].hex;
          }
        })
        .catch(() => {
          this.loading = false;
        });
    };

    img.onerror = () => {
      this.loading = false;
    };

    img.src = this.imageUrl;
  }

  selectColor(color: string): void {
    this.previewPalette[this.activeColorType] = color;
    this.colorSelected.emit({
      type: this.activeColorType,
      color: color,
    });
  }

  setActiveColorType(type: 'primary' | 'secondary'): void {
    this.activeColorType = type;
  }

  isSelected(color: string): boolean {
    return (
      this.previewPalette.primary === color ||
      this.previewPalette.secondary === color
    );
  }

  isPrimarySelected(color: string): boolean {
    return this.previewPalette.primary === color;
  }

  isSecondarySelected(color: string): boolean {
    return this.previewPalette.secondary === color;
  }

  generateComplementaryColor(hex: string): string {
    hex = hex.replace('#', '');

    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const rComp = 255 - r;
    const gComp = 255 - g;
    const bComp = 255 - b;

    return `#${this.componentToHex(rComp)}${this.componentToHex(gComp)}${this.componentToHex(bComp)}`;
  }

  private componentToHex(c: number): string {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }

  getContrastColor(hexColor: string): string {
    hexColor = hexColor.replace('#', '');

    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  swapColors(): void {
    const temp = this.previewPalette.primary;
    this.previewPalette.primary = this.previewPalette.secondary;
    this.previewPalette.secondary = temp;

    this.colorSelected.emit({
      type: 'primary',
      color: this.previewPalette.primary,
    });

    this.colorSelected.emit({
      type: 'secondary',
      color: this.previewPalette.secondary,
    });
  }
}
