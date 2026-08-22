import z from "zod";

const CityParamsSchema = z.object({
	city: z
		.string({ error: "Only one city name must be provided" })
		.trim()
		.min(1, { error: "City name cannot be empty" }),
});

export { CityParamsSchema };
