import type { CitySearchResultDTO } from "../dtos/citySearch.dto.js";
import type { OWGeocodingResponse } from "../dtos/openWeather.dto.js";
import type { City } from "@prisma/client";

type SourceCity = City | OWGeocodingResponse[number];

interface SearchFlags {
	isFavorite: boolean;
	isInSearchHistory: boolean;
}

const mapCitiesToSearchResults = (
	cities: SourceCity[],
	flags: SearchFlags,
): CitySearchResultDTO[] => {
	return cities.map((city) => ({
		cityId: "id" in city ? city.id : null,
		name: city.name,
		state: city.state ?? null,
		country: city.country,
		lat: city.lat,
		lon: city.lon,
		...flags,
	}));
};

export { mapCitiesToSearchResults };
