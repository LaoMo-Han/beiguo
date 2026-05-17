"use client";

import { useEffect, useState } from "react";
import type { CommunityPost } from "@/lib/community-types";

export function AdminCommunityPanel() {
  const [password, setPassword] = useState("");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    const response = await fetch("/api/community/posts?limit=20", { cache: "no-store" });
    const payload = (await response.json()) as { posts?: CommunityPost[] };
    setPosts(payload.posts || []);
  }

  async function deletePost(id: string) {
    setStatus("正在删除...");
    const response = await fetch(`/api/admin/community/posts/${id}`, {
      method: "DELETE",
      headers: {
        "x-admin-password": password
      }
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setStatus(payload.error || "删除失败");
      return;
    }

    setPosts((current) => current.filter((post) => post.id !== id));
    setStatus("删除成功");
  }

  return (
    <section className="admin-panel">
      <div className="module-detail-hero">
        <p className="eyebrow">ADMIN</p>
        <h1>社区帖子管理</h1>
        <p>输入管理密码后可以删除用户帖子，删除会同时移除对应评论、点赞和上传图片。</p>
      </div>

      <div className="detail-section admin-toolbar">
        <label>
          管理密码
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="ADMIN_DELETE_PASSWORD" />
        </label>
        <button type="button" className="primary-action" onClick={loadPosts}>
          刷新列表
        </button>
        {status ? <span>{status}</span> : null}
      </div>

      <div className="admin-post-list">
        {posts.length > 0 ? (
          posts.map((post) => (
            <article className="detail-section admin-post-item" key={post.id}>
              <img src={post.image} alt="" />
              <div>
                <span>{post.category}</span>
                <h2>{post.title}</h2>
                <p>{post.excerpt}</p>
                <small>
                  {post.author} · {new Date(post.createdAt).toLocaleString("zh-CN")}
                </small>
              </div>
              <button type="button" className="danger-action" onClick={() => deletePost(post.id)} disabled={!password}>
                删除
              </button>
            </article>
          ))
        ) : (
          <div className="detail-section">
            <p className="empty-note">暂无用户帖子，或尚未配置 Vercel Blob。</p>
          </div>
        )}
      </div>
    </section>
  );
}
