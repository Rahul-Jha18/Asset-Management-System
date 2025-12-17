const { sequelize } = require('./config/db');
const Branch = require('./models/Branch');
const Device = require('./models/Device');

async function seed() {
  await sequelize.sync({ force: true });

  const branch1 = await Branch.create({ name: 'Branch A', location: 'City A' });
  const branch2 = await Branch.create({ name: 'Branch B', location: 'City B' });

  await Device.bulkCreate([
    { name: 'Printer 1', ip: '192.168.0.10', model: 'HP LaserJet', branchId: branch1.id },
    { name: 'Laptop 1', ip: '192.168.0.11', model: 'Dell XPS', branchId: branch1.id },
    { name: 'Router 1', ip: '192.168.1.1', model: 'Cisco 2900', branchId: branch2.id },
    { name: 'Laptop 2', ip: '192.168.1.12', model: 'HP EliteBook', branchId: branch2.id },
  ]);

  console.log('Seeding complete');
  process.exit();
}

seed();