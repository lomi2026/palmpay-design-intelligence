import { PublishedContentDetail } from '@/components/workspace/published-content-detail';
export default async function Page({params}:{params:Promise<{slug:string}>}) { const {slug}=await params; return <PublishedContentDetail slug={slug} type="AI_CASE" route="ai-cases"/>; }
