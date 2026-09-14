import { redirect } from 'next/navigation';
import { loadCurrentUser } from '@/lib/auth';
import { MyContentPanel } from './content-panel';

export default async function ContributionsPage({ searchParams }: { searchParams: Promise<{ search?: string; categoryId?: string; status?: string }> }) {
  const user = await loadCurrentUser();
  if (!user) redirect('/login');
  return <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-8 md:py-10"><MyContentPanel filters={await searchParams} /></main>;
}
