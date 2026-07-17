import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Blocks,
  ChevronRight,
  LayoutTemplate,
  Moon,
  Search,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const capabilities = [
  {
    icon: LayoutTemplate,
    title: '结构化展示',
    body: '从能力介绍到具体资产、精选案例、团队分工，页面按真实使用路径组织，不需要来回跳转就能找到想要的内容。',
    tags: ['Hero First', 'Clear Sections', 'SaaS Flow'],
  },
  {
    icon: Blocks,
    title: '统一卡片系统',
    body: '无论是组件规范、AI 工作流还是页面模板，都遵循同一套视觉语言，跨团队浏览和复用时不需要重新适应风格差异。',
    tags: ['Dark UI', 'Soft Glow', 'Rounded System'],
  },
  {
    icon: ArrowRight,
    title: '业务价值表达',
    body: '重点不再只是“这个资产是什么”，而是“它带来了什么价值”——每一份资产都关联具体的应用场景、复用路径和实际效果。',
    tags: ['Impact', 'Adoption', 'Reuse'],
  },
];

const assets = [
  {
    index: '01',
    title: 'AI 设计组件规范',
    description: '复杂列表、筛选体系、批量操作、空状态治理',
    category: '组件资产',
    palette: 'from-cyan-300/25 via-slate-800 to-violet-400/20',
  },
  {
    index: '02',
    title: 'AI SKILL 工具包',
    description: '输入材料、分析维度、输出结构、设计判断',
    category: 'AI 工作流',
    palette: 'from-violet-400/25 via-slate-900 to-cyan-300/15',
  },
  {
    index: '03',
    title: '业务看板页面模板',
    description: '经营分析、价值汇报、项目状态与指标叙事',
    category: '页面模板',
    palette: 'from-cyan-300/20 via-slate-900 to-white/15',
  },
  {
    index: '04',
    title: '设计交付检查清单',
    description: '状态覆盖、交互说明、验收口径、走查标准',
    category: '交付规范',
    palette: 'from-violet-400/25 via-slate-950 to-cyan-300/15',
  },
];

const collections = [
  ['设计系统套件', '组件、模式、规范与高频后台场景治理。', '42 个资产'],
  ['AI 指令库', '可复用的 Prompt、输入约束和产出模板。', '28 条指令'],
  ['业务看板模板', '面向经营分析、项目状态和指标叙事的页面资产。', '18 个模板'],
  ['项目案例沉淀', '将一次优秀交付固化成团队下次可直接调用的方法。', '16 个案例'],
];

const teams = [
  ['DS', '组件治理 / 体验一致性', '设计系统小组', '负责组件资产、模式一致性和跨业务设计标准沉淀。', '42 项资产', '72% 复用'],
  ['AI', 'Prompt / AI 工作流', 'AI 设计小组', '将实验性的 AI 设计产出沉淀为可规模化复用的方法包。', '36 项产出', '节省 240h'],
  ['OP', '质量标准 / 交付流程', '设计运营小组', '维护交付检查、评审节奏和资产归档规范，保证平台持续可用。', '18 项规范', '归类 86%'],
];

function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <header className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
      <Badge variant="outline" className="border-white/15 bg-white/5 px-3 text-[11px] tracking-[0.16em] text-violet-200">
        {eyebrow}
      </Badge>
      <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-white md:text-5xl">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-white/60 md:text-base">{body}</p>
    </header>
  );
}

export function V9Home() {
  return (
    <main className="v9-source-home overflow-hidden bg-[#090909] text-[#f4f4f5]">
      <header className="sticky top-0 z-30 h-[72px] border-b border-white/[0.08] bg-[#090909]/[.82] backdrop-blur-xl">
        <div className="flex h-full items-center gap-8 px-6">
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="返回首页">
            <Image src="/v9-1/assets/nav-logo-20260710.png" alt="PalmPay Design Intelligence Hub" className="size-7 object-contain" height={28} width={28} priority />
            <span className="leading-[1.05] text-[13px] font-semibold tracking-[-.02em]">PalmPay Design<br /><span className="text-[9px] font-medium tracking-[.18em] text-white/60">INTELLIGENCE HUB</span></span>
          </Link>
          <nav className="hidden h-full items-center gap-1 text-[13px] text-white/55 lg:flex" aria-label="主导航">
            <a className="rounded-lg bg-white/[.08] px-3 py-2 font-medium text-white" href="#home">首页</a>
            <a className="rounded-lg px-3 py-2 hover:bg-white/[.06] hover:text-white" href="#assets">设计资产</a>
            <a className="rounded-lg px-3 py-2 hover:bg-white/[.06] hover:text-white" href="#skills">AI Skill</a>
            <Link className="rounded-lg px-3 py-2 hover:bg-white/[.06] hover:text-white" href="/workspace/ai-projects">探索项目</Link>
            <a className="rounded-lg px-3 py-2 hover:bg-white/[.06] hover:text-white" href="#cases">AI 案例</a>
            <a className="rounded-lg px-3 py-2 hover:bg-white/[.06] hover:text-white" href="#impact">业务影响</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden h-10 w-[150px] justify-start rounded-[10px] border-white/[.1] bg-white/[.035] px-3 text-[12px] font-normal text-white/45 hover:bg-white/[.08] hover:text-white md:inline-flex">
              <Search className="size-3.5" /> 搜索资产、Skill 或… <kbd className="ml-auto rounded border border-white/[.1] px-1.5 text-[10px]">⌘K</kbd>
            </Button>
            <Button variant="outline" size="icon-sm" aria-label="切换明暗主题" className="size-10 rounded-[10px] border-white/[.1] bg-white/[.035] text-white hover:bg-white/[.08] hover:text-white"><Moon className="size-4" /></Button>
            <Button asChild size="sm" className="h-10 rounded-[10px] bg-[#f4f4f4] px-5 text-[13px] font-bold !text-[#090909] hover:bg-white">
              <Link href="/workspace">进入工作台 <ArrowRight className="size-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      <section id="home" className="relative min-h-[648px] overflow-hidden border-b border-white/[.06] px-6 py-16 lg:px-6">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:64px_64px] opacity-80" />
        <div className="relative mx-auto grid max-w-[1232px] items-center gap-[76px] pt-[62px] lg:grid-cols-[510px_minmax(0,1fr)]">
          <div className="relative z-10 lg:pt-3">
            <p className="mb-7 text-[11px] font-semibold uppercase tracking-[.24em] text-white/60 before:mr-3 before:inline-block before:h-px before:w-6 before:bg-white/45 before:align-middle before:content-['']">Internal Beta · Updated July 2026</p>
            <h1 className="max-w-[510px] text-[48px] font-[670] leading-[1.1] tracking-[-.06em] text-[#f4f4f5] lg:text-[64px]">让设计资产被复用<br />让设计价值被衡量</h1>
            <p className="mt-4 max-w-[510px] text-[17px] leading-[1.72] text-[#d0d0d4]">汇聚设计资产、AI Skill 与经过验证的实践案例，让团队成员可以更快发现、调用、贡献并衡量设计能力。</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="h-10 rounded-[10px] bg-[#f4f4f4] px-[18px] text-[13px] font-bold !text-[#090909] hover:bg-white"><a href="#assets">浏览设计资产 <ArrowRight className="size-4" /></a></Button>
              <Button variant="outline" className="h-10 rounded-[10px] border-white/[.12] bg-white/[.035] px-[18px] text-[13px] font-bold text-white hover:bg-white/[.08] hover:text-white"><Search className="size-4" /> 搜索团队能力</Button>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-white/45"><span className="rounded-full border border-white/[.08] bg-white/[.04] px-2.5 py-1">● 内部试运行</span><span>本页数据为原型演示数据</span><span>设计师判断 · AI 辅助执行</span></div>
          </div>
          <div className="relative hidden min-h-[520px] overflow-hidden rounded-[25px] border border-white/[.15] bg-[#0c0c0d] shadow-2xl shadow-black/40 lg:block" aria-label="平台工作台预览">
            <div className="flex h-12 items-center border-b border-white/[.1] px-4 text-[10px] uppercase tracking-[.2em] text-white/45"><span className="mr-5 flex gap-1"><i className="size-1.5 rounded-full bg-white/35" /><i className="size-1.5 rounded-full bg-white/35" /><i className="size-1.5 rounded-full bg-white/35" /></span>Design intelligence / workspace <span className="ml-auto normal-case tracking-normal">● Beta online</span></div>
            <div className="grid min-h-[468px] grid-cols-[142px_1fr]">
              <aside className="border-r border-white/[.1] p-4 text-[10px] text-white/45"><div className="mb-7 flex items-center gap-2 font-semibold text-white"><span className="grid size-6 place-items-center rounded-md bg-white text-black">P</span>PalmPay UX</div><p className="mb-3 text-[8px] uppercase tracking-[.16em]">Workspace</p>{['Overview','Design Assets','AI Skills','Cases','','Contributions','Impact'].map((label) => label ? <p className={`mb-1 rounded-md px-2 py-2 ${label === 'Overview' ? 'bg-white/[.1] text-white' : ''}`} key={label}>▢&nbsp;&nbsp;{label}</p> : <div className="h-5" key="gap" />)}</aside>
              <div className="p-5"><h2 className="text-[16px] font-bold">Design intelligence overview</h2><p className="mt-1 text-[10px] text-white/45">Team assets, methods and verified practices</p><div className="mt-4 flex h-8 items-center rounded-lg border border-white/[.1] px-3 text-[10px] text-white/45"><Search className="mr-2 size-3" />Search assets, skills or cases</div><div className="mt-3 grid grid-cols-3 gap-2">{['ASSETS|24|Published','AI SKILLS|12|Published','REUSE|86|Last 30 days'].map((item) => { const [label,value,meta] = item.split('|'); return <div key={label} className="rounded-xl border border-white/[.1] p-3"><p className="text-[8px] tracking-[.15em] text-white/45">{label}</p><strong className="mt-2 block text-[22px]">{value}</strong><em className="text-[8px] not-italic text-white/40">{meta}</em></div>; })}</div><div className="mt-4 text-[10px] font-semibold">Featured knowledge <span className="float-right text-white/40">View all →</span></div><div className="mt-2 grid grid-cols-2 gap-2">{['Web 数据表格组件规范','UI 视觉走查 Skill'].map((title, index) => <div className="rounded-xl border border-white/[.1] p-3" key={title}><p className="text-[8px] tracking-[.13em] text-white/45">{index ? 'AI SKILL' : 'DESIGN ASSET'}</p><strong className="mt-3 block text-[11px]">{title}</strong><p className="mt-1 text-[8px] text-white/40">统一复杂业务表格的布局、状态与交付标准。</p></div>)}</div><p className="mt-5 text-[10px] font-semibold">Reuse trend <span className="float-right text-white/40">Past 12 weeks</span></p><div className="mt-4 h-px bg-gradient-to-r from-white/10 via-white/80 to-white/10" /></div>
            <div className="absolute bottom-1 -right-5 w-60 rounded-2xl border border-white/[.16] bg-[#111113] p-4 shadow-2xl shadow-black/50"><p className="text-[8px] tracking-[.2em] text-white/45">VERIFIED CONTENT COVERAGE</p><strong className="mt-2 block text-[13px] leading-5">60% of published content verified</strong><div className="mt-3 h-1 rounded-full bg-white/[.09]"><div className="h-full w-3/5 rounded-full bg-[#f4f4f4]" /></div></div>
          </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1180px]">
          <SectionHeading eyebrow="Core Capabilities" title="平台核心设计理念" body="克制的深色界面、清晰的信息层级和统一的卡片系统，让每一份设计资产都以专业、可信的方式呈现，而不是零散的作品集拼贴。" />
          <div className="grid gap-4 md:grid-cols-3">
            {capabilities.map(({ icon: Icon, title, body, tags }) => (
              <Card key={title} className="border border-white/10 bg-white/[0.045] py-6 shadow-none backdrop-blur-sm">
                <CardHeader>
                  <span className="mb-3 grid size-10 place-items-center rounded-xl bg-violet-300/15 text-violet-200"><Icon className="size-5" /></span>
                  <CardTitle className="text-xl text-white">{title}</CardTitle>
                  <CardDescription className="leading-7 text-white/55">{body}</CardDescription>
                </CardHeader>
                <CardFooter className="mt-3 gap-2 border-0 bg-transparent px-6 pb-0 pt-0">
                  {tags.map((tag) => <Badge key={tag} variant="outline" className="border-white/10 bg-white/5 text-white/55">{tag}</Badge>)}
                </CardFooter>
              </Card>
            ))}
          </div>

          <Card className="mt-5 overflow-hidden border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(167,139,250,.22),transparent_32%),rgba(255,255,255,.045)] py-0 shadow-none">
            <CardContent className="p-6 md:p-10">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/50">
                <span className="tracking-[0.14em]">PLATFORM SNAPSHOT</span><span>上线 18 个月 · 持续迭代</span>
              </div>
              <h2 className="mt-7 max-w-2xl text-3xl font-semibold tracking-[-0.045em] text-white md:text-4xl">把分散的设计成果，变成统一表达的资产现场</h2>
              <div className="mt-10 grid grid-cols-2 gap-7 border-t border-white/10 pt-7 md:grid-cols-4">
                {['128|设计资产', '36|AI 案例', '72%|资产复用', '240h|近 3 个月节省工时'].map((metric) => {
                  const [value, label] = metric.split('|');
                  return <div key={label}><strong className="block text-3xl font-semibold tracking-[-0.05em] text-white md:text-4xl">{value}</strong><span className="mt-1 block text-sm text-white/55">{label}</span></div>;
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1180px]">
          <SectionHeading eyebrow="Latest Assets" title="可复用设计资产" body="每一个入选资产都经过场景、质量和复用价值筛选。这里不是文件列表，而是团队判断力的索引。" />
          <div className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
            <div className="space-y-3">
              {assets.map((asset, index) => (
                <Link key={asset.index} href="/workspace/design-assets" className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-white/25 hover:bg-white/[0.07] md:gap-6 md:p-5">
                  <span className="text-sm font-medium text-white/35">{asset.index}</span>
                  <span className="min-w-0 flex-1"><strong className="block truncate text-base text-white">{asset.title}</strong><span className="mt-1 block truncate text-sm text-white/50">{asset.description}</span></span>
                  <Badge variant="outline" className="hidden border-white/10 text-white/55 md:inline-flex">{asset.category}</Badge>
                  <ChevronRight className="size-4 text-white/40 transition group-hover:translate-x-0.5 group-hover:text-white" />
                </Link>
              ))}
            </div>
            <Card className={`min-h-72 border border-white/10 bg-gradient-to-br ${assets[0]?.palette ?? 'from-cyan-300/25 via-slate-800 to-violet-400/20'} py-0 shadow-none`}>
              <CardContent className="flex h-full min-h-72 flex-col justify-end p-6 md:p-8">
                <Badge variant="outline" className="mb-4 border-white/15 bg-black/15 text-white/70">组件资产 / 评分 9.1</Badge>
                <h3 className="text-2xl font-semibold text-white">数据表格组件规范</h3>
                <p className="mt-3 max-w-sm leading-7 text-white/70">来自设计系统小组。让高频后台场景拥有统一体验，减少重复设计和交付偏差。</p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-7 text-center"><Button asChild variant="outline" className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"><Link href="/workspace/design-assets">查看更多资产 <ArrowRight /></Link></Button></div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1180px]">
          <SectionHeading eyebrow="AI Highlights" title="AI 探索相关案例" body="精选不是展示 AI 会生成什么，而是展示设计团队如何判断、筛选、修正，并把 AI 产出转化成业务结果。" />
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ['效率提升', '营销活动视觉探索', '从 3 天首轮探索压缩到 4 小时。设计师定义参考图、筛选方向，并把有效路径沉淀为下一次活动可复用的方法。', '已沉淀为可复用工作流'],
              ['质量提升', '设计走查自动摘要', 'AI 先完成问题聚类，设计师再判断优先级。评审会从“逐条找错”转向“聚焦高风险体验决策”。', '评审问题归类准确率 86%'],
            ].map(([tag, title, body, note]) => (
              <Card key={title} className="border border-white/10 bg-white/[0.045] py-7 shadow-none">
                <CardHeader><Badge variant="outline" className="border-cyan-200/15 bg-cyan-200/5 text-cyan-100">{tag} · AI 精选</Badge><CardTitle className="mt-4 text-2xl text-white">{title}</CardTitle><CardDescription className="leading-7 text-white/60">{body}</CardDescription></CardHeader>
                <CardFooter className="mt-4 justify-between border-white/10 bg-transparent px-6 pt-4 text-sm text-white/50"><Link className="inline-flex items-center gap-1 text-white transition hover:text-violet-200" href="/workspace/ai-cases">查看案例 <ArrowRight className="size-4" /></Link><span>{note}</span></CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1180px]">
          <SectionHeading eyebrow="Collections" title="被策展的设计智能" body="集合按照业务场景策展，让非设计同事也能理解这些资产适合何时使用、如何复用。" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {collections.map(([title, body, meta]) => <Card key={title} className="border border-white/10 bg-white/[0.04] py-6 shadow-none"><CardHeader><Badge variant="outline" className="w-fit border-white/10 text-white/45">资产集合</Badge><CardTitle className="mt-3 text-lg text-white">{title}</CardTitle><CardDescription className="leading-7 text-white/55">{body}</CardDescription></CardHeader><CardFooter className="mt-auto justify-between border-white/10 bg-transparent px-6 pt-4 text-xs text-white/45"><span>{meta}</span><span>查看</span></CardFooter></Card>)}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1180px]">
          <SectionHeading eyebrow="Team Directory" title="设计资产创造者" body="每个资产背后都有负责人、维护机制和质量标准。平台展示的不只是成果，也是团队如何持续创造成果。" />
          <div className="grid gap-4 md:grid-cols-3">
            {teams.map(([initials, label, title, body, output, impact]) => <Card key={title} className="border border-white/10 bg-white/[0.04] py-6 shadow-none"><CardHeader><span className="mb-2 grid size-11 place-items-center rounded-full bg-gradient-to-br from-violet-300/70 to-cyan-200/50 text-xs font-semibold text-black">{initials}</span><Badge variant="outline" className="w-fit border-white/10 text-white/45">{label}</Badge><CardTitle className="mt-3 text-xl text-white">{title}</CardTitle><CardDescription className="leading-7 text-white/55">{body}</CardDescription></CardHeader><CardFooter className="mt-3 justify-between border-white/10 bg-transparent px-6 pt-4 text-sm text-white/50"><span>{output}</span><span>{impact}</span></CardFooter></Card>)}
          </div>
          <Card className="mt-4 border border-white/10 bg-white/[0.035] py-0 shadow-none"><CardContent className="p-0 text-sm"><div className="grid grid-cols-[1.25fr_1.55fr_.7fr_.7fr] gap-4 border-b border-white/10 px-5 py-4 text-xs font-medium text-white/40 md:px-7"><span>团队</span><span>职责</span><span>产出</span><span>影响</span></div>{teams.map(([, , title, , output, impact], index) => <div key={title} className="grid grid-cols-[1.25fr_1.55fr_.7fr_.7fr] gap-4 px-5 py-4 text-white/60 md:px-7"><strong className="font-medium text-white">{title}</strong><span>{['组件治理与体验一致性', 'Prompt 与 AI 工作流', '质量标准与交付流程'][index]}</span><span>{output}</span><span>{impact}</span></div>)}</CardContent></Card>
        </div>
      </section>

      <section className="px-5 pb-24 pt-8 md:px-10 md:pb-32">
        <Card className="mx-auto max-w-[1180px] border border-violet-200/15 bg-[radial-gradient(circle_at_top_left,rgba(167,139,250,.28),transparent_34%),linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.035))] py-0 shadow-none">
          <CardContent className="grid gap-8 p-7 md:grid-cols-2 md:p-12"><div><Badge variant="outline" className="border-white/15 bg-white/5 text-violet-100">Start creating</Badge><h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-white md:text-4xl">把一次优秀产出，变成下一次团队复用的起点</h2></div><div className="flex flex-col justify-end"><p className="leading-7 text-white/65">当一次项目产出被命名、归档、评选和复用，它就不再只是交付物，而会成为团队下一次创新的起点。</p><div className="mt-6 flex flex-wrap gap-3"><Button asChild className="bg-white text-black hover:bg-white/85"><Link href="/workspace/submit">提交资产 <ArrowRight /></Link></Button><Button asChild variant="outline" className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"><Link href="#home">回到顶部</Link></Button></div></div></CardContent>
        </Card>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-white/35">PalmPay UX Design · Design Intelligence Hub</footer>
    </main>
  );
}
