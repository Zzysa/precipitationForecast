import type { OWGeocodingResponse } from "../dtos/openWeather.dto.js";
import type { CitySearchResultDTO } from "../dtos/weather.dto.js";
import { mapGeocodingToCitySearchResult } from "../mappers/citySearch.mapper.js";

const fetchCitySearch = async (city: string, country: string | null) => {
	const q = country ? `${city},${country}` : city;

	const response = await fetch(
		`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=5&appid=${process.env.WEATHER_API_KEY}`,
	);

	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(errorBody);
	}

	return response;
};

const getCitySearchByCityAndCountry = async (
	city: string,
	country: string | null,
): Promise<CitySearchResultDTO[]> => {
	const response = await fetchCitySearch(city, country);
	const raw = (await response.json()) as OWGeocodingResponse;

	return mapGeocodingToCitySearchResult(raw);
};

export { getCitySearchByCityAndCountry };
