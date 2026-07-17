import { redirect } from 'next/navigation';
import { Bell } from 'lucide-react';
import { authenticatedApiHeaders, loadCurrentUser } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { markAllNotificationsReadAction, markNotificationReadAction } from './actions';

type Notification = { id: string; title: string; message: string; type: string; readAt: string | null; createdAt: string };

export default async function NotificationsPage() {
  const user = await loadCurrentUser();
  if (!user) redirect('/login');
  const notifications = await serverApiFetch<{ items: Notification[]; unreadCount: number }>('/api/notifications', { headers: await authenticatedApiHeaders() });
  return <main className="px-5 py-8 md:px-8 md:py-10"><header className="border-b border-white/10 pb-7"><p className="text-xs tracking-[0.18em] text-violet-200/75">NOTIFICATIONS</p><div className="mt-2 flex flex-wrap items-center gap-3"><h1 className="text-3xl font-semibold tracking-[-0.045em] text-white">通知</h1>{notifications.unreadCount ? <Badge className="bg-violet-200 text-violet-950">{notifications.unreadCount} 未读</Badge> : null}<form action={markAllNotificationsReadAction} className="ml-auto">{notifications.unreadCount ? <Button type="submit" size="sm" variant="outline" className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white">全部标记已读</Button> : null}</form></div><p className="mt-2 text-sm text-white/55">{notifications.unreadCount ? `${notifications.unreadCount} 条未读审核通知` : '没有未读通知'}</p></header>{notifications.items.length ? <div className="mt-6 grid gap-3">{notifications.items.map((notification) => <Card className={`py-4 shadow-none ${notification.readAt ? 'border border-white/10 bg-white/[0.025]' : 'border border-violet-200/25 bg-violet-200/[0.06]'}`} key={notification.id}><CardHeader className="flex-row items-center gap-3"><span className={`grid size-8 place-items-center rounded-full ${notification.readAt ? 'bg-white/8 text-white/55' : 'bg-violet-200 text-violet-950'}`}><Bell className="size-4" /></span><div><CardTitle className="text-sm text-white">{notification.title}</CardTitle><p className="mt-1 text-xs text-white/40">{new Date(notification.createdAt).toLocaleString('zh-CN')}</p></div>{!notification.readAt ? <form action={markNotificationReadAction} className="ml-auto"><input name="notificationId" type="hidden" value={notification.id} /><Button type="submit" size="sm" variant="ghost" className="text-white/65 hover:bg-white/10 hover:text-white">标记已读</Button></form> : null}</CardHeader><CardContent className="pl-[4.5rem] text-sm leading-6 text-white/60">{notification.message}</CardContent></Card>)}</div> : <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-sm text-white/45">暂时没有通知。</div>}</main>;
}
