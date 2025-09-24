import {Location} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Source} from '@core/models';
import {AuditTransactionsService, LanguageService} from '@core/services';
import {HallsService} from '@halls/services/halls.service';
import {InventoryItem, InventoryItemBatch} from '@inventory/models/inventory';
import {InventoryService} from '@inventory/services/inventory.service';
import {CommentType} from '@shared/components/comments/models/comment';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'app-view-item',
  standalone: false,
  templateUrl: './view-item.component.html',
  styleUrl: './view-item.component.scss',
})
export class ViewItemComponent implements OnInit {
  itemId: string | null = null;

  inventoryItem: InventoryItem | null = null;

  //contain all prices and quantities for this item
  inventoryItemBatches: InventoryItemBatch[] = [];

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
    forkJoin({
      item: this.inventoryService.getInventoryItemById(this.itemId!),
      batches: this.inventoryService.getAllInventoryBatches(this.itemId!),
    }).subscribe(({item, batches}) => {
      this.inventoryItem = item;
      this.inventoryItemBatches = batches.items;
    });
  }

  goBack() {
    this.location.back();
  }
}
