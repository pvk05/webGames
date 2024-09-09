// src/lib/server/auth.ts
import { env } from '$env/dynamic/private'
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/node-postgres";
import { Lucia } from "lucia";
import { DrizzlePostgreSQLAdapter  } from "@lucia-auth/adapter-drizzle";
import { dev } from "$app/environment";

import pg from "pg";
const { Pool } = pg

const pool = new Pool({
	user: 'postgres',
	password: env.PGPASSWORD,
	host: 'localhost',
	port: 5432,
	database: 'WebGames',
});
export const db = drizzle(pool)

const userTable = pgTable("user", {
	id: text("id").primaryKey()
});

const sessionTable = pgTable("session", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date"
	}).notNull()
});

const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, userTable);


export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			// set to `true` when using HTTPS
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			// attributes has the type of DatabaseUserAttributes
			username: attributes.username
		};
	}

});
/*
declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
	}
}

interface DatabaseUserAttributes {
	username: string;
}
*/