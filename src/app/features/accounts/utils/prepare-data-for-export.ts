import {ACCOUNT_TYPES} from '@accounts/constants/accounts';
import {AccountNode} from '@accounts/models/accounts';
import {Item} from '@core/models';

export const prepareDataForExport = (
  data: AccountNode[],
  language: string,
): any[] => {
  const flatList: any[] = [];

  const traverse = (node: AccountNode, parent: string) => {
    let row: any;

    if (language === 'en') {
      row = {
        'Name': node.data.name,
        'Account Code': node.data.accountCode,
        'Account Type': ACCOUNT_TYPES.find(
          (type: Item) => type.value === node.data.accountType,
        )?.label.en,
        Level: node.data.accountLevel,
        Parent: parent,
        'Debit': node.data.totalDebit,
        'Credit': node.data.totalCredit,
      };
    } else {
      row = {
        'الاسم': node.data.name_ar,
        'الكود': node.data.accountCode,
        'النوع': ACCOUNT_TYPES.find(
          (type: Item) => type.value === node.data.accountType,
        )?.label.ar,
        'المستوي': node.data.accountLevel,
        'الحساب الرئسي': parent,
        'مدين': node.data.totalDebit,
        'دائن': node.data.totalCredit,
      };
    }

    flatList.push(row);

    if (node.children && node.children.length > 0) {
      const parentName = language === 'en' ? node.data.name : node.data.name_ar;

      node.children.forEach((child) => traverse(child, parentName));
    }
  };

  const parent = language === 'en' ? 'Root' : 'رئيسي';

  data.forEach((node) => traverse(node, parent));

  return flatList;
};
