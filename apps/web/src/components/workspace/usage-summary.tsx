export function UsageSummary({
  summary,
}: {
  summary: { usageCount: number; projectReferences: number; favoriteCount: number };
}) {
  return (
    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/45">
      <span>有效使用 {summary.usageCount}</span>
      <span>项目引用 {summary.projectReferences}</span>
      <span>收藏 {summary.favoriteCount}</span>
    </div>
  );
}
