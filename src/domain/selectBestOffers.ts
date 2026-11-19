import { normalizeName, type Offer } from './types';

export function selectBestOffers(a:Offer[],b:Offer[]):Offer[] {
  const winners = new Map<string,Offer>();
  for (const offer of [...a,...b]) {
    const key=normalizeName(offer.name), current=winners.get(key);
    if (!current || offer.price<current.price || (offer.price===current.price && offer.supplier==='Supplier A' && current.supplier==='Supplier B')) winners.set(key,offer);
  }
  return [...winners.values()].sort((x,y)=>x.price-y.price || x.name.localeCompare(y.name));
}
