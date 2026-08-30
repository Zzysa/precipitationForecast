import z from "zod";

const CityParamsSchema = z.object({
	city: z
		.string({ error: "Only one city name must be provided" })
		.trim()
		.min(1, { error: "City name cannot be empty" }),
});

const CityIdParamsSchema = z.object({
	cityId: z.coerce
		.number({ error: "City id must be a number" })
		.int({ error: "City id must be an integer" })
		.positive({ error: "City id must be a positive number" }),
});

const CreateFavoriteBodySchema = z.object({
	name: z.string().trim().min(1),
	state: z.string().trim().min(1).nullable(),
	country: z.string().trim().min(1),
	lat: z.number(),
	lon: z.number(),
});

type CreateFavoriteInputType = z.infer<typeof CreateFavoriteBodySchema>;

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

export {
	CityParamsSchema,
	CityIdParamsSchema,
	CreateFavoriteBodySchema,
	CitySearchQuerySchema,
};
export type { CreateFavoriteInputType };
