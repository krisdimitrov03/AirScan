(function () {
  function updateFlightOptions() {
    const originSelect = document.getElementById("originAirportSelect");
    const destinationSelect = document.getElementById(
      "destinationAirportSelect"
    );
    const flightOptionsSelect = document.getElementById("flightOptionsSelect");

    flightOptionsSelect.innerHTML = "";

    const origin = originSelect.value;
    const destination = destinationSelect.value;

    if (!origin || !destination) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Please select both origin and destination";
      flightOptionsSelect.appendChild(option);
      return;
    }

    const matchingFlights = window.flights.filter(function (flight) {
      return (
        flight.origin_airport_code === origin &&
        flight.destination_airport_code === destination
      );
    });

    if (matchingFlights.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No flights available for selected route";
      flightOptionsSelect.appendChild(option);
      return;
    }

    matchingFlights.forEach(function (flight) {
      const option = document.createElement("option");
      option.value = flight.flight_id;
      option.textContent = "Flight " + flight.flight_id;
      flightOptionsSelect.appendChild(option);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    const originSelect = document.getElementById("originAirportSelect");
    const destinationSelect = document.getElementById(
      "destinationAirportSelect"
    );

    if (originSelect && destinationSelect) {
      originSelect.addEventListener("change", updateFlightOptions);
      destinationSelect.addEventListener("change", updateFlightOptions);
    }
  });
})();
