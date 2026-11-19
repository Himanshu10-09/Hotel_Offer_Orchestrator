import { Router } from 'express';
import { z } from 'zod';
import { isCached,queryByPrice } from '../redis/hotelStore';
import { runHotelWorkflow } from '../temporal/client';
import { logger } from '../logger';
export const hotelsRouter=Router();
function errorSummary(error:unknown):string{const visited=new Set<unknown>();const parts:string[]=[];let current:unknown=error;while(current&&typeof current==='object'&&!visited.has(current)){visited.add(current);const candidate=current as {message?:unknown;type?:unknown;cause?:unknown};if(typeof candidate.message==='string')parts.push(candidate.message);if(typeof candidate.type==='string')parts.push(candidate.type);current=candidate.cause;}return parts.join(' ');}
const querySchema=z.object({city:z.string().trim().min(1),minPrice:z.coerce.number().int().nonnegative().optional(),maxPrice:z.coerce.number().int().nonnegative().optional()}).refine(x=>x.minPrice===undefined||x.maxPrice===undefined||x.minPrice<=x.maxPrice,{message:'minPrice must be <= maxPrice'});
hotelsRouter.get('/api/hotels',async(req,res)=>{
 const parsed=querySchema.safeParse(req.query);if(!parsed.success){res.status(400).json({error:{code:'INVALID_QUERY',message:parsed.error.issues[0]?.message??'Invalid query'}});return;}
 const {city,minPrice,maxPrice}=parsed.data,bounded=minPrice!==undefined||maxPrice!==undefined;let workflowId:string|undefined;
 try{
  if(!bounded||!(await isCached(city))){const requestId=String(res.locals.requestId);const result=await runHotelWorkflow(city,requestId);workflowId=`hotels-${city}-${requestId}`;res.setHeader('X-Workflow-Id',workflowId);if(result.failedSuppliers.length)res.setHeader('X-Degraded',result.failedSuppliers.join(', '));if(!bounded){res.setHeader('X-Source','workflow');res.json(result.hotels);return;}}
  res.setHeader('X-Source',workflowId?'workflow':'redis');res.json(await queryByPrice(city,minPrice,maxPrice));
 }catch(error){logger.error({err:error,city,workflowId},'Hotel request failed');const message=errorSummary(error);if(message.includes('ALL_SUPPLIERS_FAILED')){res.status(502).json({error:{code:'UPSTREAM_UNAVAILABLE',message:'Both suppliers are unavailable'}});return;}if(/unavailable|ECONNREFUSED|Temporal|UNAVAILABLE|deadline exceeded/i.test(message)){res.status(503).json({error:{code:'ORCHESTRATOR_UNAVAILABLE',message:'Orchestration service is unavailable'}});return;}res.status(500).json({error:{code:'INTERNAL',message:'Unexpected error'}});}
});
