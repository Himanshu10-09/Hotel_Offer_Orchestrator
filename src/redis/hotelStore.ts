import { randomUUID } from 'node:crypto';
import type { Offer } from '../domain/types';
import { normalizeName } from '../domain/types';
import { config } from '../config';
import { redis } from './client';

const cityKey=(city:string):string=>city.trim().toLowerCase();
const keys=(city:string)=>{const c=cityKey(city);return {items:`hotels:${c}:items`,prices:`hotels:${c}:by_price`,meta:`hotels:${c}:meta`};};
export async function saveHotels(city:string,offers:Offer[],degraded:boolean):Promise<void>{
 const live=keys(city),suffix=`:tmp:${randomUUID()}`,tmp={items:live.items+suffix,prices:live.prices+suffix,meta:live.meta+suffix},ttl=degraded?config.DEGRADED_CACHE_TTL_SECONDS:config.CACHE_TTL_SECONDS;
 const tx=redis.multi();
 if(offers.length){for(const offer of offers){const n=normalizeName(offer.name);tx.hset(tmp.items,n,JSON.stringify(offer));tx.zadd(tmp.prices,offer.price,n);}}
 tx.hset(tmp.meta,'updatedAt',new Date().toISOString(),'count',String(offers.length),'degraded',String(degraded));
 tx.rename(tmp.meta,live.meta);tx.expire(live.meta,ttl);
 if(offers.length){tx.rename(tmp.items,live.items);tx.rename(tmp.prices,live.prices);tx.expire(live.items,ttl);tx.expire(live.prices,ttl);}else{tx.del(live.items,live.prices);}
 await tx.exec();
}
export async function queryByPrice(city:string,min?:number,max?:number):Promise<Offer[]>{const k=keys(city);const members=await redis.zrangebyscore(k.prices,min??'-inf',max??'+inf');if(!members.length)return [];const vals=await redis.hmget(k.items,...members);return vals.filter((v):v is string=>v!==null).map(v=>JSON.parse(v) as Offer).sort((a,b)=>a.price-b.price||a.name.localeCompare(b.name));}
export async function isCached(city:string):Promise<boolean>{return (await redis.exists(keys(city).meta))>0;}
