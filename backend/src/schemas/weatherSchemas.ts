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

export { CityParamsSchema, CityIdParamsSchema, CreateFavoriteBodySchema };
export type { CreateFavoriteInputType };
