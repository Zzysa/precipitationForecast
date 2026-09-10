import { jwtVerify, SignJWT } from "jose";

const getSecret = () => {
	const secret = process.env.JWT_SECRET;

	if (!secret) {
		throw new Error("JWT_SECRET is not set");
	}

	return new TextEncoder().encode(secret);
};

const verifyToken = async (token: string) => {
	const { payload } = await jwtVerify(token, getSecret());

	return payload;
};

const createToken = async (userId: number) => {
	return new SignJWT()
		.setProtectedHeader({ alg: "HS256" })
		.setSubject(String(userId))
		.setIssuedAt()
		.setExpirationTime("1h")
		.sign(getSecret());
};

export { verifyToken, createToken };
