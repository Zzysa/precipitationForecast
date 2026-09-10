import { execSync } from "node:child_process";
import {
	PostgreSqlContainer,
	type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";

let container: StartedPostgreSqlContainer;

export const setup = async () => {
	container = await new PostgreSqlContainer("postgres:16")
		.withDatabase("precipitation_test")
		.start();

	process.env.DATABASE_URL = container.getConnectionUri();
	process.env.JWT_SECRET ??= "secret";

	execSync("npx prisma migrate deploy", {
		cwd: process.cwd(),
		env: process.env,
		stdio: "inherit",
	});
};

export const teardown = async () => {
	await container.stop();
};
