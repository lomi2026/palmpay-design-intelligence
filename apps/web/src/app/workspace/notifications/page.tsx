import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Bell } from 'lucide-react';

import { authenticatedApiHeaders, loadCurrentUser } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkspacePageHero } from '@/components/workspace/workspace-page-hero';
import { WorkspaceEmptyState } from '@/components/workspace/workspace-empty-state';
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
  openNotificationAction,
} from './actions';
import { notificationTarget } from './notification-target';

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
  relatedReview: { id: string; content: { id: string } } | null;
};

export default async function NotificationsPage() {
  const user = await loadCurrentUser();
  if (!user) redirect('/login');
  const notifications = await serverApiFetch<{ items: Notification[]; unreadCount: number }>(
    '/api/notifications',
    { headers: await authenticatedApiHeaders() },
  );

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-8 md:py-10">
      <WorkspacePageHero
        description={notifications.unreadCount
          ? `${notifications.unreadCount} 条未读审核通知需要处理。`
          : '所有审核、分配与决定的提醒都会在这里留痕。'}
        eyebrow="NOTIFICATIONS"
        metric={{ value: notifications.unreadCount, label: '未读通知' }}
        title="把需要处理的协作信号留在同一个队列。"
      >
        {notifications.unreadCount ? (
          <form action={markAllNotificationsReadAction}>
            <Button
              className="border-white/[.16] bg-white/[.06] text-white hover:bg-white/[.12] hover:text-white"
              size="sm"
              type="submit"
              variant="outline"
            >
              全部标记已读
            </Button>
          </form>
        ) : null}
      </WorkspacePageHero>

      {notifications.items.length ? (
        <div className="mt-5 grid gap-3">
          {notifications.items.map((notification) => {
            const target = notificationTarget(notification);
            return (
              <Card
                className={`relative py-4 shadow-none transition ${target ? 'hover:border-[var(--v9-line-strong)] hover:bg-[var(--v9-panel-2)]' : ''} ${notification.readAt ? 'border border-[var(--v9-line)] bg-[var(--v9-panel)]' : 'border border-[var(--v9-status-info-line)] bg-[var(--v9-status-info-bg)]'}`}
                key={notification.id}
              >
                <CardHeader className="flex flex-row items-center gap-3">
                  <span className={`grid size-8 place-items-center rounded-full ${notification.readAt ? 'bg-[var(--v9-soft)] text-[var(--v9-muted)]' : 'bg-[var(--v9-status-info-bg)] text-[var(--v9-status-info-text)] ring-1 ring-[var(--v9-status-info-line)]'}`}>
                    <Bell className="size-4" />
                  </span>
                  <div>
                    <CardTitle className="text-sm text-white">{notification.title}</CardTitle>
                    <p className="mt-1 text-xs text-white/40">
                      {new Date(notification.createdAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                  {!notification.readAt ? (
                    <form action={markNotificationReadAction} className="relative z-20 ml-auto">
                      <input name="notificationId" type="hidden" value={notification.id} />
                      <Button
                        type="submit"
                        size="sm"
                        variant="ghost"
                        className="text-white/65 hover:bg-white/10 hover:text-white"
                      >
                        标记已读
                      </Button>
                    </form>
                  ) : null}
                </CardHeader>
                <CardContent className="pl-[3.75rem] text-sm leading-6 text-white/60">
                  {notification.message}
                </CardContent>
                {target ? notification.readAt ? (
                  <Link
                    aria-label={`打开通知：${notification.title}`}
                    className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/55"
                    href={target}
                  >
                    <span className="sr-only">打开对应内容</span>
                  </Link>
                ) : (
                  <form action={openNotificationAction} className="absolute inset-0 z-10">
                    <input name="notificationId" type="hidden" value={notification.id} />
                    <input name="target" type="hidden" value={target} />
                    <button
                      aria-label={`打开并标记已读：${notification.title}`}
                      className="absolute inset-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/55"
                      type="submit"
                    >
                      <span className="sr-only">打开对应内容并标记已读</span>
                    </button>
                  </form>
                ) : null}
              </Card>
            );
          })}
        </div>
      ) : (
        <WorkspaceEmptyState className="mt-5">暂时没有通知。</WorkspaceEmptyState>
      )}
    </main>
  );
}
