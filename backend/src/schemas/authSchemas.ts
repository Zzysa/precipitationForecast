import z from "zod";

const RegisterBodySchema = z.object({
	username: z
		.string({ error: "Username must be a string" })
		.trim()
		.min(3, { error: "Username must contain at least 3 characters" })
		.max(30, { error: "Username must contain at most 30 characters" }),
	password: z
		.string({ error: "Password must be a string" })
		.min(12, { error: "Password must contain at least 12 characters" })
		.max(128, { error: "Password must contain at most 128 characters" }),
});

type RegisterBodyType = z.infer<typeof RegisterBodySchema>;

const LoginBodySchema = RegisterBodySchema;
type LoginBodyType = RegisterBodyType;

export type { RegisterBodyType, LoginBodyType };
export { RegisterBodySchema, LoginBodySchema };
