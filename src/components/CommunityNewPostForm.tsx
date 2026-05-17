"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  COMMUNITY_DEFAULT_CATEGORY,
  type CommunityPost
} from "@/lib/community-types";
import { communityHeaders, compressImageToDataUrl } from "@/lib/community-client";

export function CommunityNewPostForm() {
  const router = useRouter();
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState<Awaited<ReturnType<typeof compressImageToDataUrl>> | null>(null);
  const [imageName, setImageName] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setImage(null);
      setImageName("");
      return;
    }

    try {
      setStatus("正在压缩图片...");
      const compressed = await compressImageToDataUrl(file);
      setImage(compressed);
      setImageName(file.name);
      setStatus("图片已压缩到 1MB 内");
    } catch (error) {
      setImage(null);
      setImageName("");
      setStatus(error instanceof Error ? error.message : "图片处理失败");
      event.target.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("正在发帖...");

    try {
      const response = await fetch("/api/community/posts", {
        method: "POST",
        headers: communityHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({
          author,
          title,
          body,
          category: category || COMMUNITY_DEFAULT_CATEGORY,
          image
        })
      });
      const payload = (await response.json()) as { post?: CommunityPost; error?: string };

      if (!response.ok || !payload.post) {
        throw new Error(payload.error || "发帖失败");
      }

      router.push(`/posts/community-${payload.post.id}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "发帖失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="community-form community-form-page" onSubmit={handleSubmit}>
      <label>
        发帖人
        <input value={author} onChange={(event) => setAuthor(event.target.value)} placeholder="粉爪观察员" maxLength={24} />
      </label>

      <label>
        标题
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="写一个醒目的标题" maxLength={80} required />
      </label>

      <label>
        类别
        <input value={category} onChange={(event) => setCategory(event.target.value)} placeholder={COMMUNITY_DEFAULT_CATEGORY} maxLength={12} />
      </label>

      <label>
        内容
        <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="分享你的异环笔记、问题或发现" maxLength={4000} required />
      </label>

      <label>
        图片
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} />
        <small>{imageName || "不上传会随机选一张现有插图，上传图片会压缩到 1MB 内"}</small>
      </label>

      {status ? <p className="form-status">{status}</p> : null}

      <button type="submit" className="primary-action" disabled={busy}>
        {busy ? "发布中..." : "发布"}
      </button>
    </form>
  );
}
