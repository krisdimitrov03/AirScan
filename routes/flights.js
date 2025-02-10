const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const flightService = require('../services/flightService');

router.get('/', async(req,res,next)=>{
  try{
    const flights=await flightService.getAllFlights();
    res.render('flights/index',{flights});
  }catch(e){next(e);}
});

router.get('/new', verifyToken, authorizeRoles(['analyst', "admin"]),(req,res)=>{
  res.render('flights/new');
});

router.post('/', verifyToken, authorizeRoles(['analyst', "admin"]), async(req,res,next)=>{
  try{
    const {origin_airport_code,destination_airport_code,direct_indirect_flag,return_option_flag,scheduled_departure,scheduled_arrival}=req.body;
    await flightService.createFlight({
      origin_airport_code,
      destination_airport_code,
      direct_indirect_flag,
      return_option_flag: return_option_flag==='true',
      scheduled_departure,
      scheduled_arrival
    });
    res.redirect('/flights');
  }catch(e){
    if(e.name==='SequelizeUniqueConstraintError'){
      return res.status(409).send('Flight ID already exists.');
    }
    next(e);
  }
});

router.get('/:uuid/edit', verifyToken, authorizeRoles(['analyst', "admin"]), async(req,res,next)=>{
  try {
    const flight = await flightService.getFlightByUUID(req.params.uuid);
    if (!flight) return res.status(404).send('Flight not found.');
    res.render('flights/edit', {flight});
  } catch(e) {
    next(e);
  }
});

router.put('/:uuid', verifyToken, authorizeRoles(['analyst', "admin"]), async(req,res,next)=>{
  try{
    const updated=await flightService.updateFlight(req.params.uuid,req.body);
    if(!updated)return res.status(404).send('Flight update failed.');
    res.redirect('/flights');
  }catch(e){
    if(e.name==='SequelizeUniqueConstraintError'){
      return res.status(409).send('Flight ID already exists.');
    }
    next(e);
  }
});

router.delete('/:uuid', verifyToken, authorizeRoles(['analyst', "admin"]), async(req,res,next)=>{
  try{
    const result=await flightService.deleteFlight(req.params.uuid);
    if(!result)return res.status(404).send('Flight could not be deleted.');
    res.redirect('/flights');
  }catch(e){next(e);}
});

module.exports=router;
