import { Router } from 'express';
import { config } from '../config';
import { redis } from '../redis/client';
import { getTemporalClient } from '../temporal/client';
export const healthRouter=Router();
async function check(url:string):Promise<'up'|'down'>{try{const r=await fetch(url,{signal:AbortSignal.timeout(2000)});return r.ok?'up':'down';}catch{return 'down';}}
healthRouter.get('/health',async(_req,res)=>{const [supplierA,supplierB,redisStatus,temporal]=await Promise.all([check(`${config.SUPPLIER_BASE_URL}/supplierA/hotels`),check(`${config.SUPPLIER_BASE_URL}/supplierB/hotels`),redis.ping().then(()=> 'up' as const).catch(()=> 'down' as const),getTemporalClient().then(()=> 'up' as const).catch(()=> 'down' as const)]);const checks={supplierA,supplierB,redis:redisStatus,temporal};const all=Object.values(checks).every(v=>v==='up');res.status(all?200:503).json({status:all?'ok':'degraded',checks});});
