const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Garage = require('../models/Garage');
const Helper = require('../models/Helper');
const Settings = require('../models/Settings');

const seedDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is not set in env');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB connected for seeding');

    // Clean current data
    await User.deleteMany({ email: { $in: [/test\.com$/, /garro\.ae$/] } });
    await Garage.deleteMany({
      name: {
        $in: [
          'Al Quoz Auto Workshop',
          'Deira Motors',
          'Marina Auto Service',
          'Al Barsha Garage Pro',
          'Downtown Car Clinic',
          'Mirdif Auto Care'
        ]
      }
    });
    await Helper.deleteMany({
      name: {
        $in: [
          'Ahmed Hassan',
          'Omar Khalid',
          'John Doe',
          'Jane Smith',
          'Alex Jones',
          'Michael Scott'
        ]
      }
    });
    await Settings.deleteMany({ key: 'assignMode' });
    await require('../models/Request').deleteMany({});
    await require('../models/Vehicle').deleteMany({});

    console.log('Cleaned old test data.');

    // 1. Seed settings
    await Settings.create({ key: 'assignMode', value: 'manual' });
    console.log('Seeded settings key: assignMode = manual');

    const hashedPassword = await bcrypt.hash('Test@1234', 12);

    // 2. Seed Users
    const customer = await User.create({
      name: 'Test Customer',
      email: 'customer@test.com',
      phone: '+971501234567',
      role: 'customer',
      status: 'active',
      password: hashedPassword
    });

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@garro.ae',
      phone: '+971509999999',
      role: 'admin',
      status: 'active',
      password: hashedPassword
    });

    const helperUser1 = await User.create({
      name: 'Ahmed Hassan',
      email: 'ahmed@garro.ae',
      phone: '+971501112222',
      role: 'helper',
      status: 'active',
      password: hashedPassword
    });

    const helperUser2 = await User.create({
      name: 'Omar Khalid',
      email: 'omar@garro.ae',
      phone: '+971503334444',
      role: 'helper',
      status: 'active',
      password: hashedPassword
    });

    const helperUser3 = await User.create({
      name: 'John Doe',
      email: 'john@garro.ae',
      phone: '+971505556666',
      role: 'helper',
      status: 'active',
      password: hashedPassword
    });

    const helperUser4 = await User.create({
      name: 'Jane Smith',
      email: 'jane@garro.ae',
      phone: '+971507778888',
      role: 'helper',
      status: 'active',
      password: hashedPassword
    });

    const helperUser5 = await User.create({
      name: 'Alex Jones',
      email: 'alex@garro.ae',
      phone: '+971508889999',
      role: 'helper',
      status: 'active',
      password: hashedPassword
    });

    const helperUser6 = await User.create({
      name: 'Michael Scott',
      email: 'michael@garro.ae',
      phone: '+971502223333',
      role: 'helper',
      status: 'active',
      password: hashedPassword
    });

    console.log('Seeded Users: Customer, Admin, and 6 Helpers');

    // 3. Seed Garages
    const garage1 = await Garage.create({
      name: 'Al Quoz Auto Workshop',
      contactPerson: 'Manager Al Quoz',
      phone: '+97144441111',
      email: 'alquoz@test.com',
      commissionPercent: 10,
      services: ['minor_service', 'major_service', 'brake_repair', 'diagnostics'],
      areas: ['Al Quoz', 'Downtown Dubai'],
      status: 'active',
      rating: 4.5,
      location: { lat: 25.1584, lng: 55.2297 }
    });

    const garage2 = await Garage.create({
      name: 'Deira Motors',
      contactPerson: 'Manager Deira',
      phone: '+97142223333',
      email: 'deira@test.com',
      commissionPercent: 10,
      services: ['ac_repair', 'electrical', 'battery', 'diagnostics', 'minor_service'],
      areas: ['Deira', 'Bur Dubai'],
      status: 'active',
      rating: 4.2,
      location: { lat: 25.2697, lng: 55.3094 }
    });

    const garage3 = await Garage.create({
      name: 'Marina Auto Service',
      contactPerson: 'Manager Marina',
      phone: '+97148881122',
      email: 'marina@test.com',
      commissionPercent: 10,
      services: ['minor_service', 'major_service', 'brake_repair', 'battery'],
      areas: ['Dubai Marina', 'Jumeirah'],
      status: 'active',
      rating: 4.8,
      location: { lat: 25.0686, lng: 55.1378 }
    });

    const garage4 = await Garage.create({
      name: 'Al Barsha Garage Pro',
      contactPerson: 'Manager Barsha',
      phone: '+97147773344',
      email: 'barsha@test.com',
      commissionPercent: 10,
      services: ['ac_repair', 'electrical', 'battery', 'other'],
      areas: ['Al Barsha', 'Silicon Oasis'],
      status: 'active',
      rating: 4.4,
      location: { lat: 25.1124, lng: 55.2062 }
    });

    const garage5 = await Garage.create({
      name: 'Downtown Car Clinic',
      contactPerson: 'Manager Downtown',
      phone: '+97149995566',
      email: 'downtown@test.com',
      commissionPercent: 10,
      services: ['minor_service', 'major_service', 'diagnostics', 'other'],
      areas: ['Downtown Dubai', 'Business Bay'],
      status: 'active',
      rating: 4.7,
      location: { lat: 25.2048, lng: 55.2708 }
    });

    const garage6 = await Garage.create({
      name: 'Mirdif Auto Care',
      contactPerson: 'Manager Mirdif',
      phone: '+97143336677',
      email: 'mirdif@test.com',
      commissionPercent: 10,
      services: ['minor_service', 'brake_repair', 'battery', 'other'],
      areas: ['Mirdif', 'Silicon Oasis'],
      status: 'active',
      rating: 4.3,
      location: { lat: 25.2167, lng: 55.4167 }
    });

    console.log('Seeded 6 Garages');

    // 4. Seed Helpers
    await Helper.create({
      userId: helperUser1._id,
      name: 'Ahmed Hassan',
      phone: '+971501112222',
      garageId: garage1._id,
      isAvailable: true,
      currentLocation: { lat: 25.1584, lng: 55.2297 },
      rating: 4.8,
      totalJobs: 45
    });
    await User.findByIdAndUpdate(helperUser1._id, { garageId: garage1._id });

    await Helper.create({
      userId: helperUser2._id,
      name: 'Omar Khalid',
      phone: '+971503334444',
      garageId: garage2._id,
      isAvailable: true,
      currentLocation: { lat: 25.2697, lng: 55.3094 },
      rating: 4.6,
      totalJobs: 32
    });
    await User.findByIdAndUpdate(helperUser2._id, { garageId: garage2._id });

    await Helper.create({
      userId: helperUser3._id,
      name: 'John Doe',
      phone: '+971505556666',
      garageId: garage3._id,
      isAvailable: true,
      currentLocation: { lat: 25.0686, lng: 55.1378 },
      rating: 4.9,
      totalJobs: 56
    });
    await User.findByIdAndUpdate(helperUser3._id, { garageId: garage3._id });

    await Helper.create({
      userId: helperUser4._id,
      name: 'Jane Smith',
      phone: '+971507778888',
      garageId: garage4._id,
      isAvailable: true,
      currentLocation: { lat: 25.1124, lng: 55.2062 },
      rating: 4.7,
      totalJobs: 28
    });
    await User.findByIdAndUpdate(helperUser4._id, { garageId: garage4._id });

    await Helper.create({
      userId: helperUser5._id,
      name: 'Alex Jones',
      phone: '+971508889999',
      garageId: garage5._id,
      isAvailable: true,
      currentLocation: { lat: 25.2048, lng: 55.2708 },
      rating: 4.8,
      totalJobs: 41
    });
    await User.findByIdAndUpdate(helperUser5._id, { garageId: garage5._id });

    await Helper.create({
      userId: helperUser6._id,
      name: 'Michael Scott',
      phone: '+971502223333',
      garageId: garage6._id,
      isAvailable: true,
      currentLocation: { lat: 25.2167, lng: 55.4167 },
      rating: 4.5,
      totalJobs: 19
    });
    await User.findByIdAndUpdate(helperUser6._id, { garageId: garage6._id });

    console.log('Seeded Helpers');
    console.log('Seeding finished successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
