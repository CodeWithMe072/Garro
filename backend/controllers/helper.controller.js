import Helper from '../models/Helper.js';
import HelperBookingSlot from '../models/HelperBookingSlot.js';
import Request from '../models/Request.js';
import { success, error } from '../utils/response.js';

export const SERVICE_DURATION_MAP = {
  minor_service: 2, // hours
  major_service: 4,
  ac_repair: 3,
  brake_repair: 2,
  electrical: 3,
  diagnostics: 1.5,
  battery: 1,
  other: 2
};

const BUFFER_MINUTES = 30; // minimum buffer between jobs
const MAX_BUFFER_HOURS = 4; // max buffer = 4 hrs (job duration can't exceed this)

// Compute buffer after a slot: equal to the job's own duration, capped at MAX_BUFFER_HOURS
const getSlotBuffer = (slot) => {
  const durMs = new Date(slot.endTime) - new Date(slot.startTime);
  const durHours = durMs / (1000 * 60 * 60);
  const bufferHours = Math.min(durHours, MAX_BUFFER_HOURS);
  return bufferHours * 60 * 60 * 1000;
};

// Helper function to verify availability of a helper for a given window
export const checkHelperAvailability = async (helper, startTime, endTime, excludeBookingId = null) => {
  // 1. Working hours check
  const timezone = helper.workingHours?.timezone || 'Asia/Dubai';
  const schedule = helper.workingHours?.schedule?.length ? helper.workingHours.schedule : [
    { day: 'monday', isWorking: true, startTime: '09:00', endTime: '21:00' },
    { day: 'tuesday', isWorking: true, startTime: '09:00', endTime: '21:00' },
    { day: 'wednesday', isWorking: true, startTime: '09:00', endTime: '21:00' },
    { day: 'thursday', isWorking: true, startTime: '09:00', endTime: '21:00' },
    { day: 'friday', isWorking: true, startTime: '09:00', endTime: '21:00' },
    { day: 'saturday', isWorking: true, startTime: '09:00', endTime: '21:00' },
    { day: 'sunday', isWorking: true, startTime: '09:00', endTime: '21:00' }
  ];

  // Format parts to parse day and local hours/minutes
  const formatDay = (date, tz) => {
    return new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long' }).format(date).toLowerCase();
  };

  const formatTimeStr = (date, tz) => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    }).formatToParts(date);
    const hour = parts.find(p => p.type === 'hour').value;
    const minute = parts.find(p => p.type === 'minute').value;
    return `${hour}:${minute}`;
  };

  const startDay = formatDay(startTime, timezone);
  const endDay = formatDay(endTime, timezone);

  const startSchedule = schedule.find(s => s.day === startDay);
  if (!startSchedule || !startSchedule.isWorking) return false;

  const startLocalTime = formatTimeStr(startTime, timezone);
  const endLocalTime = formatTimeStr(endTime, timezone);

  // Check start boundary
  if (startLocalTime < startSchedule.startTime || startLocalTime > startSchedule.endTime) {
    return false;
  }

  // Check end boundary (if multi-day check both days)
  if (startDay !== endDay) {
    const endSchedule = schedule.find(s => s.day === endDay);
    if (!endSchedule || !endSchedule.isWorking) return false;
    if (endLocalTime < endSchedule.startTime || endLocalTime > endSchedule.endTime) {
      return false;
    }
  } else {
    if (endLocalTime > startSchedule.endTime) {
      return false;
    }
  }

  // 2. Overlap check with existing booking slots
  // A new slot is invalid if it starts before an existing slot's endTime + buffer,
  // OR ends after an existing slot's startTime.
  const query = {
    helperId: helper._id,
    status: { $in: ['reserved', 'in_progress'] }
  };
  if (excludeBookingId) {
    query.bookingId = { $ne: excludeBookingId };
  }
  const activeSlots = await HelperBookingSlot.find(query);

  for (const slot of activeSlots) {
    const slotBuffer = getSlotBuffer(slot);
    const slotEnd   = new Date(slot.endTime).getTime() + slotBuffer;
    const slotStart = new Date(slot.startTime).getTime();
    const reqStart  = startTime.getTime();
    const reqEnd    = endTime.getTime();
    // Overlap: new job starts before buffered end AND new job ends after job start
    if (reqStart < slotEnd && reqEnd > slotStart) {
      return false;
    }
  }

  return true;
};

// GET /api/helpers/available
// Params: date, startTime, endTime, or requestId
export const getAvailableHelpers = async (req, res) => {
  try {
    let start, end;
    
    const { date, startTime, endTime, requestId } = req.query;

    if (requestId) {
      const request = await Request.findById(requestId);
      if (!request) return error(res, 'Request not found', 404);
      
      start = request.preferredDate || new Date();
      const durationHours = SERVICE_DURATION_MAP[request.serviceType] || 2;
      end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
    } else if (date && startTime && endTime) {
      // Dubai is UTC+4. Parse the local date-time strings in Dubai timezone (UTC+4)
      const cleanStartStr = startTime.includes('+') || startTime.includes('Z') ? startTime : `${startTime}+04:00`;
      const cleanEndStr = endTime.includes('+') || endTime.includes('Z') ? endTime : `${endTime}+04:00`;
      start = new Date(`${date}T${cleanStartStr}`);
      end = new Date(`${date}T${cleanEndStr}`);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return error(res, 'Invalid date or time formats. Must be YYYY-MM-DD and HH:MM', 400);
      }
    } else {
      // Fallback: assume check for next 2 hours starting now
      start = new Date();
      end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    }

    const helpers = await Helper.find().populate('garageId', 'name');
    const availableHelpers = [];

    for (const helper of helpers) {
      const isAvailable = await checkHelperAvailability(helper, start, end, requestId);
      if (isAvailable) {
        // Fetch upcoming 3 slots for admin context
        const upcomingSlots = await HelperBookingSlot.find({
          helperId: helper._id,
          status: { $in: ['reserved', 'in_progress'] },
          startTime: { $gte: new Date() }
        })
        .sort({ startTime: 1 })
        .limit(3)
        .populate('bookingId', 'serviceType');

        availableHelpers.push({
          ...helper.toObject(),
          upcomingSlots
        });
      }
    }

    success(res, { helpers: availableHelpers });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/helpers/:helperId/schedule
// Params: date (YYYY-MM-DD)
export const getHelperSchedule = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return error(res, 'Date query parameter is required', 400);

    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const slots = await HelperBookingSlot.find({
      helperId: req.params.helperId,
      status: { $in: ['reserved', 'in_progress', 'completed'] },
      startTime: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ startTime: 1 });

    success(res, { slots });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// PATCH /api/helpers/:helperId/working-hours
export const updateWorkingHours = async (req, res) => {
  try {
    const { workingHours } = req.body;
    if (!workingHours) return error(res, 'workingHours payload is required', 400);

    const helper = await Helper.findByIdAndUpdate(
      req.params.helperId,
      { workingHours },
      { new: true }
    );
    if (!helper) return error(res, 'Helper not found', 404);

    success(res, { helper, message: 'Working hours schedule updated successfully.' });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// Legacy support endpoints for existing routes
export const getHelpers = async (req, res) => {
  try {
    const helpers = await Helper.find().populate('garageId', 'name');
    success(res, { helpers });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const createHelper = async (req, res) => {
  try {
    const helper = await Helper.create(req.body);
    success(res, { helper }, 201);
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const updateHelper = async (req, res) => {
  try {
    const helper = await Helper.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!helper) return error(res, 'Helper not found', 404);
    success(res, { helper });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const toggleAvailability = async (req, res) => {
  try {
    const helper = await Helper.findById(req.params.id);
    if (!helper) return error(res, 'Helper not found', 404);
    helper.isAvailable = !helper.isAvailable;
    await helper.save();
    success(res, { helper });
  } catch (err) {
    error(res, err.message, 500);
  }
};
