interface CitySearchResultDTO {
	cityId: number | null;
	name: string;
	state: string | null;
	country: string;
	lat: number;
	lon: number;
	isFavorite: boolean;
	isInSearchHistory: boolean;
}

export type { CitySearchResultDTO };
