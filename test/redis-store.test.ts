import { beforeEach,describe,expect,it,vi } from 'vitest';
const mocks=vi.hoisted(()=>({
 redis:{multi:vi.fn(),exists:vi.fn(),zrangebyscore:vi.fn(),hmget:vi.fn()},
 tx:{hset:vi.fn(),zadd:vi.fn(),rename:vi.fn(),expire:vi.fn(),del:vi.fn(),exec:vi.fn()}
}));
vi.mock('../src/redis/client',()=>({redis:mocks.redis}));
import { isCached,queryByPrice,saveHotels } from '../src/redis/hotelStore';
const record={name:'Holtin',price:5340,supplier:'Supplier B' as const,commissionPct:20};
describe('Redis hotel store command plan',()=>{
 beforeEach(()=>{vi.clearAllMocks();for(const command of Object.values(mocks.tx))command.mockReturnValue(mocks.tx);mocks.tx.exec.mockResolvedValue([]);mocks.redis.multi.mockReturnValue(mocks.tx);});
 it('writes offers and metadata in one transaction and expires all live keys',async()=>{await saveHotels(' Delhi ',[record],false);expect(mocks.redis.multi).toHaveBeenCalledOnce();expect(mocks.tx.hset).toHaveBeenCalledWith(expect.stringMatching(/hotels:delhi:items:tmp:/),'holtin',JSON.stringify(record));expect(mocks.tx.zadd).toHaveBeenCalledWith(expect.stringMatching(/hotels:delhi:by_price:tmp:/),5340,'holtin');expect(mocks.tx.rename).toHaveBeenCalledTimes(3);expect(mocks.tx.expire).toHaveBeenCalledTimes(3);expect(mocks.tx.exec).toHaveBeenCalledOnce();});
 it('writes only meta for an empty result and clears stale offer keys',async()=>{await saveHotels('paris',[],false);expect(mocks.tx.del).toHaveBeenCalledWith('hotels:paris:items','hotels:paris:by_price');expect(mocks.tx.hset).toHaveBeenCalledTimes(1);expect(mocks.tx.rename).toHaveBeenCalledTimes(1);});
 it('loads inclusive range members from the price index then the hash',async()=>{mocks.redis.zrangebyscore.mockResolvedValue(['holt in','other']);mocks.redis.hmget.mockResolvedValue([JSON.stringify(record),JSON.stringify({...record,name:'Other',price:5500})]);const results=await queryByPrice('DELHI',4000,6000);expect(mocks.redis.zrangebyscore).toHaveBeenCalledWith('hotels:delhi:by_price',4000,6000);expect(mocks.redis.hmget).toHaveBeenCalledWith('hotels:delhi:items','holt in','other');expect(results.map(x=>x.price)).toEqual([5340,5500]);});
 it('uses open range bounds and caches by meta existence',async()=>{mocks.redis.zrangebyscore.mockResolvedValue([]);expect(await queryByPrice('delhi',undefined,6000)).toEqual([]);expect(mocks.redis.zrangebyscore).toHaveBeenCalledWith('hotels:delhi:by_price','-inf',6000);mocks.redis.exists.mockResolvedValue(1);expect(await isCached('delhi')).toBe(true);expect(mocks.redis.exists).toHaveBeenCalledWith('hotels:delhi:meta');});
});
