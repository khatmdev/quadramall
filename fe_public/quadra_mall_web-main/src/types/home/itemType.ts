export interface ItemTypeDTO {
  id: number;
  parent?: ItemTypeDTO;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  isActive?: boolean;
}