import { z } from 'zod';

const schema = z.object({PORT:z.coerce.number().int().positive().default(3000),REDIS_URL:z.string().default('redis://localhost:6379'),TEMPORAL_ADDRESS:z.string().default('localhost:7233'),TEMPORAL_NAMESPACE:z.string().default('default'),TEMPORAL_TASK_QUEUE:z.string().default('hotel-offers'),SUPPLIER_BASE_URL:z.string().default('http://localhost:3000'),SUPPLIER_TIMEOUT_MS:z.coerce.number().int().positive().default(3000),CACHE_TTL_SECONDS:z.coerce.number().int().positive().default(300),DEGRADED_CACHE_TTL_SECONDS:z.coerce.number().int().positive().default(60),LOG_LEVEL:z.enum(['fatal','error','warn','info','debug','trace','silent']).default('info')});
export const config = schema.parse(process.env);
