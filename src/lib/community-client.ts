import { COMMUNITY_IMAGE_MAX_BYTES } from "@/lib/community-types";

const CLIENT_ID_KEY = "beiguo-community-client-id";

export function getCommunityClientId() {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = window.localStorage.getItem(CLIENT_ID_KEY);

  if (existing) {
    return existing;
  }

  const value = crypto.randomUUID();
  window.localStorage.setItem(CLIENT_ID_KEY, value);

  return value;
}

export function communityHeaders(extra?: HeadersInit) {
  return {
    "x-community-client-id": getCommunityClientId(),
    ...extra
  };
}

export async function compressImageToDataUrl(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("只支持 jpg、png、webp 图片");
  }

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("图片压缩失败");
  }

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
  let quality = 0.86;
  let blob = await canvasToBlob(canvas, mimeType, quality);

  while (blob.size > COMMUNITY_IMAGE_MAX_BYTES && quality > 0.42) {
    quality -= 0.08;
    blob = await canvasToBlob(canvas, "image/jpeg", quality);
  }

  if (blob.size > COMMUNITY_IMAGE_MAX_BYTES) {
    throw new Error("图片压缩后仍超过 1MB，请换一张更小的图片");
  }

  return {
    dataUrl: await blobToDataUrl(blob),
    type: blob.type || mimeType,
    name: file.name
  };
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("图片压缩失败"));
        }
      },
      type,
      quality
    );
  });
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result)));
    reader.addEventListener("error", () => reject(new Error("图片读取失败")));
    reader.readAsDataURL(blob);
  });
}
