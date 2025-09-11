import {Component, Input, OnInit} from '@angular/core';

import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {SharedModule} from '@shared/shared.module';

@Component({
    selector: 'app-contacts',
    imports: [SharedModule],
    templateUrl: './contacts.component.html',
    styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {
  @Input() contactDetails: any;
  googleMapUrl!: SafeResourceUrl;
  lat: number = 0;
  long: number = 0;
  locatedAddress: string = '';

  constructor(private sanitizer: DomSanitizer) {}

  async ngOnInit(): Promise<void> {
    if (this.contactDetails?.mapLocation) {
      this.lat = this.contactDetails.mapLocation.lat;
      this.long = this.contactDetails.mapLocation.long;

      const url =
        `https://www.google.com/maps/embed/v1/place` +
        `?key=AIzaSyBAVP3Nfq9nW5b3JNGH6zfFgRJhkNBs4o8` +
        `&q=${this.lat},${this.long}` +
        `&center=${this.lat},${this.long}` +
        `&zoom=14`;
      this.googleMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

      await this.getAddressFromCoordinates();
    }
  }

  private async getAddressFromCoordinates() {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${this.lat}&lon=${this.long}&format=json&accept-language=ar`,
      {
        headers: {
          'Accept-Language': 'ar',
        },
      },
    );
    const data = await response.json();

    if (data.display_name) {
      this.locatedAddress = data.display_name;
    } else if (data.error) {
      this.locatedAddress = 'العنوان غير متوفر';
    }
  }

  openInGoogleMaps() {
    const googleMapsUrl = `https://www.google.com/maps?q=${this.lat},${this.long}`;
    window.open(googleMapsUrl, '_blank');
  }
}
