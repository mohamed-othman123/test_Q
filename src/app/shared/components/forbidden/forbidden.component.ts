import {Component} from '@angular/core';
import {AuthService} from '@core/services/auth.service';

@Component({
    selector: 'app-forbidden',
    templateUrl: './forbidden.component.html',
    styleUrl: './forbidden.component.scss',
    standalone: false
})
export class ForbiddenComponent {
  constructor() {}
}
