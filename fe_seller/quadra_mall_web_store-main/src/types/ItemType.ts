export interface ItemTypeDTO {
    id: number;
    parent: ItemTypeDTO | null;
    children: ItemTypeDTO[];
    name: string;
    slug: string;
    description: string | null;
    iconUrl: string | null;
    isActive: boolean | null;
}