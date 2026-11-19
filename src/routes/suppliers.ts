import { Router } from 'express';
import { hotelsForCity,supplierAHotels,supplierBHotels } from '../data/mockHotels';
import type { SupplierHotel } from '../domain/types';
export const supplierRouter=Router();
const down={A:false,B:false};
function endpoint(id:'A'|'B',items:SupplierHotel[]){return (req:import('express').Request,res:import('express').Response):void=>{if(down[id]){res.status(503).json({error:{code:'SUPPLIER_DOWN',message:`Supplier ${id} is unavailable`}});return;}res.json(hotelsForCity(items,typeof req.query.city==='string'?req.query.city:undefined));};}
supplierRouter.get('/supplierA/hotels',endpoint('A',supplierAHotels));supplierRouter.get('/supplierB/hotels',endpoint('B',supplierBHotels));
supplierRouter.post('/api/admin/suppliers/:id/:action',(req,res)=>{const id=req.params.id,action=req.params.action;if((id!=='A'&&id!=='B')||(action!=='down'&&action!=='up')){res.status(404).json({error:{code:'NOT_FOUND',message:'Unknown supplier action'}});return;}down[id]=action==='down';res.json({supplier:`Supplier ${id}`,status:down[id]?'down':'up'});});
