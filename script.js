// Fetching Data from the REST Countries API
async function fetchData() {
    try {
        const searchInput = document.getElementById('search');
        const countryName = searchInput.value.trim();

        // Basic validation for empty input
        if (!countryName) {
            console.warn("Please enter a country name.");
            document.getElementById('flag').style.display = 'none';
            document.getElementById('CountryName').textContent = '';
            document.getElementById('CapitalCity').textContent = '';
            document.getElementById('Population').textContent = '';
            document.getElementById('Region').textContent = '';
            return;
        }

        const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Country "${countryName}" not found. Please check the spelling.`);
            }
            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data && data.length > 0 && data[0].flags && data[0].flags.svg) {
            const country = data[0];

            // Show the country information division
            document.getElementById('countryInfo').style.display = 'flex';

            // Country Information
            const flagImageElement = document.getElementById('flag');
            flagImageElement.src = country.flags.svg;
            flagImageElement.alt = `Flag of ${country.name.common}`;
            flagImageElement.style.display = 'block';
            document.getElementById('CountryName').textContent = country.name.common || 'N/A';
            document.getElementById('CapitalCity').textContent = 'Capital: ' + (country.capital ? country.capital[0] : 'N/A');
            document.getElementById('Population').textContent = 'Population: ' + (country.population ? country.population.toLocaleString() : 'N/A');
            document.getElementById('Region').textContent = 'Region: ' + (country.region || 'N/A');
            document.getElementById('errorMessage').textContent = '';
        } else {
            throw new Error('Country data or flag information not available for this search.');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('flag').style.display = 'none';
        document.getElementById('CountryName').textContent = '';
        document.getElementById('CapitalCity').textContent = '';
        document.getElementById('Population').textContent = '';
        document.getElementById('Region').textContent = '';
        document.getElementById('errorMessage').textContent = error.message;
    }
}

// Toggle Mode functionality for switching between light and dark modes
document.addEventListener('DOMContentLoaded', function () {
    const modeToggle = document.getElementById('mode-toggle');
    const body = document.body;
    const navbar = document.querySelector('.navbar');
    const countryInfo = document.getElementById('countryInfo');
    const footer = document.querySelector('footer');

    // Set initial mode to dark
    body.classList.remove('light-mode');
    navbar.classList.remove('light-mode');
    countryInfo.classList.remove('light-mode');
    footer.classList.remove('light-mode');


    // Set the light-mode
    modeToggle.addEventListener('click', function () {
        body.classList.toggle('light-mode');
        navbar.classList.toggle('light-mode');
        countryInfo.classList.toggle('light-mode');
        footer.classList.toggle('light-mode');
        modeToggle.textContent = body.classList.contains('light-mode') ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    });
});