import { Client, Connection } from '@temporalio/client';
import { config } from '../config';
import { logger } from '../logger';
let connection:Connection|undefined;
let client:Client|undefined;
export async function getTemporalClient():Promise<Client>{
 if(client)return client;
 let last:unknown;
 for(let attempt=0;attempt<30;attempt++){
  try{connection=await Connection.connect({address:config.TEMPORAL_ADDRESS});client=new Client({connection,namespace:config.TEMPORAL_NAMESPACE});return client;}
  catch(error){last=error;logger.warn({attempt:attempt+1,err:error},'Temporal connection retry');await new Promise(resolve=>setTimeout(resolve,1000));}
 }
 throw last instanceof Error?last:new Error('Temporal connection unavailable');
}
export async function closeTemporalClient():Promise<void>{if(connection)await connection.close();connection=undefined;client=undefined;}
export async function runHotelWorkflow(city:string,requestId:string){const temporal=await getTemporalClient();return temporal.workflow.execute('hotelOfferWorkflow',{args:[{city}],taskQueue:config.TEMPORAL_TASK_QUEUE,workflowId:`hotels-${city}-${requestId}`,workflowExecutionTimeout:'30s'});}
