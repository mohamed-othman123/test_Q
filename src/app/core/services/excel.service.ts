import {Injectable} from '@angular/core';
import * as XLSX from 'xlsx';

export interface ExcelExportOptions {
  rtl?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ExcelService {
  constructor() {}

  exportAsExcelFile(
    json: any[],
    excelFileName: string,
    options: ExcelExportOptions,
  ): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);

    const workbook: XLSX.WorkBook = {
      Workbook: {Views: [{RTL: options.rtl ? true : false}]},
      Sheets: {},
      SheetNames: [],
    };

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    XLSX.writeFile(workbook, `${excelFileName}.xlsx`, {compression: true});
  }
}
