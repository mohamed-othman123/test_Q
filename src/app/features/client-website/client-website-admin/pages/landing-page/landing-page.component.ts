import {Component, OnInit, OnDestroy} from '@angular/core';
import {FormBuilder, FormGroup, FormArray, Validators} from '@angular/forms';
import {HallsService} from '@halls/services/halls.service';
import {Hall} from '@halls/models/halls.model';
import {Subscription} from 'rxjs';
import {trigger, transition, style, animate} from '@angular/animations';
import {LandingGeneralInformationDto} from '@client-website-admin/models/landing-page.model';
import {LandingPageService} from '@client-website-admin/services/landing-page.service';
import {Router} from '@angular/router';
import {noDoubleSpaceValidator} from '@core/validators';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({opacity: 0, transform: 'translateY(-20px)'}),
        animate(
          '400ms ease-out',
          style({opacity: 1, transform: 'translateY(0)'}),
        ),
      ]),
    ]),
  ],
  standalone: false,
})
export class LandingPageComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  currentHall: Hall | null = null;
  landingPageData: LandingGeneralInformationDto | null = null;
  isLoaded = false;
  showBasicForm = false;
  hideBasicForm = false;
  private subs = new Subscription();
  hallLandingName: string = '';

  constructor(
    private fb: FormBuilder,
    private hallsService: HallsService,
    private router: Router,
    private landingPageService: LandingPageService,
  ) {
    this.initForm();
  }

  ngOnInit() {
    const hallSub = this.hallsService.currentHall$.subscribe((hall) => {
      this.currentHall = hall;
      if (hall) {
        this.loadLandingPageData(hall.id);
      }
    });
    this.subs.add(hallSub);
  }

  loadLandingPageData(hallId: number) {
    this.landingPageService.getLandingPageInformation(hallId).subscribe({
      next: (response) => {
        if (response && response.id) {
          this.landingPageData = response;
          this.form.patchValue({
            landingPageId: response.id,
            hallId: response.hallId,
            hallName: response.hallName,
            email: response.email,
            phoneNumber: response.phone,
            aboutHall: response.about,
          });
          this.initializeFormArrays(response);
          this.hallLandingName = response.hallName;
        } else {
          this.landingPageData = null;
          this.form.reset();
        }
        this.isLoaded = true;
      },
      error: () => {
        this.landingPageData = null;
        this.form.reset();
        this.isLoaded = true;
      },
    });
  }

  initializeNewLandingPage() {
    this.showBasicForm = true;
    this.hideBasicForm = false;
    this.form.reset();

    (this.form.get('hallFeatures') as FormArray).clear();
    (this.form.get('hallServices') as FormArray).clear();
    (this.form.get('popularQuestions') as FormArray).clear();

    if (this.currentHall?.id) {
      this.form.patchValue({
        hallId: this.currentHall.id,
        landingPageId: null,
      });
    }
    this.landingPageData = null;
  }

  private initForm() {
    this.form = this.fb.group({
      hallId: [this.currentHall?.id],
      landingPageId: [null],
      hallName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern(/^[a-zA-Z]{3,30}$/),
          noDoubleSpaceValidator(),
        ],
      ],
      email: ['', [Validators.email, Validators.required]],
      phoneNumber: ['', Validators.required],
      aboutHall: ['', [Validators.maxLength(750), noDoubleSpaceValidator()]],

      hallBanner: this.fb.array([]),
      hallClients: this.fb.array([]),
      hallFeatures: this.fb.array([]),
      hallServices: this.fb.array([]),
      hallDetails: this.fb.group({
        hallEvents: this.fb.array([]),
      }),
      hallImages: this.fb.array([]),
      popularQuestions: this.fb.array([]),
      socialLinks: this.fb.group({
        facebook: [null],
        instagram: [null],
        x: [null],
        linkedin: [null],
        snapChat: [null],
        tiktok: [null],
      }),
      location: this.fb.group({
        address: [null],
        mapLocation: [null],
      }),
    });
  }

  private initializeFormArrays(data: LandingGeneralInformationDto) {
    const servicesArray = this.form.get('hallServices') as FormArray;
    servicesArray.clear();

    const featuresArray = this.form.get('hallFeatures') as FormArray;
    featuresArray.clear();

    const clientsArray = this.form.get('hallClients') as FormArray;
    clientsArray.clear();

    const questionsArray = this.form.get('popularQuestions') as FormArray;
    questionsArray.clear();

    for (let section of data.sections) {
      if (section.services?.length) {
        section.services.forEach((service) => {
          servicesArray.push(
            this.fb.control(service, [
              Validators.required,
              Validators.maxLength(30),
            ]),
          );
        });
      }

      if (section.features?.length) {
        section.features.forEach((feature) => {
          featuresArray.push(
            this.fb.group({
              id: [feature.id],
              icon: [feature.icon],
              title: [feature.title],
              description: [feature.description],
              order: [feature.order],
            }),
          );
        });
      }

      if (section.customers?.length) {
        section.customers.forEach((customer) => {
          clientsArray.push(
            this.fb.group({
              id: [customer.id, Validators.required],
              image: [customer.imagePath, Validators.required],
              name: [customer.name],
              site_url: [customer.site_url],
              order: [customer.order],
            }),
          );
        });
      }

      if (section.popularQuestions?.length) {
        section.popularQuestions.forEach((question) => {
          questionsArray.push(
            this.fb.group({
              id: [question.id],
              question: [
                question.question,
                [Validators.required, Validators.maxLength(200)],
              ],
              answer: [
                question.answer,
                [Validators.required, Validators.maxLength(500)],
              ],
              order: [question.order],
            }),
          );
        });
      }

      if (section.socialLinks) {
        this.form.get('socialLinks')?.patchValue({
          facebook: section.socialLinks.facebook || '',
          instagram: section.socialLinks.instagram || '',
          x: section.socialLinks.x || '',
          linkedin: section.socialLinks.linkedin || '',
          snapChat: section.socialLinks.snapChat || '',
          tiktok: section.socialLinks.tiktok || '',
        });
      }
    }

    if (data.location || data.mapLocation) {
      this.form.get('location')?.patchValue({
        address: data.location || '',
        mapLocation: data.mapLocation || null,
      });
    }
  }

  onLandingPageCreated(landingPageData: LandingGeneralInformationDto) {
    this.landingPageData = landingPageData;
    this.showBasicForm = false;

    if (this.currentHall?.id) {
      this.loadLandingPageData(this.currentHall.id);
    }
  }

  onMediaUpdated(updatedData: any) {
    if (updatedData && updatedData.id) {
      this.landingPageData = updatedData;
      this.form.patchValue({
        landingPageId: updatedData.id,
        hallId: updatedData.hallId,
        hallName: updatedData.hallName,
        email: updatedData.email,
        phoneNumber: updatedData.phone,
        aboutHall: updatedData.about,
      });
      this.initializeFormArrays(updatedData);
    } else {
      if (this.currentHall?.id) {
        this.loadLandingPageData(this.currentHall.id);
      }
    }
  }

  onSectionsReordered() {
    if (this.currentHall?.id) {
      this.loadLandingPageData(this.currentHall.id);
    }
  }

  onCancelBasicForm() {
    this.showBasicForm = false;
    this.hideBasicForm = true;
  }

  goToLiveLanding() {
    const urlTree = this.router.createUrlTree(['/lp', this.hallLandingName]);
    const url = this.router.serializeUrl(urlTree);
    window.open(url, '_blank');
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
