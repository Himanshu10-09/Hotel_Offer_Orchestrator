export type Supplier = 'Supplier A'|'Supplier B';
export type SupplierHotel = {hotelId:string;name:string;price:number;city:string;commissionPct:number};
export type Offer = {name:string;price:number;supplier:Supplier;commissionPct:number};
export type WorkflowResult = {hotels:Offer[];failedSuppliers:Supplier[]};
export const normalizeName = (name:string):string => name.trim().replace(/\s+/g,' ').toLowerCase();
