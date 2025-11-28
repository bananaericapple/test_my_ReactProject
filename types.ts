export interface Website {
  id: string;
  name: string;
  url: string;
  description: string;
  imageUrl: string;
  tags: string[];
  linkType?: 'external' | 'internal';
  route?: string;
}

export type NewWebsiteData = Omit<Website, 'id' | 'imageUrl' | 'linkType' | 'route'>;
