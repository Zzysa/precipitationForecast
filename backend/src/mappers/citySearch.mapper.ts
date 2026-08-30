import type { OWGeocodingResponse } from "../dtos/openWeather.dto.js";
import type { CitySearchResultDTO } from "../dtos/weather.dto.js";

const mapGeocodingToCitySearchResult = (
	ow: OWGeocodingResponse,
): CitySearchResultDTO[] => {
	return ow.map((el) => ({
		name: el.name,
		state: el.state ?? null,
		country: el.country,
		lat: el.lat,
		lon: el.lon,
	}));
};

export { mapGeocodingToCitySearchResult };
