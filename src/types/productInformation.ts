export type InformationKind = 'ingredient' | 'benefit' | 'concern' | 'skin_type' | 'usage' | 'frequency' | 'warning' | 'full_ingredients';
export type AnalysisStatus = 'pending' | 'processing' | 'needs_review' | 'verified' | 'failed';

export interface GalleryImage {
  id: string | null;
  url: string;
  width: number | null;
  height: number | null;
  altText: string | null;
}

export interface ProductAnalysisSource {
  id: string;
  productId: string;
  title: string;
  handle: string;
  productType: string;
  vendor: string;
  description: string;
  descriptionHtml: string;
  tags: string[];
  updatedAt: string;
  metadata: { namespace: string; key: string; value: string; type: string }[];
  metadataAccessible: boolean;
  images: GalleryImage[];
}

export interface ImageRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RawProductFact {
  id: string;
  kind: InformationKind;
  text: string;
  excerpt: string;
  concentration: string | null;
  function: string | null;
  complete: boolean;
  confidence: number;
}

export interface RawImageComparison {
  kind: 'none' | 'before' | 'after' | 'composite' | 'progression' | 'uncertain';
  credible: boolean;
  consistentFraming: boolean;
  pairKey: string | null;
  timeline: string | null;
  beforeRegion: ImageRegion | null;
  afterRegion: ImageRegion | null;
  confidence: number;
}

export interface ProductExtraction {
  ocrText: string;
  readability: 'readable' | 'partial' | 'unreadable' | 'no_text';
  facts: RawProductFact[];
  comparison: RawImageComparison;
  reasons: string[];
}

export interface ImageVerification {
  ocrText: string;
  verifiedFactIds: string[];
  comparisonVerified: boolean;
  confidence: number;
  reasons: string[];
}

export interface ImageInspection {
  image: GalleryImage;
  extraction: ProductExtraction | null;
  verification: ImageVerification | null;
  attempts: number;
  verificationAttempts: number;
  nextAttemptAt: string;
  error: string | null;
}

export interface ProductAnalysisWork {
  description: ProductExtraction | null;
  descriptionAttempts: number;
  images: ImageInspection[];
}

export interface ProductFact {
  id: string;
  kind: InformationKind;
  text: string;
  concentration: string | null;
  function: string | null;
  status: 'confirmed' | 'needs_review';
  evidence: { type: 'description' | 'metafield' | 'image'; reference: string; excerpt: string }[];
}

export interface ComparisonImage {
  url: string;
  width: number;
  height: number;
  region: ImageRegion;
}

export interface ProductImageComparison {
  id: string;
  before: ComparisonImage;
  after: ComparisonImage;
  aspectRatio: number;
  timeline: string | null;
  status: 'confirmed' | 'needs_review';
}

export interface ProductInformation {
  productId: string;
  handle: string;
  title: string;
  fingerprint: string;
  category: 'skincare' | 'other';
  status: AnalysisStatus;
  facts: ProductFact[];
  comparisons: ProductImageComparison[];
  imagesTotal: number;
  imagesInspected: number;
  reasons: string[];
  updatedAt: string;
}

export interface ProductAnalysisRecord {
  source: ProductAnalysisSource;
  fingerprint: string;
  status: AnalysisStatus;
  work: ProductAnalysisWork;
  information: ProductInformation | null;
  published: ProductInformation | null;
  updatedAt: string;
}
