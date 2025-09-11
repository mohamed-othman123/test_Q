import {AccountData} from '@accounts/models/accounts';

const getMaxChildCode = (val: AccountData): number => {
  const childrenCodes =
    val?.children?.map((c) => +c.accountCode || +c.data?.accountCode!) || [];
  return Math.max(...childrenCodes);
};

export const generateAccountCode = (val: AccountData): string => {
  const hasChildren = !!val?.children?.length;
  if (val?.accountLevel === 2) {
    if (!hasChildren) {
      return (+val.accountCode + 1).toString();
    }
    const maxCode = getMaxChildCode(val);
    return (maxCode + 1).toString();
  } else if (val?.accountLevel! > 2) {
    if (!hasChildren) {
      return val.accountCode + '001';
    }
    const maxCode = getMaxChildCode(val);
    return (maxCode + 1).toString();
  }
  return '';
};
