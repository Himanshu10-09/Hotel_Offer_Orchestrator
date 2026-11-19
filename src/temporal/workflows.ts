import { ApplicationFailure, log, proxyActivities } from '@temporalio/workflow';
import type * as activities from './activities';
import { selectBestOffers } from '../domain/selectBestOffers';
import type { WorkflowResult } from '../domain/types';
const {fetchSupplierHotels,saveHotelsToRedis}=proxyActivities<typeof activities>({startToCloseTimeout:'5s',retry:{maximumAttempts:3,initialInterval:'200ms',backoffCoefficient:2}});
export async function hotelOfferWorkflow(input:{city:string}):Promise<WorkflowResult>{
 log.info('Fetching supplier offers',{city:input.city});
 const a=fetchSupplierHotels({supplier:'A',city:input.city}),b=fetchSupplierHotels({supplier:'B',city:input.city});
 const [ra,rb]=await Promise.allSettled([a,b]);
 if(ra.status==='rejected'&&rb.status==='rejected')throw ApplicationFailure.nonRetryable('Both suppliers failed','ALL_SUPPLIERS_FAILED');
 const failedSuppliers:WorkflowResult['failedSuppliers']=[];
 if(ra.status==='rejected')failedSuppliers.push('Supplier A');if(rb.status==='rejected')failedSuppliers.push('Supplier B');
 const hotels=selectBestOffers(ra.status==='fulfilled'?ra.value:[],rb.status==='fulfilled'?rb.value:[]);
 await saveHotelsToRedis({city:input.city,hotels,degraded:failedSuppliers.length>0});return {hotels,failedSuppliers};
}
