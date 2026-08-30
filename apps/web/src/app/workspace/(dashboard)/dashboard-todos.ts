export type DashboardSubmission = {
  id: string;
  status: string;
  submittedAt: string;
  content: { id: string; title: string; contentType: string };
  version: { title: string };
};

export type DashboardReview = {
  id: string;
  status: string;
  submittedAt: string;
  content: { id: string; title: string; contentType: string };
  version: { title: string };
  assignedReviewer: { id: string } | null;
};

export type DashboardTodo = {
  id: string;
  href: string;
  title: string;
  contentType: string;
  submittedAt: string;
  label: '按意见修改' | '待我审核' | '待分配';
  priority: number;
};

export function buildDashboardTodos({
  userId,
  submissions,
  reviewQueue,
  canSubmit,
  canReview,
  canAssign,
  limit = 3,
}: {
  userId: string;
  submissions: DashboardSubmission[];
  reviewQueue: DashboardReview[];
  canSubmit: boolean;
  canReview: boolean;
  canAssign: boolean;
  limit?: number;
}) {
  const todos: DashboardTodo[] = [];

  if (canSubmit) {
    for (const submission of submissions) {
      if (submission.status !== 'CHANGES_REQUESTED') continue;
      todos.push({
        id: submission.id,
        href: `/workspace/submit/${encodeURIComponent(submission.content.id)}`,
        title: submission.version.title || submission.content.title,
        contentType: submission.content.contentType,
        submittedAt: submission.submittedAt,
        label: '按意见修改',
        priority: 0,
      });
    }
  }

  for (const review of reviewQueue) {
    if (review.status !== 'PENDING') continue;
    if (canReview && review.assignedReviewer?.id === userId) {
      todos.push({
        id: review.id,
        href: '/workspace/reviews',
        title: review.version.title || review.content.title,
        contentType: review.content.contentType,
        submittedAt: review.submittedAt,
        label: '待我审核',
        priority: 1,
      });
    } else if (canAssign && !review.assignedReviewer) {
      todos.push({
        id: review.id,
        href: '/workspace/reviews',
        title: review.version.title || review.content.title,
        contentType: review.content.contentType,
        submittedAt: review.submittedAt,
        label: '待分配',
        priority: 2,
      });
    }
  }

  const unique = new Map<string, DashboardTodo>();
  for (const todo of todos) {
    const current = unique.get(todo.id);
    if (!current || todo.priority < current.priority) unique.set(todo.id, todo);
  }

  return [...unique.values()]
    .sort((left, right) =>
      left.priority - right.priority ||
      Date.parse(right.submittedAt) - Date.parse(left.submittedAt) ||
      left.id.localeCompare(right.id),
    )
    .slice(0, limit);
}
