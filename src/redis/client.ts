import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../logger';
export const redis = new Redis(config.REDIS_URL,{lazyConnect:true,maxRetriesPerRequest:3});
redis.on('error',(error:Error)=>logger.error({err:error},'Redis connection error'));
export async function connectRedis():Promise<void>{if(redis.status==='wait') await redis.connect();}
