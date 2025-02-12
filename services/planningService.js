const OpenAI = require("openai");

const { AirportSlot, Event, DemandHistory, Flight } = require("../models");

async function suggestFlights() {
  const slots        = await AirportSlot.findAll();
  const events       = await Event.findAll();
  const demand       = await DemandHistory.findAll();
  const existingFlt  = await Flight.findAll();

  const eventsSummary = events.map(e => ({
    name: e.event_name,
    city: e.location_city,
    start: e.start_date,
    end: e.end_date,
    factor: e.expected_additional_traffic_factor
  }));
  
  const prompt = `
  Given the following data:
  - Available airport slots: ${JSON.stringify(slots, null, 2)}
  - Upcoming events: ${JSON.stringify(eventsSummary, null, 2)}
  - Historical demand records: (not shown for brevity)
  - Existing flights: (not shown for brevity)

  Propose up to 3 new flight schedules (origin -> destination, date/time),
  that might yield high demand given the events and demand patterns. 
  Focus on the best city pairs around the big events 
  and ensure we have an available slot. 
  The flight should arrive at least 2 hours before the event starts.
  Return your answer in JSON format like:

  [
    {
      "origin_airport": "...",
      "destination_airport": "...",
      "departure_time": "...",
      "arrival_time": "...",
      "rationale": "..."
    }
  ]
  `;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_SECRET,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are an expert flight planner." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 400,
  });

  let aiContent = response.choices[0].message.content;
  aiContent = aiContent.replace(/```/g, "");
  aiContent = aiContent.replace(/json/g, ""); 

  let suggestions;
  try {
    suggestions = JSON.parse(aiContent);
  } catch (err) {
    suggestions = { error: "Could not parse AI suggestions", raw: aiContent };
  }

  return suggestions;
}

module.exports = { suggestFlights };
