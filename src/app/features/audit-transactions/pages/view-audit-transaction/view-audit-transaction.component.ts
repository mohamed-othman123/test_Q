import {Location} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AuditTransaction, Source} from '@core/models';
import {AuditTransactionsService, LanguageService} from '@core/services';
import {CommentType} from '@shared/components/comments/models/comment';

@Component({
  selector: 'app-view-audit-transaction',
  standalone: false,
  templateUrl: './view-audit-transaction.component.html',
  styleUrl: './view-audit-transaction.component.scss',
})
export class ViewAuditTransactionComponent implements OnInit {
  source: Source;
  id: string | null = null;
  hallId: string;

  commentType = CommentType;

  transaction: AuditTransaction | null = null;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private auditTransactionService: AuditTransactionsService,
    public lang: LanguageService,
  ) {
    this.id = this.route.snapshot.paramMap.get('id');
    this.source = this.route.snapshot.queryParamMap.get('source') as Source;
    this.hallId = String(this.route.snapshot.queryParamMap.get('hallId'));
  }

  ngOnInit(): void {
    if (this.id) {
      this.auditTransactionService
        .getTransactionById({
          sourceId: this.id,
          source: this.source,
          hallId: this.hallId,
        })
        .subscribe((data) => {
          this.transaction = data;
        });
    }
  }

  goBack(): void {
    this.location.back();
  }
}
