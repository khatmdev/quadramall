export interface BannerDTO {
  id?: number;
  image: string;
  description: string;
  toUrl?: string;
  emoji?: string;
  active: boolean;
  isIntro: boolean;
  displayOrder: number;
}