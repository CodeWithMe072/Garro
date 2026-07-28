import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

// Imports for all models
import User from '../models/User.js';
import Garage from '../models/Garage.js';
import Helper from '../models/Helper.js';
import Settings from '../models/Settings.js';
import Request from '../models/Request.js';
import Vehicle from '../models/Vehicle.js';
import Brand from '../models/Brand.js';
import VehicleModel from '../models/VehicleModel.js';
import ServiceCategory from '../models/ServiceCategory.js';
import ServiceSubCategory from '../models/ServiceSubCategory.js';
import City from '../models/City.js';
import Area from '../models/Area.js';
import Job from '../models/Job.js';
import Quote from '../models/Quote.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import GaragePayout from '../models/GaragePayout.js';
import HelperBookingSlot from '../models/HelperBookingSlot.js';
import HelperTracking from '../models/HelperTracking.js';
import ActivityLog from '../models/ActivityLog.js';
import BlockedIp from '../models/BlockedIp.js';
import Notification from '../models/Notification.js';
import Otp from '../models/Otp.js';
import Complaint from '../models/Complaint.js';
import Review from '../models/Review.js';
import VehicleConditionReport from '../models/VehicleConditionReport.js';

const seedDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is not set in env');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB connected for seeding');

    // Drop database completely to ensure 100% fresh state
    await mongoose.connection.dropDatabase();
    console.log('Database dropped completely.');
    await Promise.all([
      User.deleteMany({}),
      Garage.deleteMany({}),
      Helper.deleteMany({}),
      Settings.deleteMany({}),
      Request.deleteMany({}),
      Vehicle.deleteMany({}),
      Brand.deleteMany({}),
      VehicleModel.deleteMany({}),
      ServiceCategory.deleteMany({}),
      ServiceSubCategory.deleteMany({}),
      City.deleteMany({}),
      Area.deleteMany({}),
      Job.deleteMany({}),
      Quote.deleteMany({}),
      Invoice.deleteMany({}),
      Payment.deleteMany({}),
      GaragePayout.deleteMany({}),
      HelperBookingSlot.deleteMany({}),
      HelperTracking.deleteMany({}),
      ActivityLog.deleteMany({}),
      BlockedIp.deleteMany({}),
      Notification.deleteMany({}),
      Otp.deleteMany({}),
      Complaint.deleteMany({}),
      Review.deleteMany({}),
      VehicleConditionReport.deleteMany({})
    ]);

    console.log('Cleaned all existing collection data completely.');

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

    // 3. Seed Garages with complete Service Category & Area mappings
    const garage1 = await Garage.create({
      name: 'Al Quoz Auto Workshop',
      contactPerson: 'Manager Al Quoz',
      phone: '+97144441111',
      email: 'alquoz@test.com',
      commissionPercent: 10,
      services: ['minor_service', 'major_service', 'brake_repair', 'diagnostics', 'engine_repair', 'oil_change', 'ceramic_coating', 'dent_repair', 'ac_repair', 'battery_replacement', 'safety_inspection'],
      areas: ['Al Quoz', 'Downtown Dubai', 'Business Bay', 'Jumeirah', 'Dubai Marina', 'Al Barsha', 'Silicon Oasis', 'Mirdif', 'Deira', 'Bur Dubai', 'Yas Island', 'Al Majaz'],
      status: 'active',
      rating: 4.8,
      location: { lat: 25.1584, lng: 55.2297 }
    });

    const garage2 = await Garage.create({
      name: 'Deira Motors',
      contactPerson: 'Manager Deira',
      phone: '+97142223333',
      email: 'deira@test.com',
      commissionPercent: 10,
      services: ['ac_repair', 'electrical_fix', 'battery_replacement', 'diagnostics', 'minor_service', 'suspension_repair', 'steering_repair', 'scratch_removal', 'window_tinting', 'oil_change'],
      areas: ['Deira', 'Bur Dubai', 'Al Majaz', 'Al Nahda', 'Muwaileh', 'Mirdif', 'Downtown Dubai'],
      status: 'active',
      rating: 4.5,
      location: { lat: 25.2697, lng: 55.3094 }
    });

    const garage3 = await Garage.create({
      name: 'Marina Auto Service',
      contactPerson: 'Manager Marina',
      phone: '+97148881122',
      email: 'marina@test.com',
      commissionPercent: 10,
      services: ['minor_service', 'major_service', 'brake_repair', 'battery_replacement', 'ceramic_coating', 'full_detailing', 'transmission_service', 'safety_inspection', 'annual_inspection'],
      areas: ['Dubai Marina', 'Jumeirah', 'Al Barsha', 'Downtown Dubai', 'Business Bay', 'Yas Island', 'Al Reem Island'],
      status: 'active',
      rating: 4.9,
      location: { lat: 25.0686, lng: 55.1378 }
    });

    const garage4 = await Garage.create({
      name: 'Al Barsha Garage Pro',
      contactPerson: 'Manager Barsha',
      phone: '+97147773344',
      email: 'barsha@test.com',
      commissionPercent: 10,
      services: ['ac_repair', 'electrical_fix', 'battery_replacement', 'oil_change', 'annual_inspection', 'dent_repair', 'scratch_removal', 'brake_repair', 'engine_repair'],
      areas: ['Al Barsha', 'Silicon Oasis', 'Al Quoz', 'Downtown Dubai', 'Khalifa City', 'Al Khalidiyah'],
      status: 'active',
      rating: 4.6,
      location: { lat: 25.1124, lng: 55.2062 }
    });

    const garage5 = await Garage.create({
      name: 'Downtown Car Clinic',
      contactPerson: 'Manager Downtown',
      phone: '+97149995566',
      email: 'downtown@test.com',
      commissionPercent: 10,
      services: ['minor_service', 'major_service', 'diagnostics', 'engine_repair', 'transmission_service', 'ceramic_coating', 'full_detailing', 'ac_repair', 'brake_repair'],
      areas: ['Downtown Dubai', 'Business Bay', 'Al Quoz', 'Jumeirah', 'Dubai Marina', 'Deira'],
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
      services: ['minor_service', 'major_service', 'brake_repair', 'battery_replacement', 'safety_inspection', 'annual_inspection', 'oil_change', 'steering_repair', 'suspension_repair'],
      areas: ['Mirdif', 'Silicon Oasis', 'Deira', 'Bur Dubai', 'Al Majaz', 'Al Nahda'],
      status: 'active',
      rating: 4.4,
      location: { lat: 25.2167, lng: 55.4167 }
    });

    // Seed User accounts for the garages so they can log in to Garage Portal
    await User.create({
      name: 'Al Quoz Auto Workshop',
      email: 'alquoz@test.com',
      phone: '+97144441111',
      role: 'garage',
      status: 'active',
      password: hashedPassword,
      garageId: garage1._id
    });
    await User.create({
      name: 'Deira Motors',
      email: 'deira@test.com',
      phone: '+97142223333',
      role: 'garage',
      status: 'active',
      password: hashedPassword,
      garageId: garage2._id
    });
    await User.create({
      name: 'Marina Auto Service',
      email: 'marina@test.com',
      phone: '+97148881122',
      role: 'garage',
      status: 'active',
      password: hashedPassword,
      garageId: garage3._id
    });
    await User.create({
      name: 'Al Barsha Garage Pro',
      email: 'barsha@test.com',
      phone: '+97147773344',
      role: 'garage',
      status: 'active',
      password: hashedPassword,
      garageId: garage4._id
    });
    await User.create({
      name: 'Downtown Car Clinic',
      email: 'downtown@test.com',
      phone: '+97149995566',
      role: 'garage',
      status: 'active',
      password: hashedPassword,
      garageId: garage5._id
    });
    await User.create({
      name: 'Mirdif Auto Care',
      email: 'mirdif@test.com',
      phone: '+97143336677',
      role: 'garage',
      status: 'active',
      password: hashedPassword,
      garageId: garage6._id
    });

    console.log('Seeded 6 Garages and their User accounts');

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

    // 5. Seed Catalog: Brands & Models
    const mockBrands = [
      { name: 'Toyota', models: ['Camry', 'Corolla', 'Land Cruiser', 'RAV4', 'Yaris'] },
      { name: 'Nissan', models: ['Altima', 'Sunny', 'Patrol', 'X-Trail', 'Sentra'] },
      { name: 'Honda', models: ['Civic', 'Accord', 'CR-V', 'City', 'Pilot'] },
      { name: 'BMW', models: ['3 Series', '5 Series', '7 Series', 'X5', 'X3'] },
      { name: 'Mercedes-Benz', models: ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE'] },
      { name: 'Ford', models: ['Mustang', 'Explorer', 'Edge', 'F-150', 'Ranger'] },
      { name: 'Hyundai', models: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Creta'] },
      { name: 'Audi', models: ['A4', 'A6', 'Q5', 'Q7', 'A8'] }
    ];

    for (const b of mockBrands) {
      const brand = await Brand.create({ name: b.name });
      for (const m of b.models) {
        await VehicleModel.create({ brandId: brand._id, name: m });
      }
    }
    console.log(`Seeded ${mockBrands.length} Brands and their sub-models`);

    // 6. Seed Catalog: Service Categories & Subcategories
    const mockServices = [
      {
        name: 'Mechanical Repair',
        slug: 'mechanical_repair',
        subs: ['Engine Repair', 'Brake Repair', 'Suspension Repair', 'Transmission Service', 'Steering Repair']
      },
      {
        name: 'Electrical & AC',
        slug: 'electrical_ac',
        subs: ['AC Repair', 'Battery Replacement', 'Diagnostics', 'Electrical Fix']
      },
      {
        name: 'Body & Paint',
        slug: 'body_paint',
        subs: ['Scratch Removal', 'Dent Repair', 'Ceramic Coating', 'Window Tinting', 'Full Detailing']
      },
      {
        name: 'General Maintenance',
        slug: 'general_maintenance',
        subs: ['Minor Service', 'Major Service', 'Oil Change', 'Safety Inspection', 'Annual Inspection']
      }
    ];

    for (const s of mockServices) {
      const cat = await ServiceCategory.create({ name: s.name, slug: s.slug });
      for (const subName of s.subs) {
        const subSlug = subName.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_');
        await ServiceSubCategory.create({ categoryId: cat._id, name: subName, slug: subSlug });
      }
    }
    console.log(`Seeded ${mockServices.length} Service Categories and subcategories`);

    // 7. Seed Catalog: Cities & Areas
    const mockLocations = [
      {
        city: 'Dubai',
        areas: [
          'Dubai Marina',
          'Jumeirah',
          'Downtown Dubai',
          'Silicon Oasis',
          'Al Quoz',
          'Al Barsha',
          'Mirdif',
          'Business Bay',
          'Deira',
          'Bur Dubai'
        ]
      },
      {
        city: 'Abu Dhabi',
        areas: ['Yas Island', 'Al Reem Island', 'Khalifa City', 'Al Khalidiyah']
      },
      {
        city: 'Sharjah',
        areas: ['Al Majaz', 'Al Nahda', 'Muwaileh']
      }
    ];

    for (const loc of mockLocations) {
      const city = await City.create({ name: loc.city });
      for (const area of loc.areas) {
        await Area.create({ cityId: city._id, name: area });
      }
    }
    console.log(`Seeded ${mockLocations.length} Cities and local neighborhood areas`);

    // 8. Seed Customer Vehicle (just one active vehicle linked to test customer)
    await Vehicle.create({
      userId: customer._id,
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      engineType: 'V6 Gas',
      registrationNumber: 'DXB-K-99081',
      VIN: '1T1Y1819920980AAS',
      isActive: true
    });
    console.log('Seeded 1 Customer Vehicle for test client');

    console.log('Seeding finished successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
