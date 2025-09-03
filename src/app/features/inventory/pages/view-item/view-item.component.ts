import {Location} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Source} from '@core/models';
import {AuditTransactionsService, LanguageService} from '@core/services';
import {HallsService} from '@halls/services/halls.service';
import {InventoryItem} from '@inventory/models/inventory';
import {InventoryService} from '@inventory/services/inventory.service';
import {CommentType} from '@shared/components/comments/models/comment';

@Component({
  selector: 'app-view-item',
  standalone: false,
  templateUrl: './view-item.component.html',
  styleUrl: './view-item.component.scss',
})
export class ViewItemComponent implements OnInit {
  itemId: string | null = null;

  inventoryItem: InventoryItem | null = null;

  hallId: string;

  source: Source = Source.inventory;

  commentType = CommentType;

  constructor(
    private route: ActivatedRoute,
    private hallsService: HallsService,
    private inventoryService: InventoryService,
    public lang: LanguageService,
    private location: Location,
  ) {
    this.itemId = this.route.snapshot.paramMap.get('id');
    this.hallId = String(this.hallsService.getCurrentHall()?.id) || '';
  }

  ngOnInit(): void {
    if (this.itemId) {
      this.getInventoryItemById();
    }
  }

  getInventoryItemById(): void {
    this.inventoryService
      .getInventoryItemById(this.itemId!)
      .subscribe((data) => {
        this.inventoryItem = data;
      });
  }

  goBack() {
    this.location.back();
  }
}
