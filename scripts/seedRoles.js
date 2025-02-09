const { sequelize, Role } = require('../models');
async function seedRoles(){
  try{
    await sequelize.authenticate();
    const roles = [{ role_name:"admin" }, { role_name:"user" }, { role_name:"manager" }, { role_name:"analyst" }];
    for(let roleData of roles){
      await Role.findOrCreate({ where: { role_name: roleData.role_name }, defaults: roleData });
    }
    console.log("Roles seeded successfully");
    process.exit(0);
  }catch(err){
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}
seedRoles();
