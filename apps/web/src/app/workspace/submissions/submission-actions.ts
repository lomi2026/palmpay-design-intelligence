export function submissionRevisionHref(
  submission: { status: string; content: { id: string } },
  canEdit: boolean,
) {
  if (!canEdit || submission.status !== 'CHANGES_REQUESTED') return null;
  return `/workspace/submit/${encodeURIComponent(submission.content.id)}`;
}
