import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpenCheck,
  ClipboardCheck,
  Copy,
  Flame,
  Gauge,
  MousePointer2,
  RefreshCw,
  Search,
  Send,
  Upload,
  UsersRound,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const metrics = [
  [RefreshCw, '+21%', '86', '本月有效复用', '被项目采用'],
  [UsersRound, '+8', '38', '活跃使用成员', '近 30 天'],
  [Flame, '+28%', '186', 'AI 任务完成', 'Skill 复制/运行'],
  [BookOpenCheck, '60%', '24', '已验证内容', '占全部内容'],
] as const;

const updates = [
  ['Web 数据表格组件规范', '组件与模式 · Design System', '已验证', '07-08'],
  ['金额输入与货币格式规范', '组件与模式 · Payments UX', '正式发布', '07-06'],
  ['交易列表页面模板', '页面模板 · Merchant UX', '正式发布', '07-05'],
  ['移动端交易详情模板', '页面模板 · Mobile UX', '试运行', '07-02'],
  ['表单校验与错误反馈规范', '设计系统 · Design System', '已验证', '06-29'],
] as const;

const todos = [
  ['移动端交易列表适配规范', '设计资产 · 07-09', '审核中'],
  ['AI辅助竞品分析 Skill', 'AI Skill · 07-08', '待修改'],
  ['UI还原度验收实践案例', 'AI 案例 · 07-07', '审核中'],
] as const;

const journeySteps = [
  [Search, '发现', '搜索与推荐'],
  [MousePointer2, '使用', '复制与引用'],
  [Upload, '贡献', '提交与审核'],
  [Gauge, '衡量', '行为与价值'],
] as const;

export default function WorkspacePage() {
  return (
    <main id="root" className="v9-source-home mx-auto min-h-[calc(100vh-4rem)] w-full max-w-[1440px] bg-[#090909] px-4 pb-16 pt-6 text-[#f4f4f5] sm:px-6 lg:px-8">
      <section className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-.025em] sm:text-[30px]">工作台</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-white/50">查看最近使用、团队更新、贡献与待办。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="h-9 border-white/[.14] bg-transparent px-4 text-white hover:bg-white/[.07] hover:text-white">
            <Gauge className="size-4" /> 价值总览
          </Button>
          <Button asChild className="h-9 bg-[#f4f4f4] px-4 font-bold !text-[#090909] hover:bg-white">
            <Link href="/workspace/submit"><Send className="size-4" /> 提交内容</Link>
          </Button>
        </div>
      </section>

      <section className="hero-panel mb-5 overflow-hidden rounded-2xl border border-white/[.14] bg-[radial-gradient(circle_at_82%_45%,rgba(255,255,255,.035),transparent_22%),#0d0d0e]">
        <div className="relative grid min-h-[300px] gap-8 p-6 sm:p-8 lg:grid-cols-[1.05fr_.95fr] lg:p-10">
          <div className="relative z-10 flex flex-col justify-center">
            <div className="mb-5 flex items-center gap-3">
              <Image src="/v9-1/assets/nav-logo-20260710.png" alt="PalmPay Design" width={36} height={36} className="size-9 object-contain" />
              <p className="text-[13px] font-semibold leading-4">PalmPay Design<br /><span className="text-[10px] font-medium uppercase tracking-[.18em] text-white/55">Intelligence Hub</span></p>
              <Badge variant="outline" className="border-white/[.12] bg-white/[.04] text-white/75">Beta 1.0</Badge>
            </div>
            <h2 className="max-w-3xl text-3xl font-semibold leading-[1.12] tracking-[-.045em] sm:text-5xl">把团队经验，转化为可复用、可验证的设计能力。</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">设计资产、AI Skill 与实践案例不再分散在个人文件中，而是通过发现、使用、贡献与衡量形成持续增长的团队能力。</p>
            <div className="mt-7 flex flex-wrap gap-2">
              <Button asChild size="lg" className="h-10 bg-[#f4f4f4] px-5 font-bold !text-[#090909] hover:bg-white"><Link href="/workspace/design-assets">进入资产库 <ArrowRight className="size-4" /></Link></Button>
              <Button size="lg" variant="outline" className="h-10 border-white/[.14] bg-transparent px-4 text-white hover:bg-white/[.07] hover:text-white">查看价值证据</Button>
            </div>
          </div>
          <div className="relative hidden min-h-[260px] items-center justify-center lg:flex lg:-translate-x-6">
            <div className="relative grid size-[250px] grid-cols-2 gap-3 rounded-[34px] border border-white/[.18] bg-white/[.025] p-4 shadow-2xl">
              {journeySteps.map(([Icon, title, body], index) => <div key={title} className={`flex flex-col justify-between rounded-2xl border border-white/[.12] bg-white/[.025] p-4 ${index === 0 ? 'translate-x-2 -translate-y-2' : ''} ${index === 3 ? '-translate-x-2 translate-y-2' : ''}`}><Icon className="size-5 text-white/85" /><div><strong className="block text-sm font-semibold">{title}</strong><p className="mt-1 text-[11px] text-white/45">{body}</p></div></div>)}
              <div className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border border-white/[.18] bg-[#090909] shadow-2xl"><Image src="/v9-1/assets/nav-logo-20260710.png" alt="" width={44} height={44} className="size-11 object-contain" /></div>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-2 flex items-center justify-between"><span className="text-xs text-white/45">Beta 录入数据 · 更新于 2026.07.11</span><Button variant="ghost" size="sm" className="text-white/75 hover:bg-white/[.07] hover:text-white">查看数据口径 <ArrowRight className="size-3" /></Button></div>
      <section className="mt-1.5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([Icon, growth, value, label, detail]) => (
          <Card key={label} className="min-h-48 rounded-2xl border-white/[.12] bg-[#111112] py-0 shadow-none">
            <CardContent className="relative p-5"><span className="grid size-9 place-items-center rounded-xl bg-white/[.06] text-white/80"><Icon className="size-4" /></span><span className="absolute right-5 top-6 text-[12px] font-semibold text-white">{growth}</span><strong className="mt-7 block text-[36px] tracking-[-.06em]">{value}</strong><p className="mt-1 text-[14px] font-semibold">{label}</p><p className="mt-1 text-[12px] text-white/45">{detail}</p></CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,.8fr)]">
        <Card className="rounded-2xl border-white/[.12] bg-[#111112] py-0 shadow-none"><CardContent className="p-5"><div className="flex items-start justify-between"><div><h3 className="text-[18px] font-bold">最近更新</h3><p className="mt-1 text-[12px] text-white/45">经过审核的设计资产与能力内容</p></div><Button variant="outline" size="sm" className="border-white/[.12] bg-transparent text-white hover:bg-white/[.07] hover:text-white">查看全部</Button></div><div className="mt-5 divide-y divide-white/[.08]">{updates.map(([title, meta, state, date]) => <Link href="/workspace/design-assets" className="flex items-center gap-4 py-4 transition hover:bg-white/[.025]" key={title}><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/[.06]"><Copy className="size-4 text-white/65" /></span><span className="min-w-0 flex-1"><strong className="block truncate text-[13px]">{title}</strong><span className="mt-1 block truncate text-[11px] text-white/45">{meta}</span></span><Badge variant="outline" className="hidden border-white/[.12] bg-white/[.03] text-[10px] text-white/70 sm:inline-flex">{state}</Badge><time className="text-[11px] text-white/40">{date}</time></Link>)}</div></CardContent></Card>
        <Card className="rounded-2xl border-white/[.12] bg-[#111112] py-0 shadow-none"><CardContent className="p-5"><h3 className="text-[18px] font-bold">我的待办</h3><p className="mt-1 text-[12px] text-white/45">贡献、修改与审核相关事项</p><div className="mt-5 space-y-3">{todos.map(([title, meta, state]) => <div className="rounded-xl border border-white/[.1] bg-white/[.025] p-3.5" key={title}><strong className="block text-[13px]">{title}</strong><span className="mt-2 block text-[11px] text-white/45">{meta}</span><Badge variant="outline" className="mt-3 border-white/[.12] text-[10px] text-white/75">{state}</Badge></div>)}</div><Button asChild variant="outline" className="mt-4 w-full border-white/[.12] bg-transparent text-white hover:bg-white/[.07] hover:text-white"><Link href="/workspace/reviews"><ClipboardCheck className="size-4" /> 打开审核中心</Link></Button></CardContent></Card>
      </section>
    </main>
  );
}
