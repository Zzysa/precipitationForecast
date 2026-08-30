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

const CitySearchQuerySchema = z.object({
	city: z
	  .string({ error: "Only one city name must be provided" })
	  .trim()
	  .min(1, { error: "City name cannot be empty" }),
	country: z
	  .string({ error: "Only one city name must be provided" })
	  .trim()
	  .min(2)
	  .optional(),
  });

export { CityParamsSchema, CityIdParamsSchema };
