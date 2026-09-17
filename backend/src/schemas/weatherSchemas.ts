import z from "zod";

const WeatherQuerySchema = z
	.object({
		lat: z.coerce.number().min(-90).max(90).optional(),
		lon: z.coerce.number().min(-180).max(180).optional(),
	})
	.refine((value) => (value.lat === undefined) === (value.lon === undefined), {
		message: "Latitude and longitude must be provided together",
	});

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

export {
	CityParamsSchema,
	CityIdParamsSchema,
	CreateFavoriteBodySchema,
	WeatherQuerySchema,
};
export type { CreateFavoriteInputType };
