import { redirect } from 'next/navigation';
import { Bell } from 'lucide-react';
import { authenticatedApiHeaders, loadCurrentUser } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WorkspacePageHero } from '@/components/workspace/workspace-page-hero';
import { markAllNotificationsReadAction, markNotificationReadAction } from './actions';

type Notification = { id: string; title: string; message: string; type: string; readAt: string | null; createdAt: string };

export default async function NotificationsPage() {
  const user = await loadCurrentUser();
  if (!user) redirect('/login');
  const notifications = await serverApiFetch<{ items: Notification[]; unreadCount: number }>('/api/notifications', { headers: await authenticatedApiHeaders() });
  return <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-8 md:py-10"><WorkspacePageHero description={notifications.unreadCount ? `${notifications.unreadCount} 条未读审核通知需要处理。` : '所有审核、分配与决定的提醒都会在这里留痕。'} eyebrow="NOTIFICATIONS" metric={{ value: notifications.unreadCount, label: '未读通知' }} title="把需要处理的协作信号留在同一个队列。">{notifications.unreadCount ? <form action={markAllNotificationsReadAction}><Button className="border-white/[.16] bg-white/[.06] text-white hover:bg-white/[.12] hover:text-white" size="sm" type="submit" variant="outline">全部标记已读</Button></form> : null}</WorkspacePageHero>{notifications.items.length ? <div className="mt-5 grid gap-3">{notifications.items.map((notification) => <Card className={`py-4 shadow-none ${notification.readAt ? 'border border-white/[.1] bg-[#111112]' : 'border border-white/[.22] bg-white/[.055]'}`} key={notification.id}><CardHeader className="flex-row items-center gap-3"><span className={`grid size-8 place-items-center rounded-full ${notification.readAt ? 'bg-white/8 text-white/55' : 'bg-white text-black'}`}><Bell className="size-4" /></span><div><CardTitle className="text-sm text-white">{notification.title}</CardTitle><p className="mt-1 text-xs text-white/40">{new Date(notification.createdAt).toLocaleString('zh-CN')}</p></div>{!notification.readAt ? <form action={markNotificationReadAction} className="ml-auto"><input name="notificationId" type="hidden" value={notification.id} /><Button type="submit" size="sm" variant="ghost" className="text-white/65 hover:bg-white/10 hover:text-white">标记已读</Button></form> : null}</CardHeader><CardContent className="pl-[4.5rem] text-sm leading-6 text-white/60">{notification.message}</CardContent></Card>)}</div> : <div className="mt-5 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-sm text-white/45">暂时没有通知。</div>}</main>;
}
