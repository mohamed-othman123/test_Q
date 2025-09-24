import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AccountData, AccountNode} from '@accounts/models/accounts';

import {AccountsService} from '@accounts/services/accounts.service';
import {flattenTree} from 'src/app/features/accounts/utils/flatten-tree';
import {LanguageService} from '@core/services';
import {TranslateService} from '@ngx-translate/core';
import {OrgChart} from 'd3-org-chart';
import {Subject, takeUntil} from 'rxjs';
import * as d3 from 'd3';
import {Location} from '@angular/common';

@Component({
  selector: 'app-view-accounts-tree',
  standalone: false,
  templateUrl: './view-accounts-tree.component.html',
  styleUrl: './view-accounts-tree.component.scss',
})
export class ViewAccountsTreeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  chart!: any;

  accountsList: AccountData[] = [];

  accountId: string | null = null;

  highlightNodeMap = new Map<number, boolean>();

  filters = {
    sortOrder: 'DESC',
    sortBy: 'accountCode',
  };

  compact = 0;

  private destroyed$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private accountsService: AccountsService,
    public lang: LanguageService,
    private translation: TranslateService,
    private location: Location,
  ) {
    this.accountId = this.route.snapshot.paramMap.get('id');
    translation.onLangChange.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.updateChart();
    });
  }

  ngAfterViewInit() {
    if (!this.chart) {
      this.chart = new OrgChart();
    }

    if (this.accountId) {
      this.getAccountsByParentId(+this.accountId!);
    } else {
      this.getAccountsList();
    }
  }

  // get all accounts and build tree
  getAccountsList() {
    this.accountsService
      .getAccountsTree(this.filters)
      .subscribe((res: AccountNode[]) => {
        const flatTree = flattenTree(res);
        this.accountsList = this.prepareTreeData(flatTree);
        this.updateChart();
      });
  }

  // get accounts by parent id and build tree
  getAccountsByParentId(parentId: number) {
    this.accountsService
      .getAccountsTree({...this.filters, parentAccountId: parentId})
      .subscribe((res: AccountNode[]) => {
        this.accountsList = flattenTree(res);

        //fix single node case
        if (this.accountsList.length === 1) {
          this.accountsList[0] = {...this.accountsList[0], parent: null};
        }
        // add root node if not present
        if (this.accountsList.length > 1) {
          const currentAccount = this.accountsList.find(
            (acc) => acc.id === parentId,
          );
          if (currentAccount) {
            currentAccount.parent = {id: null};
          }
        }

        this.updateChart();
      });
  }

  prepareTreeData(accountList: any[]) {
    const parentNode = {
      id: 1,
      name: 'Chart of Accounts',
      name_ar: 'شجرة الحسابات',
      accountCode: 0,
      parent: {id: null},
    };

    const treeData = accountList.map((acc) => {
      if (!acc.parent) {
        acc.parent = parentNode;
      }
      return acc;
    });
    treeData.push(parentNode);
    return treeData;
  }

  updateChart() {
    this.chart
      .nodeId((dataItem: any) => dataItem.id)
      .parentNodeId((dataItem: any) => dataItem.parent?.id)
      .nodeWidth(() => 180)
      .nodeHeight(() => 95)

      .nodeContent((node: any) => {
        return `
          <div 
            style="
              background-color: #1eaa8f;
              width: ${node.width}px;
              height: ${node.height}px;
              border-radius: 8px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              box-shadow: 0 1px 3px rgba(0,0,0,0.2);
              font-family: Zain, sans-serif;
              font-size: 14px;
              color: white;
            "
          >
            <div>
              ${
                node.data.accountCode === 0
                  ? ''
                  : this.lang.lang === 'ar'
                    ? this.translation.instant('chartOfAccounts.code') +
                      ' : ' +
                      node.data.accountCode
                    : this.translation.instant('chartOfAccounts.code') +
                      ' : ' +
                      node.data.accountCode
              }
            </div>
            <div
              style="
                background-color: #06977b;
                padding: 3px 5px;
                border-radius: 5px;
              "
            >
              ${this.lang.lang === 'ar' ? node.data.name_ar : node.data.name}
            </div>
            <div>
              ${
                node.data.accountCode === 0
                  ? ''
                  : this.translation.instant('chartOfAccounts.debit') +
                    ' : ' +
                    (node.data.totalDebit || 0)
              }
              ${
                node.data.accountCode === 0
                  ? ''
                  : ' | ' +
                    this.translation.instant('chartOfAccounts.credit') +
                    ' : ' +
                    (node.data.totalCredit || 0)
              }
            </div>
          </div>
        `;
      })
      .linkUpdate(function (
        this: SVGPathElement,
        d: any,
        i: number,
        arr: any[],
      ) {
        d3.select(this)
          .attr('stroke', (d: any) =>
            d.data._upToTheRootHighlighted ? 'orange' : '#1eaa8f',
          )
          .attr('stroke-width', (d: any) =>
            d.data._upToTheRootHighlighted ? 5 : 1,
          );
        if (d.data._upToTheRootHighlighted) {
          d3.select(this).raise();
        }
      })
      .container(this.chartContainer.nativeElement)
      .svgHeight(400)
      .data(this.accountsList)
      .onNodeClick((d: any) => this.highlightNodeToggle(d.data))
      .nodeUpdate(function (this: any, d: any, i: number, arr: any[]) {
        d3.select(this)
          .select('.node-rect')
          .attr('stroke', (d: any) =>
            d.data._highlighted || d.data._upToTheRootHighlighted
              ? 'orange'
              : 'none',
          )
          .attr(
            'stroke-width',
            d.data._highlighted || d.data._upToTheRootHighlighted ? 8 : 1,
          );
      })
      .compact(false)
      .render();
  }

  highlightNodeToggle(account: AccountData) {
    if (this.highlightNodeMap.get(account.id!)) {
      this.chart.clearHighlighting();
      this.highlightNodeMap.delete(account.id!);
      return;
    }
    this.highlightNodeMap.set(account.id!, true);

    this.chart.setUpToTheRootHighlighted(account.id).render().fit();
  }

  goBack() {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
