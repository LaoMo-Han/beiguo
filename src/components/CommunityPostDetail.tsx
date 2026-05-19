"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { CommunityComment, CommunityPost } from "@/lib/community-types";
import { communityHeaders } from "@/lib/community-client";

type CommunityPostDetailProps = {
  post: CommunityPost;
  initialComments: CommunityComment[];
};

export function CommunityPostDetail({ post, initialComments }: CommunityPostDetailProps) {
  const [likes, setLikes] = useState(post.likes);
  const [comments, setComments] = useState(initialComments);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/community/posts/${post.id}/comments`, { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { comments?: CommunityComment[] }) => setComments(payload.comments || initialComments))
      .catch(() => undefined);
  }, [initialComments, post.id]);

  async function handleLike() {
    setLikes((value) => value + 1);

    try {
      const response = await fetch(`/api/community/posts/${post.id}/likes`, {
        method: "POST",
        headers: communityHeaders()
      });
      const payload = (await response.json()) as { likes?: number; error?: string };

      if (!response.ok || typeof payload.likes !== "number") {
        throw new Error(payload.error || "点赞失败");
      }

      setLikes(payload.likes);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "点赞失败");
      setLikes((value) => Math.max(0, value - 1));
    }
  }

  async function handleComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("正在评论...");

    try {
      const response = await fetch(`/api/community/posts/${post.id}/comments`, {
        method: "POST",
        headers: communityHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({ author, body })
      });
      const payload = (await response.json()) as { comment?: CommunityComment; error?: string };

      if (!response.ok || !payload.comment) {
        throw new Error(payload.error || "评论失败");
      }

      setComments((current) => [...current, payload.comment!]);
      setBody("");
      setStatus("评论成功");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "评论失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="community-actions">
        <button type="button" className="primary-action" onClick={handleLike}>
          点赞 {likes.toLocaleString("zh-CN")} ♥
        </button>
        {status ? <span>{status}</span> : null}
      </div>

      <section className="detail-section community-comments">
        <div className="section-title-row">
          <h2>评论</h2>
          <span>{comments.length} 条</span>
        </div>

        <form className="comment-form" onSubmit={handleComment}>
          <input value={author} onChange={(event) => setAuthor(event.target.value)} placeholder="昵称，不填会随机" maxLength={24} />
          <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="写下你的评论" maxLength={800} required />
          <button type="submit" className="primary-action" disabled={busy}>
            {busy ? "发送中..." : "发送评论"}
          </button>
        </form>

        <div className="comment-list">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <article className="comment-item" key={comment.id}>
                <strong>{comment.author}</strong>
                {comment.verified ? <span className="verified-badge" aria-label="官方认证">呗</span> : null}
                <p>{comment.body}</p>
                <small>{new Date(comment.createdAt).toLocaleString("zh-CN")}</small>
              </article>
            ))
          ) : (
            <p className="empty-note">还没有评论。</p>
          )}
        </div>
      </section>
    </>
  );
}
