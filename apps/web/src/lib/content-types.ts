export interface ContentFile {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: string;
}

export interface PublishedAttachment {
  id: string;
  file: ContentFile;
}

export interface ContentCard {
  id: string;
  contentType: 'DESIGN_ASSET' | 'AI_SKILL' | 'AI_CASE' | 'AI_PROJECT';
  title: string;
  slug: string;
  summary: string | null;
  status: string;
  visibility: 'PUBLIC' | 'ORGANIZATION' | 'TEAM' | 'RESTRICTED';
  verificationStatus: string;
  publishedAt: string | null;
  updatedAt: string;
  category: { id: string; name: string; code: string } | null;
  owner: { id: string; name: string; avatarUrl: string | null };
  team: { id: string; name: string; code: string };
  projectDetail?: {
    projectCode: string;
    domain: string | null;
    targetValue: string | null;
    projectStage: "EXPLORING" | "READY" | "PILOTING" | "CONVERTED" | "ARCHIVED";
    priority: string;
  } | null;
  assetDetail?: {
    platforms: string[];
    scenarios: string[];
  } | null;
  currentVersion?: {
    versionLabel: string | null;
    body: unknown;
  } | null;
  coverFile: ContentFile | null;
  tags: Array<{ tag: { id: string; name: string; normalizedName: string } }>;
}

export interface ContentListResponse {
  items: ContentCard[];
  page: number;
  pageSize: number;
  total: number;
}

export interface DesignAssetDetail extends ContentCard {
  currentVersion: {
    versionNumber: number;
    versionLabel: string | null;
    title: string;
    summary: string | null;
    body: unknown;
  } | null;
  assetDetail: {
    assetType: string;
    platforms: string[];
    scenarios: string[];
    unsuitableScenarios: string[];
    problemStatement: string | null;
    usageGuide: unknown;
    resourceLinks: unknown;
    maintenanceCycleDays: number | null;
  } | null;
  attachments: PublishedAttachment[];
  sourceRelations: Array<{
    targetContent: { id: string; slug: string; title: string; contentType: string; status: string };
  }>;
}
