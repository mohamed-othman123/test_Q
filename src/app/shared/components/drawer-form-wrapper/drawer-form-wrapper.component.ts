import {
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {SHAKEABLE_INPUT} from '@core/constants';
import {ShakeableInput} from '@core/interfaces';
import {DrawerService} from '@core/services/drawer.service';
import {LanguageService} from '@core/services/language.service';
import {ShakeableService} from '@core/services/shakeable.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-drawer-form-wrapper',
  templateUrl: './drawer-form-wrapper.component.html',
  styleUrls: ['./drawer-form-wrapper.component.scss'],
  standalone: false,
})
export class DrawerFormWrapperComponent implements OnInit, OnDestroy {
  drawerState$ = this.drawerService.drawerState$;

  @Input() hideSubmitBtn = false;

  @Input({required: true}) form!: FormGroup;

  @Input() id: string | null = null;

  @Output() onSubmit = new EventEmitter<any>();

  @ContentChildren(SHAKEABLE_INPUT, {descendants: true})
  shakeableInputs!: QueryList<ShakeableInput>;

  @ContentChildren(SHAKEABLE_INPUT, {read: ElementRef, descendants: true})
  shakeableElementRefs!: QueryList<ElementRef>;

  visible = false;

  subs = new Subscription();

  constructor(
    private drawerService: DrawerService,
    public lang: LanguageService,
    private shakeableService: ShakeableService,
  ) {}

  ngOnInit(): void {
    const sub = this.drawerService.drawerState$.subscribe((state) => {
      this.visible = this.id === state.id;

      if (state.visible) {
        if (state.mode === 'view') {
          this.form.disable();
        } else {
          this.form.enable();
        }
      } else {
        this.form.reset();
      }
    });
    this.subs.add(sub);
  }

  hide(): void {
    this.drawerService.close();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.shakeableService.shakeInvalid();
      Array.from(this.shakeableInputs).forEach((component, index) => {
        const elementRef = this.shakeableElementRefs.get(index);
        if (elementRef && elementRef.nativeElement.offsetParent !== null) {
          component.shakeInvalid();
        }
      });

      return;
    }
    this.onSubmit.emit(this.form.value);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
