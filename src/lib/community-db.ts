import postgres from "postgres";

let client: postgres.Sql | null = null;

export function getCommunityDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return null;
  }

  client ??= postgres(databaseUrl, {
    max: 1,
    prepare: false
  });

  return client;
}
