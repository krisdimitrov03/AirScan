const OpenAI = require("openai");
const { AirportSlot, Event } = require("../models");
const { Op, Sequelize } = require("sequelize");
const cityToAirports = require("../config/cityToAirports");
const moment = require("moment");

async function suggestFlights() {
  const events = await Event.findAll({
    order: Sequelize.literal("RAND()"),
    limit: 3,
  });

  const eventsData = await Promise.all(
    events.map(async (event) => {
      const city = event.location_city;
      const airports = cityToAirports[city] || [];
      const eventStart = moment(event.start_date, "YYYY-MM-DD");
      const slotStartDate = eventStart
        .clone()
        .subtract(2, "days")
        .format("YYYY-MM-DD");
      const slotEndDate = eventStart.format("YYYY-MM-DD");

      const slots = await AirportSlot.findAll({
        where: {
          airport_code: airports,
          date: { [Op.between]: [slotStartDate, slotEndDate] },
        },
      });

      return {
        name: event.event_name,
        city,
        start: event.start_date,
        end: event.end_date,
        factor: event.expected_additional_traffic_factor,
        availableSlots: slots.map((s) => ({
          airport_code: s.airport_code,
          date: s.date,
          time_slot_start: s.time_slot_start,
          time_slot_end: s.time_slot_end,
        })),
      };
    })
  );

  const prompt = `
Given the following upcoming events and their available airport slots, propose up to 3 new flight schedules (origin -> destination, date/time) that might yield high demand. Each proposed flight must use valid IATA airport codes (e.g. "JFK", "LHR", etc.) for both the origin and destination—not city names. Ensure that each flight is timed to arrive at least 2 hours before the event starts.

Upcoming Events and Slots:
${JSON.stringify(eventsData, null, 2)}

Return your answer in JSON format exactly as follows:
[
  {
    "origin_airport": "…",  // a valid IATA code
    "destination_airport": "…",  // a valid IATA code
    "departure_time": "YYYY-MM-DD HH:mm:ss",
    "arrival_time": "YYYY-MM-DD HH:mm:ss",
    "rationale": "…"
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
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 400,
  });

  let aiContent = response.choices[0].message.content;

  aiContent = aiContent.replace(/```/g, "").trim();
  aiContent = aiContent.replace(/^json\s*/i, "");

  let suggestions;
  try {
    suggestions = JSON.parse(aiContent);
  } catch (err) {
    suggestions = { error: "Could not parse AI suggestions", raw: aiContent };
  }
  return suggestions;
}

module.exports = { suggestFlights };
