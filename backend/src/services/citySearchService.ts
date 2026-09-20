import { prisma } from "../db/prisma.js";
import type { CitySearchResultDTO } from "../dtos/citySearch.dto.js";
import type { OWGeocodingResponse } from "../dtos/openWeather.dto.js";
import { mapCitiesToSearchResults } from "../mappers/citySearch.mapper.js";

const CITY_COORDINATE_TOLERANCE = 0.5;
const SEARCH_RESULTS_LIMIT = 10;

const normalizeText = (value: string) =>
	value
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.trim()
		.toLowerCase();

const isSameCity = (
	first: CitySearchResultDTO,
	second: CitySearchResultDTO,
) => {
	const hasSameId =
		first.cityId !== null &&
		second.cityId !== null &&
		first.cityId === second.cityId;

	if (hasSameId) {
		return true;
	}

	const hasSameName = normalizeText(first.name) === normalizeText(second.name);
	const hasSameCountry =
		normalizeText(first.country) === normalizeText(second.country);

	if (!hasSameName || !hasSameCountry) {
		return false;
	}

	const bothHaveState = first.state !== null && second.state !== null;
	const hasSameState =
		bothHaveState &&
		normalizeText(first.state!) === normalizeText(second.state!);

	if (hasSameState) {
		return true;
	}

	if (bothHaveState && !hasSameState) {
		return false;
	}

	const hasCloseCoordinates =
		(first.lat === 0 && first.lon === 0) ||
		(second.lat === 0 && second.lon === 0) ||
		(Math.abs(first.lat - second.lat) < CITY_COORDINATE_TOLERANCE &&
			Math.abs(first.lon - second.lon) < CITY_COORDINATE_TOLERANCE);

	return hasCloseCoordinates;
};

const mergeCities = (cities: CitySearchResultDTO[]) => {
	let mergedCities: CitySearchResultDTO[] = [];

	for (const city of cities) {
		const existingCity = mergedCities.find((existing) =>
			isSameCity(existing, city),
		);

		if (!existingCity) {
			mergedCities = [...mergedCities, city];
			continue;
		}

		mergedCities = mergedCities.map((existing) =>
			existing === existingCity
				? {
						...existing,
						name:
							/[^\x00-\x7F]/.test(city.name) &&
							!/[^\x00-\x7F]/.test(existing.name)
								? city.name
								: existing.name,
						cityId: existing.cityId ?? city.cityId,
						lat: existing.lat !== 0 ? existing.lat : city.lat,
						lon: existing.lon !== 0 ? existing.lon : city.lon,
						state: existing.state ?? city.state,
						isFavorite: existing.isFavorite || city.isFavorite,
						isInSearchHistory:
							existing.isInSearchHistory || city.isInSearchHistory,
					}
				: existing,
		);
	}

	return mergedCities.slice(0, SEARCH_RESULTS_LIMIT);
};

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
	userId: number | null,
): Promise<CitySearchResultDTO[]> => {
	const cityFilter = country
		? {
				name: { contains: city, mode: "insensitive" as const },
				country: { equals: country, mode: "insensitive" as const },
			}
		: {
				name: { contains: city, mode: "insensitive" as const },
			};

	let favorites: CitySearchResultDTO[] = [];
	let searchHistory: CitySearchResultDTO[] = [];

	if (userId !== null) {
		const favoritesRaw = await prisma.favorite.findMany({
			where: {
				userId,
				city: { is: cityFilter },
			},
			orderBy: { createdAt: "desc" },
			include: { city: true },
			take: 5,
		});

		favorites = mapCitiesToSearchResults(
			favoritesRaw.map(({ city }) => city),
			{ isFavorite: true, isInSearchHistory: false },
		);

		const searchHistoryRaw = await prisma.searchHistory.findMany({
			where: {
				userId,
				city: { is: cityFilter },
			},
			include: { city: true },
			orderBy: { searchedAt: "desc" },
			take: 10,
		});

		searchHistory = mapCitiesToSearchResults(
			searchHistoryRaw.map(({ city }) => city),
			{ isFavorite: false, isInSearchHistory: true },
		);
	}

	const openWeatherCitiesResponse = await fetchCitySearch(city, country);

	const openWeatherCitiesRaw =
		(await openWeatherCitiesResponse.json()) as OWGeocodingResponse;

	const openWeatherCities = mapCitiesToSearchResults(openWeatherCitiesRaw, {
		isFavorite: false,
		isInSearchHistory: false,
	});

	const allCities = [...favorites, ...searchHistory, ...openWeatherCities];

	return mergeCities(allCities);
};

export { getCitySearchByCityAndCountry };
