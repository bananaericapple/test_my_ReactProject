export interface Website {
  id: string;
  name: string;
  url: string;
  description: string;
  imageUrl: string;
  tags: string[];
}

export type NewWebsiteData = Omit<Website, 'id' | 'imageUrl'>;