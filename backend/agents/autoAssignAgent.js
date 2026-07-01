const { GoogleGenAI } = require('@google/genai');
const Garage  = require('../models/Garage');
const Helper  = require('../models/Helper');
const Quote   = require('../models/Quote');
const { haversine } = require('../utils/haversine');

// ─── Tool 1: Find nearest garages ───────────────────────────────────────────
async function findNearestGarages({ requestLat, requestLng, serviceType }) {
  const garages = await Garage.find({ status: 'active', services: serviceType });

  if (garages.length === 0) {
    return { garages: [], message: 'No active garages found for this service type' };
  }

  const withDistance = garages
    .filter(g => g.location && g.location.lat && g.location.lng)
    .map(g => ({
      garageId:   g._id.toString(),
      name:       g.name,
      rating:     g.rating,
      distance:   parseFloat(haversine(requestLat, requestLng, g.location.lat, g.location.lng).toFixed(2)),
      commission: g.commissionPercent
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);

  return { garages: withDistance };
}

// ─── Tool 2: Find available helper ──────────────────────────────────────────
async function findAvailableHelper({ garageId }) {
  let helpers = await Helper.find({ garageId, isAvailable: true }).sort({ rating: -1 });

  if (helpers.length === 0) {
    // Fallback: If no helper is strictly free, get any helper at this garage
    helpers = await Helper.find({ garageId }).sort({ rating: -1 });
  }

  if (helpers.length === 0) {
    return { helper: null, message: 'No helpers registered at this garage' };
  }

  const best = helpers[0];
  return {
    helper: {
      helperId: best._id.toString(),
      name:     best.name,
      phone:    best.phone,
      rating:   best.rating
    }
  };
}

// ─── Tool 3: Estimate cost ───────────────────────────────────────────────────
async function getBestQuoteEstimate({ garageId, serviceType }) {
  // Get last 5 approved quotes from this garage for this service type
  const jobs = await Quote.find({ garageId, status: 'approved' })
    .populate({ path: 'requestId', match: { serviceType } })
    .sort({ createdAt: -1 })
    .limit(5);

  const validJobs = jobs.filter(q => q.requestId);

  if (validJobs.length === 0) {
    const defaults = {
      minor_service: 350, major_service: 700, ac_repair: 450,
      brake_repair: 300, electrical: 400, diagnostics: 200,
      battery: 250, other: 300
    };
    return { estimatedCost: defaults[serviceType] || 300, source: 'default' };
  }

  const avg = validJobs.reduce((sum, q) => sum + q.customerTotal, 0) / validJobs.length;
  return { estimatedCost: Math.round(avg), source: 'historical' };
}

// ─── Tool definitions for Gemini ────────────────────────────────────────────
const tools = [{
  functionDeclarations: [
    {
      name: 'findNearestGarages',
      description: 'Find the nearest active garages that offer the requested service type, sorted by distance',
      parameters: {
        type: 'object',
        properties: {
          requestLat:  { type: 'number', description: 'Latitude of customer request location' },
          requestLng:  { type: 'number', description: 'Longitude of customer request location' },
          serviceType: { type: 'string', description: 'Type of car service requested' }
        },
        required: ['requestLat', 'requestLng', 'serviceType']
      }
    },
    {
      name: 'findAvailableHelper',
      description: 'Find the best available (free) helper at a specific garage, sorted by rating',
      parameters: {
        type: 'object',
        properties: {
          garageId: { type: 'string', description: 'MongoDB ObjectId of the garage' }
        },
        required: ['garageId']
      }
    },
    {
      name: 'getBestQuoteEstimate',
      description: 'Get estimated cost for a service at a garage based on historical quotes',
      parameters: {
        type: 'object',
        properties: {
          garageId:    { type: 'string', description: 'MongoDB ObjectId of the garage' },
          serviceType: { type: 'string', description: 'Type of car service' }
        },
        required: ['garageId', 'serviceType']
      }
    }
  ]
}];

// ─── Tool executor ───────────────────────────────────────────────────────────
async function executeTool(name, args) {
  if (name === 'findNearestGarages')  return await findNearestGarages(args);
  if (name === 'findAvailableHelper') return await findAvailableHelper(args);
  if (name === 'getBestQuoteEstimate') return await getBestQuoteEstimate(args);
  return { error: 'Unknown tool' };
}

// ─── Main agent runner ───────────────────────────────────────────────────────
exports.runAutoAssign = async (request) => {
  const { location, serviceType } = request;

  if (!location || !location.lat || !location.lng) {
    throw new Error('Request location (lat/lng) is required for auto-assign');
  }

  const runFallback = async () => {
    // Step 1: Find nearest garages
    const garagesResult = await findNearestGarages({
      requestLat: location.lat,
      requestLng: location.lng,
      serviceType
    });
    
    if (!garagesResult.garages || garagesResult.garages.length === 0) {
      throw new Error(`No active garages found for service type: ${serviceType}`);
    }
    
    // Step 2 & 3: Find first available helper
    let selectedGarage = null;
    let selectedHelper = null;
    
    for (const g of garagesResult.garages) {
      const helperResult = await findAvailableHelper({ garageId: g.garageId });
      if (helperResult.helper) {
        selectedGarage = g;
        selectedHelper = helperResult.helper;
        break;
      }
    }
    
    if (!selectedGarage || !selectedHelper) {
      throw new Error('No available helpers found at any nearby garage');
    }
    
    // Step 4: Estimate cost
    const quoteResult = await getBestQuoteEstimate({
      garageId: selectedGarage.garageId,
      serviceType
    });
    
    return {
      garageId: selectedGarage.garageId,
      garageName: selectedGarage.name,
      helperId: selectedHelper.helperId,
      helperName: selectedHelper.name,
      estimatedCost: quoteResult.estimatedCost,
      reason: `Rule-based fallback: Nearest garage with available helper (${selectedGarage.distance}km away).`
    };
  };

  // --- Rule-based Fallback if GOOGLE_API_KEY is not defined ---
  if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY.trim() === '') {
    console.warn('⚠️ GOOGLE_API_KEY is not set in .env. Falling back to rule-based matching execution.');
    return await runFallback();
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

    const systemPrompt = `You are Garro's auto-assignment agent for a UAE car service marketplace.
Your job is to find the best garage and helper for a customer's service request.

Rules:
1. Call findNearestGarages first to get the top 3 closest garages
2. For the TOP garage (closest + best rated), call findAvailableHelper
3. If no helper is available at the top garage, try the second closest
4. Call getBestQuoteEstimate for the selected garage
5. Return your final decision as JSON: { garageId, garageName, helperId, helperName, estimatedCost, reason }

Always prefer: closest distance first, then highest rating if distances are similar (within 2km).`;

    const userMessage = `New service request:
- Service Type: ${serviceType}
- Customer Location: lat=${location.lat}, lng=${location.lng}
- Request ID: ${request._id}

Find the best garage and available helper for this request.`;

    const messages = [{ role: 'user', parts: [{ text: userMessage }] }];
    const model = 'gemini-2.0-flash';

    // Agentic loop — Gemini calls tools until it gives a final text response
    let iterations = 0;
    const MAX_ITERATIONS = 10;

    while (iterations < MAX_ITERATIONS) {
      iterations++;

      const response = await ai.models.generateContent({
        model,
        systemInstruction: systemPrompt,
        contents: messages,
        tools,
        config: { temperature: 0.1 } // low temp = consistent decisions
      });

      const candidate = response.candidates[0];
      const parts     = candidate.content.parts;

      // Push assistant response to history
      messages.push({ role: 'model', parts });

      // Check if Gemini wants to call tools
      const toolCalls = parts.filter(p => p.functionCall);

      if (toolCalls.length === 0) {
        // No more tool calls — extract final answer from text
        const textPart = parts.find(p => p.text);
        if (!textPart) throw new Error('Agent gave no final response');

        const raw = textPart.text.replace(/```json|```/g, '').trim();

        // Find JSON in the response
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Agent response contained no valid JSON');

        const result = JSON.parse(jsonMatch[0]);
        return result;
      }

      // Execute all tool calls and push results back
      const toolResults = [];
      for (const part of toolCalls) {
        const { name, args } = part.functionCall;
        console.log(`[ADK] Calling tool: ${name}`, args);
        const result = await executeTool(name, args);
        console.log(`[ADK] Tool result:`, result);
        toolResults.push({
          functionResponse: { name, response: result }
        });
      }

      messages.push({ role: 'user', parts: toolResults });
    }

    throw new Error('Auto-assign agent exceeded maximum iterations');
  } catch (aiError) {
    console.warn(`⚠️ Auto-assign AI agent failed: ${aiError.message}. Falling back to rule-based matching.`);
    return await runFallback();
  }
};
