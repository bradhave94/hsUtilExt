export interface HubSpotPage {
  id: string;
  name?: string;
  slug?: string;
  state?: string;
  currentState?: string;
  createdAt?: string;
  updatedAt?: string;
  publishDate?: string;
  archived?: boolean;
  archivedAt?: string;
  archivedInDashboard?: boolean;
  templatePath?: string;
  template_path?: string;
  url?: string;
  domain?: string;
  authorName?: string;
  published?: boolean;
  publishImmediately?: boolean;
  featuredImage?: string;
  featuredImageAltText?: string;
  categoryId?: number;
  contentTypeCategory?: number;
  subcategory?: string;
  absolute_url?: string;
}