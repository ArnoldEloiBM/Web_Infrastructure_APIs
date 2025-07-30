let allCountries = [];
let filteredCountries = [];

const loadcountryAPI = () => {
    fetch(`https://restcountries.com/v3.1/all?fields=name,capital,population,flags,region`)
    .then(res => res.json())
    .then(data => {
        allCountries = data;
        filteredCountries = data;
        populateRegionFilter();
        populateLetterFilter();
        displayCountries();
    })
    .catch(error => console.error('Error fetching countries:', error));
}

// Regional Filter with a dropdown option
function populateRegionFilter() {
    const regions = Array.from(new Set(allCountries.map(c => c.region).filter(Boolean)));
    const regionFilter = document.getElementById('regionFilter');
    regions.sort().forEach(region => {
        const opt = document.createElement('option');
        opt.value = region;
        opt.textContent = region;
        regionFilter.appendChild(opt);
    });
}

// Letter Filterwith a dropdown option
function populateLetterFilter() {
    const letters = Array.from(new Set(allCountries.map(c => c.name.common[0].toUpperCase())));
    const letterFilter = document.getElementById('letterFilter');
    letters.sort().forEach(letter => {
        const opt = document.createElement('option');
        opt.value = letter;
        opt.textContent = letter;
        letterFilter.appendChild(opt);
    });
}

// Highlighted Country and displays the highlighted country in a larger card format
function displayCountries(highlighted = null) {
    const container = document.getElementById('countries');
    const highlightedContainer = document.getElementById('highlighted-country');
    let countriesToShow = filteredCountries;
    if (highlighted) {
        highlightedContainer.innerHTML = getCountryCard(highlighted, true);
        countriesToShow = filteredCountries.filter(c => c.name.common !== highlighted.name.common);
    } else {
        highlightedContainer.innerHTML = '';
    }
    container.innerHTML = countriesToShow.map(c => getCountryCard(c, false)).join('');
}

//Generating the HTML for each country card -  a function that creates a card for each country with its flag, name, capital, population, and region.
function getCountryCard(country, big = false) {
    return `<div class="country-card${big ? ' big' : ''}">
        ${country.flags ? `<img class="country-flag" src="${country.flags.png}" alt="Flag of ${country.name.common}">` : ''}
        <h2>${country.name.common}</h2>
        <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</p>
        <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
        <p><strong>Region:</strong> ${country.region}</p>
    </div>`;
}

// This applies all filters based on the selected region, first letter of the country name, and population size.
function applyFilters() {
    const region = document.getElementById('regionFilter').value;
    const letter = document.getElementById('letterFilter').value;
    const population = document.getElementById('populationFilter').value;
    filteredCountries = allCountries.filter(c => {
        let match = true;
        if (region && c.region !== region) match = false;
        if (letter && c.name.common[0].toUpperCase() !== letter) match = false;
        if (population) {
            if (population === 'small' && c.population >= 1_000_000) match = false;
            if (population === 'medium' && (c.population < 1_000_000 || c.population > 10_000_000)) match = false;
            if (population === 'large' && (c.population < 10_000_000 || c.population > 100_000_000)) match = false;
            if (population === 'huge' && c.population <= 100_000_000) match = false;
        }
        return match;
    });
    displayCountries();
}

// Event listeners for search and filter functionality.
document.addEventListener('DOMContentLoaded', () => {
    loadcountryAPI();
    document.getElementById('searchBtn').addEventListener('click', () => {
        const searchValue = document.getElementById('searchInput').value.trim().toLowerCase();
        if (!searchValue) {
            displayCountries();
            return;
        }
        const found = allCountries.find(c => c.name.common.toLowerCase() === searchValue);
        if (found) {
            displayCountries(found);
        } else {
            document.getElementById('highlighted-country').innerHTML = `<div class='country-card big'><p>Country not found.</p></div>`;
            document.getElementById('countries').innerHTML = '';
        }
    });
    document.getElementById('regionFilter').addEventListener('change', applyFilters);
    document.getElementById('letterFilter').addEventListener('change', applyFilters);
    document.getElementById('populationFilter').addEventListener('change', applyFilters);
});