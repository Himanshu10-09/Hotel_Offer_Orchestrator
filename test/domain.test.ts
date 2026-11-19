import { describe,it,expect } from 'vitest';
import { selectBestOffers } from '../src/domain/selectBestOffers';
import { supplierAHotels,supplierBHotels } from '../src/data/mockHotels';
import type { Offer } from '../src/domain/types';
const offer=(name:string,price:number,supplier:'Supplier A'|'Supplier B'='Supplier A'):Offer=>({name,price,supplier,commissionPct:10});
describe('selectBestOffers',()=>{
 it('selects the cheaper overlapping offer and retains unique hotels',()=>expect(selectBestOffers([offer('Holtin',6000),offer('Only A',5)],[offer('Holtin',5340,'Supplier B'),offer('Only B',6,'Supplier B')])).toEqual([offer('Holtin',5340,'Supplier B'),offer('Only A',5),offer('Only B',6,'Supplier B')].sort((a,b)=>a.price-b.price)));
 it('picks Supplier A on ties and normalizes whitespace and case',()=>expect(selectBestOffers([offer(' Hotel   One ',10)],[offer('hotel one',10,'Supplier B')])[0]?.supplier).toBe('Supplier A'));
 it('keeps the cheapest duplicate within one supplier',()=>expect(selectBestOffers([offer('same',10),offer(' SAME ',5)],[])).toEqual([offer(' SAME ',5)]));
 it('matches the expected Delhi output',()=>expect(selectBestOffers(supplierAHotels.filter(h=>h.city==='delhi').map(h=>({name:h.name,price:h.price,supplier:'Supplier A' as const,commissionPct:h.commissionPct})),supplierBHotels.filter(h=>h.city==='delhi').map(h=>({name:h.name,price:h.price,supplier:'Supplier B' as const,commissionPct:h.commissionPct}))).map(h=>[h.name,h.price,h.supplier])).toEqual([['Hotel Aura',3100,'Supplier A'],['Bloom Suites',3900,'Supplier B'],['Lemon Tree',4200,'Supplier A'],['Sky Residency',4500,'Supplier A'],['Holtin',5340,'Supplier B'],['Radison',5900,'Supplier A'],['ITC Maurya',11800,'Supplier A'],['Taj Palace',12100,'Supplier B'],['The Leela',14200,'Supplier B']]));
});
