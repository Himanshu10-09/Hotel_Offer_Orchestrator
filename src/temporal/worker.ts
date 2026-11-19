import { NativeConnection, Worker } from '@temporalio/worker';
import { config } from '../config';
import * as activities from './activities';
import { logger } from '../logger';
async function main():Promise<void>{
 let connection:NativeConnection|undefined,last:unknown;
 for(let attempt=0;attempt<30;attempt++){try{connection=await NativeConnection.connect({address:config.TEMPORAL_ADDRESS});break;}catch(error){last=error;logger.warn({attempt:attempt+1,err:error},'Temporal worker connection retry');await new Promise(resolve=>setTimeout(resolve,1000));}}
 if(!connection)throw last instanceof Error?last:new Error('Temporal connection unavailable');
 const worker=await Worker.create({connection,namespace:config.TEMPORAL_NAMESPACE,taskQueue:config.TEMPORAL_TASK_QUEUE,workflowsPath:require.resolve('./workflows'),activities});
 const stop=()=>worker.shutdown();process.once('SIGINT',stop);process.once('SIGTERM',stop);await worker.run();await connection.close();
}
void main().catch(error=>{logger.fatal({err:error},'Temporal worker stopped');process.exitCode=1;});
