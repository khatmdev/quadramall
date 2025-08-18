export interface Banner {
    id: number;
    image: string;
    toUrl: string;
    description: string;
    emoji: string;
    active: boolean;
    isIntro: boolean;
    displayOrder: number;
}