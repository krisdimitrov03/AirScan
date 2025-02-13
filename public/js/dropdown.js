(function () {
  /**
   * Populate the airport dropdown based on the city input.
   * Searches for cities starting with the entered value (minimum 3 characters)
   * and aggregates all related airport codes.
   *
   * @param {string} cityFilterId - The ID of the city input field.
   * @param {string} airportSelectId - The ID of the airport dropdown.
   * @param {string} suggestedAirport - The airport code to preselect (if any).
   */
  function updateAirportOptions(
    cityFilterId,
    airportSelectId,
    suggestedAirport
  ) {
    const cityInput = document.getElementById(cityFilterId);
    const airportSelect = document.getElementById(airportSelectId);
    airportSelect.innerHTML = "";

    const cityQuery = cityInput.value.trim().toLowerCase();

    if (cityQuery.length < 3) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Enter at least 3 characters";
      airportSelect.appendChild(option);
      return;
    }

    let matchedAirports = [];
    for (const cityName in window.cityToAirports) {
      if (cityName.toLowerCase().startsWith(cityQuery)) {
        matchedAirports = matchedAirports.concat(
          window.cityToAirports[cityName]
        );
      }
    }

    if (matchedAirports.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No matching city";
      airportSelect.appendChild(option);
      return;
    }

    const uniqueAirports = Array.from(new Set(matchedAirports));

    uniqueAirports.forEach((airport) => {
      const option = document.createElement("option");
      option.value = airport;
      option.textContent = airport;
      if (suggestedAirport && suggestedAirport === airport) {
        option.selected = true;
      }
      airportSelect.appendChild(option);
    });
  }

  /**
   * Initializes the dropdown for a given pair of city input and airport select.
   * If a suggested airport code is present, it finds the corresponding city and pre-fills
   * the city input so the dropdown is populated with related airports.
   *
   * @param {string} cityFilterId - The ID of the city input field.
   * @param {string} airportSelectId - The ID of the airport dropdown.
   */
  function initializeDropdown(cityFilterId, airportSelectId) {
    const airportSelect = document.getElementById(airportSelectId);
    const suggestedAirport = airportSelect.getAttribute("data-suggested");
    const cityInput = document.getElementById(cityFilterId);

    if (suggestedAirport) {
      let found = false;
      for (const city in window.cityToAirports) {
        if (window.cityToAirports[city].includes(suggestedAirport)) {
          cityInput.value = city;
          updateAirportOptions(cityFilterId, airportSelectId, suggestedAirport);
          found = true;
          break;
        }
      }
      if (!found) {
        updateAirportOptions(cityFilterId, airportSelectId, suggestedAirport);
      }
    } else {
      updateAirportOptions(cityFilterId, airportSelectId);
    }

    cityInput.addEventListener("input", function () {
      const currentSuggested = airportSelect.getAttribute("data-suggested");
      updateAirportOptions(cityFilterId, airportSelectId, currentSuggested);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initializeDropdown("originCityFilter", "originAirportSelect");
    initializeDropdown("destinationCityFilter", "destinationAirportSelect");
  });
})();
