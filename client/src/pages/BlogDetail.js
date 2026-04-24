import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { postsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/blog/CommentSection';
import { PageLoader } from '../components/common/Loaders';
import toast from 'react-hot-toast';
import './BlogDetail.css';

const HeartIcon = ({ filled }) => (
  <svg width="18" height="18" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const EditIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
  </svg>
);

export default function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const { data } = await postsAPI.getBySlug(slug);
        setPost(data.data);
        setIsLiked(data.data.isLiked || false);
        setLikeCount(data.data.likes?.length || 0);
      } catch (err) {
        if (err.response?.status === 404) {
          navigate('/404', { replace: true });
        }
        toast.error('Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug, navigate]);

  const handleLike = async () => {
    if (!isAuthenticated) { toast.error('Sign in to like posts'); return; }
    setLikeLoading(true);
    try {
      const { data } = await postsAPI.toggleLike(post._id);
      setIsLiked(data.isLiked);
      setLikeCount(data.likeCount);
    } catch (err) {
      toast.error('Failed to update like');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;
    setDeleting(true);
    try {
      await postsAPI.delete(post._id);
      toast.success('Post deleted');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete post');
      setDeleting(false);
    }
  };

  const isAuthor = user && post && (post.author?._id === user._id || post.author === user._id);

  if (loading) return <PageLoader />;
  if (!post) return null;

  const defaultImg = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&q=80';

  return (
    <>
      <Helmet>
        <title>{post.title} — BlogSpace</title>
        <meta name="description" content={post.excerpt} />
        {post.image && <meta property="og:image" content={post.image} />}
      </Helmet>

      <article className="post-detail">
        {/* Cover Image */}
        <div className="post-cover-wrap">
          <img
            src={post.image || defaultImg}
            alt={post.title}
            className="post-cover"
            onError={(e) => { e.target.src = defaultImg; }}
          />
          <div className="post-cover-overlay" />
        </div>

        <div className="container-sm">
          {/* Header */}
          <header className="post-header">
            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="post-tags">
                {post.tags.map((tag) => (
                  <Link key={tag} to={`/?tag=${tag}`} className="tag">{tag}</Link>
                ))}
              </div>
            )}

            <h1 className="post-title">{post.title}</h1>
            {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}

            {/* Meta row */}
            <div className="post-meta-row">
              <Link to={`/profile/${post.author?._id}`} className="post-author-link">
                {post.author?.avatar
                  ? <img src={post.author.avatar} alt={post.author.name} className="post-author-avatar" />
                  : <div className="author-avatar-placeholder sm">{post.author?.name?.charAt(0).toUpperCase()}</div>
                }
                <div>
                  <div className="post-author-name">{post.author?.name}</div>
                  <div className="post-author-bio">{post.author?.bio}</div>
                </div>
              </Link>

              <div className="post-stats">
                <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                <span>·</span>
                <span>{post.readTime} min read</span>
                <span>·</span>
                <span>{post.views} views</span>
              </div>
            </div>

            {/* Author actions */}
            {isAuthor && (
              <div className="author-actions">
                <Link to={`/edit/${post._id}`} className="btn btn-secondary btn-sm">
                  <EditIcon /> Edit Post
                </Link>
                <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
                  <TrashIcon /> {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            )}
          </header>

          <div className="post-divider" />

          {/* Content */}
          <div className="blog-content post-body">
            {post.content.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {/* Like & Share bar */}
          <div className="post-action-bar">
            <button
              className={`like-btn ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
              disabled={likeLoading}
            >
              <HeartIcon filled={isLiked} />
              <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
            </button>

            <div className="share-row">
              <span className="share-label">Share:</span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-btn"
              >Twitter</a>
              <button
                className="share-btn"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied!');
                }}
              >Copy Link</button>
            </div>
          </div>

          {/* Author card */}
          <div className="author-card">
            <Link to={`/profile/${post.author?._id}`} className="author-card-avatar">
              {post.author?.avatar
                ? <img src={post.author.avatar} alt={post.author.name} />
                : <div className="author-avatar-placeholder lg">{post.author?.name?.charAt(0).toUpperCase()}</div>
              }
            </Link>
            <div>
              <p className="author-card-label">Written by</p>
              <Link to={`/profile/${post.author?._id}`} className="author-card-name">{post.author?.name}</Link>
              {post.author?.bio && <p className="author-card-bio">{post.author.bio}</p>}
            </div>
          </div>

          {/* Comments */}
          <CommentSection
            postId={post._id}
            initialComments={post.comments || []}
            postAuthorId={post.author?._id}
          />
        </div>
      </article>
    </>
  );
}
