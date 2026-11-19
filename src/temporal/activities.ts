import { Context } from '@temporalio/activity';
import { config } from '../config';
import { logger } from '../logger';
import type { Offer, Supplier, SupplierHotel } from '../domain/types';
import { saveHotels } from '../redis/hotelStore';

export async function fetchSupplierHotels(input:{supplier:'A'|'B';city:string}):Promise<Offer[]>{
 const label:Supplier=input.supplier==='A'?'Supplier A':'Supplier B';
 const url=`${config.SUPPLIER_BASE_URL}/supplier${input.supplier}/hotels?city=${encodeURIComponent(input.city)}`;
 const response=await fetch(url,{signal:AbortSignal.timeout(config.SUPPLIER_TIMEOUT_MS)});
 if(!response.ok)throw new Error(`${label} returned HTTP ${response.status}`);
 const data=await response.json() as SupplierHotel[];
 const offers=data.map(h=>({name:h.name,price:h.price,supplier:label,commissionPct:h.commissionPct}));
 Context.current().log.info(`${label} returned ${offers.length} hotels for ${input.city}`);return offers;
}
export async function saveHotelsToRedis(input:{city:string;hotels:Offer[];degraded:boolean}):Promise<void>{await saveHotels(input.city,input.hotels,input.degraded);logger.info({city:input.city,count:input.hotels.length,degraded:input.degraded},'Saved hotel offers to Redis');}
