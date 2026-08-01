export type ReviewFilter = 'mine' | 'pending' | 'handled' | 'overdue';

export function reviewCardPermissions({
  assignedReviewerId,
  canAssign,
  currentUserId,
  filter,
  status,
}: {
  assignedReviewerId: string | null;
  canAssign: boolean;
  currentUserId: string;
  filter: ReviewFilter;
  status: string;
}) {
  const pending = status === 'PENDING';
  return {
    canAssign: canAssign && filter === 'pending' && pending,
    canProcess:
      filter === 'mine' && pending && assignedReviewerId === currentUserId,
  };
}
