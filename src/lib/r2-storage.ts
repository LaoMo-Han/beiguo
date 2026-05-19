import { createHash, createHmac } from "node:crypto";

type R2ObjectInput = {
  key: string;
  body: Buffer;
  contentType: string;
};

type R2Config = {
  bucketName: string;
  accountId: string;
  publicUrl: string;
  accessKeyId: string;
  secretAccessKey: string;
};

const R2_REGION = "auto";
const R2_SERVICE = "s3";

export function isR2Configured() {
  return Boolean(getR2Config());
}

export async function uploadCommunityImageToR2(input: {
  dataUrl: string;
  type: string;
  postId: string;
  name?: string;
}) {
  const object = communityImageDataUrlToObject(input);
  return putR2Object(object);
}

export async function putR2Object(input: R2ObjectInput) {
  const config = getR2Config();

  if (!config) {
    throw new Error("R2 存储未配置");
  }

  const host = `${config.accountId}.r2.cloudflarestorage.com`;
  const pathname = `/${config.bucketName}/${encodeKey(input.key)}`;
  const url = `https://${host}${pathname}`;
  const now = new Date();
  const amzDate = toAmzDate(now);
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
  const credentialScope = `${dateStamp}/${R2_REGION}/${R2_SERVICE}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest)
  ].join("\n");
  const signingKey = getSignatureKey(config.secretAccessKey, dateStamp, R2_REGION, R2_SERVICE);
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      authorization: `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
      "content-type": input.contentType,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate
    },
    body: new Uint8Array(input.body)
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`R2 上传失败：${response.status} ${detail.slice(0, 180)}`);
  }

  return {
    key: input.key,
    url: `${config.publicUrl.replace(/\/$/, "")}/${encodeKey(input.key)}`
  };
}

export function communityImageDataUrlToObject(input: {
  dataUrl: string;
  type: string;
  postId: string;
  name?: string;
}): R2ObjectInput {
  const body = dataUrlToBuffer(input.dataUrl, input.type);
  const ext = getImageExtension(input.type, input.name);

  return {
    key: `community/posts/${input.postId}.${ext}`,
    body,
    contentType: input.type
  };
}

export function dataUrlToBuffer(dataUrl: string, type: string) {
  if (!dataUrl.startsWith(`data:${type};base64,`)) {
    throw new Error("图片数据无效");
  }

  const [, base64] = dataUrl.split(",");

  if (!base64) {
    throw new Error("图片数据无效");
  }

  return Buffer.from(base64, "base64");
}

function getR2Config(): R2Config | null {
  const bucketName = process.env.R2_BUCKET_NAME;
  const accountId = process.env.R2_ACCOUNT_ID;
  const publicUrl = process.env.R2_PUBLIC_URL;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!bucketName || !accountId || !publicUrl || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return { bucketName, accountId, publicUrl, accessKeyId, secretAccessKey };
}

function getImageExtension(type: string, name?: string) {
  if (type === "image/png") {
    return "png";
  }

  if (type === "image/webp") {
    return "webp";
  }

  const fromName = name?.split(".").pop()?.toLowerCase();

  if (fromName === "jpg" || fromName === "jpeg") {
    return "jpg";
  }

  return "jpg";
}

function encodeKey(key: string) {
  return key.split("/").map(encodeURIComponent).join("/");
}

function toAmzDate(date: Date) {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, "");
}

function sha256Hex(value: Buffer | string) {
  return createHash("sha256").update(value).digest("hex");
}

function hmac(key: Buffer | string, value: string) {
  return createHmac("sha256", key).update(value).digest();
}

function getSignatureKey(secret: string, dateStamp: string, regionName: string, serviceName: string) {
  const dateKey = hmac(`AWS4${secret}`, dateStamp);
  const dateRegionKey = hmac(dateKey, regionName);
  const dateRegionServiceKey = hmac(dateRegionKey, serviceName);
  return hmac(dateRegionServiceKey, "aws4_request");
}
