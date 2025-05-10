
// Create this file if it doesn't exist yet
export interface Table {
  id: string;
  name: string;
  fields: Field[];
  position: { x: number; y: number };
  width?: number;
  height?: number;
  isCollapsed?: boolean;
  zIndex?: number;
}

export interface Field {
  id: string;
  name: string;
  type: string;
  required: boolean;
  unique: boolean;
  isPrimary: boolean;
  description: string;
  defaultValue: string;
  index?: number;
}

export interface Relationship {
  id: string;
  sourceTableId: string;
  sourceFieldId: string;
  targetTableId: string;
  targetFieldId?: string;
  type?: string;
  isReference?: boolean;
  isTwoWay?: boolean;
}

export interface Area {
  id: string;
  title: string;
  color: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  zIndex?: number;
}

export interface Note {
  id: string;
  content: string;
  color: string;
  position: { x: number; y: number };
  width: number;
  height?: number;
  zIndex?: number;
}
