import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';

interface MapLocation {
  lat: number;
  long: number;
}

type GoogleMap = any;
type GoogleMarker = any;
type MapMouseEvent = {latLng?: {toJSON: () => {lat: number; lng: number}}};

@Component({
    selector: 'app-map-picker',
    templateUrl: './map-picker.component.html',
    styleUrls: ['./map-picker.component.scss'],
    standalone: false
})
export class MapPickerComponent implements OnInit, AfterViewInit {
  @Input() isEditMode = false;
  @Input() initialLocation?: MapLocation;
  @Output() locationSelected = new EventEmitter<MapLocation>();
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  currentLocation?: MapLocation;
  map: GoogleMap | null = null;
  marker: GoogleMarker | null = null;

  ngOnInit() {
    this.currentLocation = this.initialLocation || {
      lat: 24.7136,
      long: 46.6753,
    };
  }

  ngAfterViewInit() {
    this.initMap();
  }

  updateLatitude(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const lat = parseFloat(value);
    if (!isNaN(lat)) {
      this.currentLocation = {
        ...(this.currentLocation || {long: 0}),
        lat,
      };
      this.locationSelected.emit(this.currentLocation);
      this.updateMarkerPosition();
    }
  }

  updateLongitude(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const long = parseFloat(value);
    if (!isNaN(long)) {
      this.currentLocation = {
        ...(this.currentLocation || {lat: 0}),
        long,
      };
      this.locationSelected.emit(this.currentLocation);
      this.updateMarkerPosition();
    }
  }

  private initMap() {
    if (!this.currentLocation) return;

    const mapOptions = {
      center: {lat: this.currentLocation.lat, lng: this.currentLocation.long},
      zoom: 12,
      mapTypeId: 'roadmap',
      streetViewControl: false,
      mapTypeControl: false,
    };

    this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);

    this.marker = new google.maps.Marker({
      position: {lat: this.currentLocation.lat, lng: this.currentLocation.long},
      map: this.map,
      draggable: this.isEditMode,
    });

    this.addLocationButton();

    this.map.addListener('click', (event: MapMouseEvent) => {
      if (this.isEditMode) {
        const position = event.latLng?.toJSON();
        if (position) {
          this.updateLocation(position.lat, position.lng);
        }
      }
    });

    if (this.marker) {
      this.marker.addListener('dragend', (event: MapMouseEvent) => {
        if (this.isEditMode) {
          const position = event.latLng?.toJSON();
          if (position) {
            this.updateLocation(position.lat, position.lng);
          }
        }
      });
    }
  }

  private addLocationButton() {
    const locationButton = document.createElement('button');
    locationButton.classList.add('custom-map-control');
    locationButton.innerHTML = '<i class="pi pi-compass"></i>';

    locationButton.style.backgroundColor = '#fff';
    locationButton.style.border = 'none';
    locationButton.style.borderRadius = '2px';
    locationButton.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
    locationButton.style.cursor = 'pointer';
    locationButton.style.margin = '10px';
    locationButton.style.padding = '0px';
    locationButton.style.width = '40px';
    locationButton.style.height = '40px';
    locationButton.style.display = 'flex';
    locationButton.style.alignItems = 'center';
    locationButton.style.justifyContent = 'center';

    if (this.map) {
      this.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(
        locationButton,
      );
    }

    locationButton.addEventListener('click', () => {
      this.getCurrentLocation();
    });
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const location = {
          lat: position.coords.latitude,
          long: position.coords.longitude,
        };
        if (this.isEditMode || !this.currentLocation) {
          this.currentLocation = location;
          this.locationSelected.emit(location);
          this.updateMarkerPosition();
        } else {
          if (this.map) {
            this.map.panTo({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          }
        }
      });
    }
  }

  private updateLocation(lat: number, lng: number) {
    this.currentLocation = {
      lat,
      long: lng,
    };
    this.locationSelected.emit(this.currentLocation);
    this.updateMarkerPosition();
  }

  private updateMarkerPosition() {
    if (this.marker && this.map && this.currentLocation) {
      const position = {
        lat: this.currentLocation.lat,
        lng: this.currentLocation.long,
      };
      this.marker.setPosition(position);
      this.map.panTo(position);
    }
  }
}
