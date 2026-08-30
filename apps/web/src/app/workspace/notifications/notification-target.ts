export type NotificationTargetInput = {
  type: string;
  relatedReview: {
    id: string;
    content: { id: string };
  } | null;
};

export function notificationTarget(notification: NotificationTargetInput) {
  if (notification.type === 'review_submitted' || notification.type === 'review_assigned') {
    return '/workspace/reviews';
  }
  if (notification.type === 'review_changes_requested') {
    return notification.relatedReview?.content.id
      ? `/workspace/submit/${encodeURIComponent(notification.relatedReview.content.id)}`
      : '/workspace/submissions';
  }
  if (notification.type === 'review_approved') return '/workspace/submissions';
  return null;
}
