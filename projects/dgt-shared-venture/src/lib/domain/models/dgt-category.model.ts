import { DGTI8NEntity } from './dgt-i8n-entity.model';

export interface DGTCategory extends DGTI8NEntity {
    description: string;
    icon: string;
    label: string;
    weight: number;
}
