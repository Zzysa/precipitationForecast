import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import * as argon2 from "argon2";
import { prisma } from "../../db/prisma.js";
import { app } from "../../server.js";

process.env.JWT_SECRET = "secret";

const body = {
	username: "john",
	password: "password-strong",
};

beforeEach(async () => {
	await prisma.favorite.deleteMany();
	await prisma.searchHistory.deleteMany();
	await prisma.city.deleteMany();
	await prisma.user.deleteMany();
});

afterAll(async () => {
	await prisma.$disconnect();
});

describe("POST /api/auth/register", () => {
	it("creates a user with a hashed password", async () => {
		const res = await request(app).post("/api/auth/register").send(body);

		expect(res.status).toBe(201);

		const savedUser = await prisma.user.findUniqueOrThrow({
			where: { username: body.username },
		});

		expect(savedUser.username).toBe(body.username);
		expect(savedUser.passwordHash).not.toBe(body.password);
		expect(savedUser.passwordHash.startsWith("$argon2")).toBe(true);
		expect(await argon2.verify(savedUser.passwordHash, body.password)).toBe(
			true,
		);
	});

	it("returns 409 when username is already taken", async () => {
		await request(app).post("/api/auth/register").send(body);

		const res = await request(app).post("/api/auth/register").send(body);

		expect(res.status).toBe(409);
		expect(res.body.error).toBe("Username is already taken");
		expect(await prisma.user.count()).toBe(1);
	});

	it("returns 400 for an invalid body", async () => {
		const res = await request(app).post("/api/auth/register").send({});

		expect(res.status).toBe(400);
		expect(res.body.error).toEqual(expect.any(Array));
		expect(await prisma.user.count()).toBe(0);
	});
});

describe("POST /api/auth/login", () => {
	it("logins user", async () => {
		await request(app).post("/api/auth/register").send(body);
		const res = await request(app).post("/api/auth/login").send(body);

		expect(res.status).toBe(200);
		expect(res.body.accessToken).toBeTypeOf("string");
	});

	it("throw if password is not correct", async () => {
		await request(app).post("/api/auth/register").send(body);
		const res = await request(app)
			.post("/api/auth/login")
			.send({ ...body, password: "wrong-password" });

		expect(res.status).toBe(401);
		expect(res.body.error).toEqual("Invalid credentials");
	});

	it("throw if body is empty", async () => {
		const res = await request(app).post("/api/auth/login").send();

		expect(res.status).toBe(400);
		expect(res.body.error).toEqual(expect.any(Array));
	});
});

describe("GET /api/auth/me", () => {
	it("returns the current user", async () => {
		await request(app).post("/api/auth/register").send(body);
		const loginRes = await request(app).post("/api/auth/login").send(body);
		const savedUser = await prisma.user.findUniqueOrThrow({
			where: { username: body.username },
			select: { id: true, username: true },
		});

		const res = await request(app)
			.get("/api/auth/me")
			.set("Authorization", `Bearer ${loginRes.body.accessToken}`);

		expect(res.status).toBe(200);
		expect(res.body).toEqual({
			user: {
				id: savedUser.id,
				username: savedUser.username,
			},
		});
	});

	it("returns 401 when the token is missing", async () => {
		const res = await request(app).get("/api/auth/me");

		expect(res.status).toBe(401);
		expect(res.body).toEqual({ error: "Authentication required" });
	});

	it("returns 401 when the token is invalid", async () => {
		const res = await request(app)
			.get("/api/auth/me")
			.set("Authorization", "Bearer not-a-jwt");

		expect(res.status).toBe(401);
		expect(res.body).toEqual({ error: "Authentication required" });
	});
});
