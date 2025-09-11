import {AccountData, AccountNode} from '@accounts/models/accounts';

export const flattenTree = (tree: AccountNode[]): AccountData[] => {
  const flat: any[] = [];

  function recurse(nodes: AccountNode[]) {
    for (const node of nodes) {
      flat.push(node.data);
      if (node.children && node.children.length > 0) {
        recurse(node.children);
      }
    }
  }

  recurse(tree);
  return flat;
};
