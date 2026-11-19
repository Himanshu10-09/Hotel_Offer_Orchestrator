import express from 'express';
import pinoHttp from 'pino-http';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { logger } from './logger';
import { connectRedis,redis } from './redis/client';
import { closeTemporalClient } from './temporal/client';
import { supplierRouter } from './routes/suppliers';
import { hotelsRouter } from './routes/hotels';
import { healthRouter } from './routes/health';
import { config } from './config';
export const app=express();
app.disable('x-powered-by');
app.use(pinoHttp({logger,genReqId:(req,res)=>{const provided=req.headers['x-request-id'];const id=typeof provided==='string'&&/^[\w.-]{1,128}$/.test(provided)?provided:randomUUID();res.setHeader('X-Request-Id',id);return id;}}));
app.use((req,res,next)=>{res.locals.requestId=req.id;next();});
app.use(express.json({limit:'16kb'}));app.use(supplierRouter);app.use(hotelsRouter);app.use(healthRouter);
app.use(express.static(path.resolve(process.cwd(),'public')));
app.use((_req,res)=>{res.status(404).json({error:{code:'NOT_FOUND',message:'Route not found'}});});
app.use((error:unknown,_req:express.Request,res:express.Response,_next:express.NextFunction)=>{logger.error({err:error},'Unhandled request error');res.status(500).json({error:{code:'INTERNAL',message:'Unexpected error'}});});
let server:import('node:http').Server|undefined;
async function start():Promise<void>{await connectRedis();server=app.listen(config.PORT,()=>logger.info({port:config.PORT},'Hotel Offer Orchestrator listening'));}
async function shutdown():Promise<void>{server?.close();await Promise.allSettled([redis.quit(),closeTemporalClient()]);}
if(require.main===module){void start().catch(error=>{logger.fatal({err:error},'API failed to start');process.exit(1);});process.once('SIGINT',()=>void shutdown());process.once('SIGTERM',()=>void shutdown());}
