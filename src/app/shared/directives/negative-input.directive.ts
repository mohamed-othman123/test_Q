import {Directive, HostListener} from '@angular/core';

@Directive({
    selector: '[preventNegative]',
    standalone: false
})
export class NegativeInputDirective {
  constructor() {}

  @HostListener('keypress', ['$event'])
  onKeyPress(e: any) {
    const key = !isNaN(e.charCode) ? e.charCode : e.keyCode;
    if (!this.keyAllowed(key)) e.preventDefault();
  }

  @HostListener('paste', ['$event'])
  onPaste(e: any) {
    const pasteData = e.clipboardData.getData('text/plain');
    if (pasteData.match(/[^0-9]/)) e.preventDefault();
  }

  keyAllowed(key: number) {
    const keys = [
      8, 9, 13, 16, 17, 18, 19, 20, 27, 46, 48, 49, 50, 51, 52, 53, 54, 55, 56,
      57, 91, 92, 93,
    ];
    if (key && keys.indexOf(key) === -1) return false;
    else return true;
  }
}
