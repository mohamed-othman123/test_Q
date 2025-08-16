import {RefundStatus} from '@refund-requests/models/refund-request.model';

export const RefundStatusTypes = [
  {
    value: RefundStatus.NEW,
    label: {ar: 'جديد', en: 'New'},
  },
  {
    value: RefundStatus.IN_PROGRESS,
    label: {ar: 'قيد المراجعة', en: 'In Progress'},
  },
  {value: RefundStatus.COMPLETED, label: {ar: 'تم الإكتمال', en: 'Completed'}},
  {
    value: RefundStatus.REJECTED,
    label: {ar: 'مرفوض', en: 'Rejected'},
  },
];
