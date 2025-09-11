import {Component, Input, OnInit} from '@angular/core';

import {IHallDetails} from '@core/interfaces/landing-pages/i-hall-details';

@Component({
    selector: 'app-halls',
    imports: [],
    templateUrl: './halls.component.html',
    styleUrl: './halls.component.scss'
})
export class HallsComponent implements OnInit {
  @Input() hallData!: IHallDetails;
  hallDetails!: IHallDetails;
  hallType!: string;
  ngOnInit(): void {
    this.hallDetails = this.hallData;

    this.hallType = this.getHallType();
  }

  getHallType() {
    const {mensCapacity, womensCapacity} = this.hallDetails;

    if (womensCapacity > 0 && mensCapacity === 0) return 'للنساء فقط';

    if (mensCapacity > 0 && womensCapacity === 0) return 'للرجال فقط';

    return 'للرجال والنساء';
  }
}
