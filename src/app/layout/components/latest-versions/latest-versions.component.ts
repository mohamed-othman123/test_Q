import {Component, OnInit} from '@angular/core';
import {Version} from '@core/models';
import {LanguageService} from '@core/services';
import {VersionService} from '@core/services/version.service';

@Component({
    selector: 'app-latest-versions',
    templateUrl: './latest-versions.component.html',
    styleUrl: './latest-versions.component.scss',
    standalone: false
})
export class LatestVersionsComponent implements OnInit {
  latestVersions!: Version[];

  constructor(
    private versionService: VersionService,
    public lang: LanguageService,
  ) {}

  ngOnInit(): void {
    this.getLatestVersions();
  }

  private getLatestVersions() {
    const filters = {
      stack: 'FE',
      page: 1,
      limit: 10,
    };
    this.versionService.getVersions(filters).subscribe((data) => {
      this.latestVersions = data.items.map((item, index) => ({
        ...item,
        index: index + 1,
      }));
    });
  }
}
