(function () {
  /**
   * Populates the airport dropdown based on the city input.
   * Searches for cities starting with the entered value (min. 3 characters)
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

    // Require at least 3 characters to search.
    if (cityQuery.length < 3) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Enter at least 3 characters";
      airportSelect.appendChild(option);
      return;
    }

    // Gather all airports from cities that start with the query.
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

    // Remove duplicate airport codes.
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
   * Initializes the dropdown for a given city input and airport select.
   * If a suggested airport code is provided, it pre-fills the city input
   * with the corresponding full city name.
   *
   * @param {string} cityFilterId - The ID of the city input.
   * @param {string} airportSelectId - The ID of the airport select.
   */
  function initializeDropdown(cityFilterId, airportSelectId) {
    const airportSelect = document.getElementById(airportSelectId);
    const cityInput = document.getElementById(cityFilterId);
    const suggestedAirport = airportSelect.getAttribute("data-suggested");

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

    airportSelect.addEventListener("change", function () {
      const selectedAirport = airportSelect.value;
      let foundCity = "";
      for (const city in window.cityToAirports) {
        if (window.cityToAirports[city].includes(selectedAirport)) {
          foundCity = city;
          break;
        }
      }
      if (foundCity) {
        cityInput.value = foundCity;
        updateAirportOptions(cityFilterId, airportSelectId, selectedAirport);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    // Initialize dropdowns if the corresponding elements exist.
    if (
      document.getElementById("originCityFilter") &&
      document.getElementById("originAirportSelect")
    ) {
      initializeDropdown("originCityFilter", "originAirportSelect");
    }
    if (
      document.getElementById("destinationCityFilter") &&
      document.getElementById("destinationAirportSelect")
    ) {
      initializeDropdown("destinationCityFilter", "destinationAirportSelect");
    }
    if (
      document.getElementById("airportCityFilter") &&
      document.getElementById("airportSelect")
    ) {
      initializeDropdown("airportCityFilter", "airportSelect");
    }
  });
})();
