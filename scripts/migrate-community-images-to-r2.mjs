import { createHash, createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import postgres from "postgres";

loadEnvLocal();

const required = [
  "DATABASE_URL",
  "R2_BUCKET_NAME",
  "R2_ACCOUNT_ID",
  "R2_PUBLIC_URL",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY"
];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing ${key}`);
    process.exit(1);
  }
}

const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });

try {
  await sql`alter table public.community_posts add column if not exists image_path text`;

  const posts = await sql`
    select id, image, image_path
    from community_posts
    where image like 'data:image/%;base64,%'
    order by created_at asc
  `;

  console.log(`Found ${posts.length} base64 community images`);

  for (const post of posts) {
    const parsed = parseDataUrl(post.image);
    const key = `community/posts/${post.id}.${getImageExtension(parsed.type)}`;
    const uploaded = await putR2Object({
      key,
      body: parsed.body,
      contentType: parsed.type
    });

    await sql`
      update community_posts
      set image = ${uploaded.url}, image_path = ${uploaded.key}
      where id = ${post.id}
    `;

    console.log(`Migrated ${post.id} -> ${uploaded.url}`);
  }

  console.log("Done");
} finally {
  await sql.end();
}

function loadEnvLocal() {
  try {
    const text = readFileSync(".env.local", "utf8");

    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const index = trimmed.indexOf("=");

      if (index === -1) {
        continue;
      }

      const key = trimmed.slice(0, index).trim();
      let value = trimmed.slice(index + 1).trim();

      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      process.env[key] ??= value;
    }
  } catch {
    // The script can also run with real environment variables in production.
  }
}

function parseDataUrl(dataUrl) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(dataUrl);

  if (!match) {
    throw new Error("Unsupported image data URL");
  }

  return {
    type: match[1],
    body: Buffer.from(match[2], "base64")
  };
}

function getImageExtension(type) {
  if (type === "image/png") {
    return "png";
  }

  if (type === "image/webp") {
    return "webp";
  }

  return "jpg";
}

async function putR2Object(input) {
  const bucketName = process.env.R2_BUCKET_NAME;
  const accountId = process.env.R2_ACCOUNT_ID;
  const publicUrl = process.env.R2_PUBLIC_URL;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const pathname = `/${bucketName}/${encodeKey(input.key)}`;
  const url = `https://${host}${pathname}`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = sha256Hex(input.body);
  const canonicalHeaders = [
    `content-type:${input.contentType}`,
    `host:${host}`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${amzDate}`
  ].join("\n");
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [
    "PUT",
    pathname,
    "",
    `${canonicalHeaders}\n`,
    signedHeaders,
    payloadHash
  ].join("\n");
  const credentialScope = `${dateStamp}/auto/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest)
  ].join("\n");
  const signature = createHmac("sha256", getSignatureKey(secretAccessKey, dateStamp))
    .update(stringToSign)
    .digest("hex");

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
      "content-type": input.contentType,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate
    },
    body: input.body
  });

  if (!response.ok) {
    throw new Error(`R2 upload failed ${response.status}: ${await response.text()}`);
  }

  return {
    key: input.key,
    url: `${publicUrl.replace(/\/$/, "")}/${encodeKey(input.key)}`
  };
}

function encodeKey(key) {
  return key.split("/").map(encodeURIComponent).join("/");
}

function sha256Hex(value) {
  return createHash("sha256").update(value).digest("hex");
}

function hmac(key, value) {
  return createHmac("sha256", key).update(value).digest();
}

function getSignatureKey(secret, dateStamp) {
  const dateKey = hmac(`AWS4${secret}`, dateStamp);
  const dateRegionKey = hmac(dateKey, "auto");
  const dateRegionServiceKey = hmac(dateRegionKey, "s3");
  return hmac(dateRegionServiceKey, "aws4_request");
}
