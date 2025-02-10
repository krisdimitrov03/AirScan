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

router.get('/new', verifyToken, authorizeRoles(['analyst']),(req,res)=>{
  res.render('flights/new');
});

router.post('/', verifyToken, authorizeRoles(['analyst']), async(req,res,next)=>{
  try{
    const {flight_id,origin_airport_code,destination_airport_code,direct_indirect_flag,return_option_flag,scheduled_departure,scheduled_arrival}=req.body;
    await flightService.createFlight({
      flight_id,
      origin_airport_code,
      destination_airport_code,
      direct_indirect_flag,  // 'direct' or 'indirect' only
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

router.get('/:id/edit', verifyToken, authorizeRoles(['analyst']), async(req,res,next)=>{
  try{
    const flight=await flightService.getFlightById(req.params.id);
    if(!flight)return res.status(404).send('Flight not found.');
    res.render('flights/edit',{flight});
  }catch(e){next(e);}
});

router.put('/:id', verifyToken, authorizeRoles(['analyst']), async(req,res,next)=>{
  try{
    const updated=await flightService.updateFlight(req.params.id,req.body);
    if(!updated)return res.status(404).send('Flight update failed.');
    res.redirect('/flights');
  }catch(e){
    if(e.name==='SequelizeUniqueConstraintError'){
      return res.status(409).send('Flight ID already exists.');
    }
    next(e);
  }
});

router.delete('/:id', verifyToken, authorizeRoles(['analyst']), async(req,res,next)=>{
  try{
    const result=await flightService.deleteFlight(req.params.id);
    if(!result)return res.status(404).send('Flight could not be deleted.');
    res.redirect('/flights');
  }catch(e){next(e);}
});

module.exports=router;
