import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {TableModule} from 'primeng/table';
import {TooltipModule} from 'primeng/tooltip';
import {InputComponent} from './components/input/input.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ScrollerModule} from 'primeng/scroller';
import {ScrollPanelModule} from 'primeng/scrollpanel';
import {SearchInputComponent} from './components/search-input/search-input.component';
import {TagModule} from 'primeng/tag';
import {IconFieldModule} from 'primeng/iconfield';
import {InputIconModule} from 'primeng/inputicon';
import {MultiSelectModule} from 'primeng/multiselect';
import {DropdownModule} from 'primeng/dropdown';
import {CheckboxModule} from 'primeng/checkbox';
import {ColorPickerModule} from 'primeng/colorpicker';
import {ListHeaderComponent} from './components/list-header/list-header.component';
import {ForbiddenComponent} from './components/forbidden/forbidden.component';
import {DialogModule} from 'primeng/dialog';
import {ToastModule} from 'primeng/toast';
import {EmptyStateComponent} from './components/empty-state/empty-state.component';
import {DropdownComponent} from './components/dropdown/dropdown.component';
import {CalendarModule} from 'primeng/calendar';
import {AddNewClientComponent} from './components/add-new-client/add-new-client.component';
import {FormatDatePipe} from './pipes/format-date.pipe';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {ConfirmDeleteDialogDirective, ShakeableDirective} from './directives';
import {HijriDatePipe} from './pipes/hijri-date.pipe';
import {ModalComponent} from './components/modal/modal.component';
import {NgbDatepickerModule, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {DatePickerComponent} from './components/date-picker/date-picker.component';
import {GregorianDatePickerComponent} from './components/gregorian-date-picker/gregorian-date-picker.component';
import {IslamicDatePickerComponent} from './components/islamic-date-picker/islamic-date-picker.component';
import {NgxIntlTelInputModule} from 'ngx-intl-tel-input';
import {TabViewModule} from 'primeng/tabview';
import {PhoneInputComponent} from './components/phone-input/phone-input.component';
import {OptionLabelPipe} from './pipes';
import {RichTextEditorComponent} from '@shared/components/rich-text-editor/rich-text-editor.component';
import {DrawerFormWrapperComponent} from './components/drawer-form-wrapper/drawer-form-wrapper.component';
import {SidebarModule} from 'primeng/sidebar';
import {RippleModule} from 'primeng/ripple';
import {MenuModule} from 'primeng/menu';
import {FileUploadComponent} from './components/file-upload/file-upload.component';
import {RadioButtonModule} from 'primeng/radiobutton';
import {StatusBadgeComponent} from '@orders/components';
import {DayNamePipe} from './pipes/day-name.pipe';
import {IconPickerModule} from '@shared/modules/icon-picker/icon-picker.module';
import {FilePreviewPipe} from './pipes/file-preview.pipe';
import {MapPickerComponent} from './components/map-picker/map-picker.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {NationalNumberPipe} from './pipes/national-number.pipe';
import {FaIconPipe} from '@shared/pipes/fa-icon.pipe';
import {GregorianDatePipe} from './pipes/gregorian-date.pipe';
import {FormatDateLangPipe} from './pipes/arabic-date.pipe';
import {FormatUTCDatePipe} from './pipes/formate-utc-date';
import {SkeletonModule} from 'primeng/skeleton';
import {DashboardSkeletonComponent} from './components/dashboard-skeleton/dashboard-skeleton.component';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {SarSymbolComponent} from './components/sar-symbol/sar-symbol.component';
import {StepperModule} from 'primeng/stepper';
import {HasPermissionDirective} from './directives/has-permission.directive';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ConfirmPopupComponent} from './components/confirm-popup/confirm-popup.component';
import {InputSwitchModule} from 'primeng/inputswitch';
import {ArabicMonthDatePipe} from './pipes/arabic-month-date.pipe';
import {AddNewSupplierComponent} from './components/add-new-supplier/add-new-supplier.component';
import {PaginatorModule} from 'primeng/paginator';
import {SignaturePadComponent} from './components/signature-pad/signature-pad.component';
import {ColorExtractorComponent} from '@shared/components';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import {TimePickerComponent} from './components/time-picker/time-picker.component';
import {EnglishMonthDatePipe} from './pipes/english-month-date.pipe';
import {AccordionModule} from 'primeng/accordion';
import {NegativeInputDirective} from './directives/negative-input.directive';
import {ArabicHijriDatePipe} from './pipes/arabic-hijri-date.pipe';
import {EnglishHijriDatePipe} from './pipes/english-hijri-date.pipe';
import {CommentsModule} from './components/comments/comments.module';
import {TimelineModule} from 'primeng/timeline';
import {CarouselModule} from 'primeng/carousel';
import {ProgressBarModule} from 'primeng/progressbar';
import {InfoTooltipComponent} from './components/info-tooltip/info-tooltip.component';
import {MessagesModule} from 'primeng/messages';
import {TreeTableModule} from 'primeng/treetable';

const primeNgModules = [
  ButtonModule,
  InputTextModule,
  TableModule,
  TooltipModule,
  ScrollerModule,
  ScrollPanelModule,
  TagModule,
  IconFieldModule,
  InputIconModule,
  MultiSelectModule,
  DropdownModule,
  ToastModule,
  DialogModule,
  CalendarModule,
  ConfirmPopupModule,
  TabViewModule,
  SidebarModule,
  RippleModule,
  MenuModule,
  CheckboxModule,
  RadioButtonModule,
  SkeletonModule,
  ProgressSpinnerModule,
  StepperModule,
  OverlayPanelModule,
  ConfirmDialogModule,
  InputSwitchModule,
  PaginatorModule,
  AccordionModule,
  CommentsModule,
  TimelineModule,
  CarouselModule,
  ProgressBarModule,
  MessagesModule,
  TreeTableModule,
];

const components: any[] = [
  InputComponent,
  SearchInputComponent,
  ListHeaderComponent,
  ForbiddenComponent,
  EmptyStateComponent,
  DropdownComponent,
  AddNewClientComponent,
  EmptyStateComponent,
  ModalComponent,
  DatePickerComponent,
  PhoneInputComponent,
  RichTextEditorComponent,
  DrawerFormWrapperComponent,
  FileUploadComponent,
  StatusBadgeComponent,
  GregorianDatePickerComponent,
  IslamicDatePickerComponent,
  MapPickerComponent,
  DashboardSkeletonComponent,
  SarSymbolComponent,
  ConfirmPopupComponent,
  AddNewSupplierComponent,
  SignaturePadComponent,
  ColorExtractorComponent,
  TimePickerComponent,
  InfoTooltipComponent,
];

const directives: any[] = [
  ConfirmDeleteDialogDirective,
  ShakeableDirective,
  HasPermissionDirective,
  NegativeInputDirective,
];
const pipes: any[] = [
  FormatDatePipe,
  FormatUTCDatePipe,
  HijriDatePipe,
  OptionLabelPipe,
  DayNamePipe,
  FilePreviewPipe,
  NationalNumberPipe,
  FaIconPipe,
  GregorianDatePipe,
  FormatDateLangPipe,
  ArabicMonthDatePipe,
  EnglishMonthDatePipe,
  ArabicHijriDatePipe,
  EnglishHijriDatePipe,
];
const modules: any[] = [
  CommonModule,
  ...primeNgModules,
  TranslateModule,
  ReactiveFormsModule,
  NgbModule,
  NgbDatepickerModule,
  NgxIntlTelInputModule,
  FormsModule,
  IconPickerModule,
  DragDropModule,
  ColorPickerModule,
  NgxMaterialTimepickerModule,
];

@NgModule({
  declarations: [...components, ...directives, ...pipes],
  imports: [...modules],
  exports: [...components, ...directives, ...pipes, ...modules],
})
export class SharedModule {}
