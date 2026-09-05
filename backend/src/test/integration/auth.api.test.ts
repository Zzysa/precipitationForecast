import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import * as argon2 from "argon2";
import { prisma } from "../../db/prisma.js";
import { app } from "../../server.js";

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

	it("returns 500 when username is already taken", async () => {
		await request(app).post("/api/auth/register").send(body);

		const res = await request(app).post("/api/auth/register").send(body);

		expect(res.status).toBe(500);
		expect(await prisma.user.count()).toBe(1);
	});

	it("returns 400 for an invalid body", async () => {
		const res = await request(app).post("/api/auth/register").send({});

		expect(res.status).toBe(400);
		expect(res.body.error).toEqual(expect.any(Array));
		expect(await prisma.user.count()).toBe(0);
	});
});
