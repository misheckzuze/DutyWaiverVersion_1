export interface Item {
  id: string; // optional for items coming from API (view-only)
  hsCode: string;
  description: string;
  quantity: number;
  unitOfMeasure?: string; // local selection value (code)
  uomId?: number | string; // API-provided reference (id or code)
  value: number;
  dutyAmount?: number;
  currency?: string;
}