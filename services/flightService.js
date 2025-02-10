const Flight = require('../models/Flight');

async function getAllFlights(){return Flight.findAll();}
async function getFlightById(id){return Flight.findByPk(id);}
async function createFlight(data){return Flight.create(data);}
async function updateFlight(id,data){
  const flight = await Flight.findByPk(id);
  if(!flight)return null;
  return flight.update(data);
}

async function deleteFlight(id){
  const deletedCount = await Flight.destroy({where:{flight_id:id}});
  return deletedCount===1;
}

module.exports={getAllFlights,getFlightById,createFlight,updateFlight,deleteFlight};
