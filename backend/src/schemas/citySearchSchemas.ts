import z from "zod";

const CitySearchQuerySchema = z.object({
	city: z
		.string({ error: "Only one city name must be provided" })
		.trim()
		.min(1, { error: "City name cannot be empty" }),
	country: z.preprocess(
		(value) => (value === undefined || value === "" ? null : value),
		z
			.string({ error: "Country must be a string" })
			.trim()
			.length(2, { error: "Country must be a 2-letter code" })
			.nullable(),
	),
});

export { CitySearchQuerySchema };
