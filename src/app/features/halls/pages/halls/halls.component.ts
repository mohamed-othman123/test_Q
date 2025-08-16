import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Filter} from '@core/interfaces';
import {DataTableFilter, FormMode} from '@core/models';
import {AuthService, FilterService} from '@core/services';
import {DrawerService} from '@core/services/drawer.service';
import {Hall} from '@halls/models/halls.model';
import {HallsService} from '@halls/services/halls.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-halls',
    templateUrl: './halls.component.html',
    styleUrls: ['./halls.component.scss'],
    standalone: false
})
export class HallsComponent extends Filter implements OnInit {
  Halls: Hall[] = [];
  selectedItems!: Hall;
  hall: null | Hall = null;
  mode: FormMode = 'add';
  showLogOutBtn: boolean = false;

  protected override filterConfig: {[key: string]: unknown} = {
    name: [null],
  };

  constructor(
    private hallsService: HallsService,
    protected override filterService: FilterService,
    public drawerService: DrawerService,
    public translate: TranslateService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public auth: AuthService,
  ) {
    super(filterService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadHallsDirectly();
  }

  loadHallsDirectly(): void {
    const sub = this.hallsService.getAllHalls().subscribe({
      next: (result) => {
        this.Halls = result.items;
        this.totalRecords = result.totalItems || result.items.length;
        this.showLogOutBtn = !this.Halls || this.Halls.length === 0;
      },
      error: (err) => {
        this.Halls = [];
        this.showLogOutBtn = true;
      },
    });
    this.subs.add(sub);
  }

  protected override loadDataTable(filters: DataTableFilter): void {
    const sub = this.hallsService.getHallsList(filters).subscribe({
      next: (halls) => {
        this.Halls = halls?.items || [];
        this.totalRecords = halls?.totalItems || 0;
        this.showLogOutBtn = !this.Halls.length;
      },
      error: (err) => {
        this.Halls = [];
        this.showLogOutBtn = true;
      },
    });
    this.subs.add(sub);
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
    this.loadDataTable(this.filters);
  }

  addNewHall(): void {
    this.drawerService.open({
      mode: 'add',
      title: 'halls.addNewHall',
      visible: true,
    });
  }

  editHall(event: Event, hall: Hall): void {
    if (event) {
      event.stopPropagation();
    }
    if (!hall || !hall.id) return;

    this.router.navigate(['./edit', hall.id], {
      relativeTo: this.activatedRoute,
    });
  }

  deleteHall(hall: Hall, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!hall || !hall.id) return;

    this.confirmDeleteHall(hall);
  }

  confirmDeleteHall(hall: Hall): void {
    if (!hall || !hall.id) return;

    const sub = this.hallsService.deleteHall(hall.id).subscribe({
      next: () => {
        this.loadDataTable(this.filters);
      },
    });
    this.subs.add(sub);
  }

  refreshDataTable(): void {
    this.loadDataTable(this.filters);
  }

  getTotalCapacity(hall: Hall): number {
    if (!hall.sections || hall.sections.length === 0) {
      return 0;
    }

    return hall.sections.reduce(
      (total, section) => total + (section.capacity || 0),
      0,
    );
  }

  getHallInitials(hall: Hall): string {
    const name =
      this.translate.currentLang === 'ar' && hall.name_ar
        ? hall.name_ar
        : hall.name;

    if (!name || typeof name !== 'string') return '?';

    return name
      .split(' ')
      .filter((word) => word.length > 0)
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  signOut(): void {
    this.auth.logout();
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
    const container = imgElement.closest('.hall-image-container');
    if (container) {
      if (!container.querySelector('.hall-initials')) {
        const initialsDiv = document.createElement('div');
        initialsDiv.className = 'hall-initials';
        const hallNameElement = container
          .closest('.hall-card')
          ?.querySelector('.hall-name');
        if (hallNameElement && hallNameElement.textContent) {
          const name = hallNameElement.textContent.trim();
          const initials = name
            .split(' ')
            .filter((word) => word.length > 0)
            .map((word) => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');

          initialsDiv.textContent = initials || '??';
        } else {
          initialsDiv.textContent = '??';
        }
        container.appendChild(initialsDiv);
      }
    }
  }
}
