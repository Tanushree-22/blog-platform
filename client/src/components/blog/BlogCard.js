import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import './BlogCard.css';

const HeartIcon = ({ filled }) => (
  <svg width="15" height="15" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

export default function BlogCard({ post, featured = false }) {
  const {
    title, slug, excerpt, image, author, tags, likes, views,
    readTime, createdAt
  } = post;

  const likeCount = Array.isArray(likes) ? likes.length : 0;
  const formattedDate = createdAt ? format(new Date(createdAt), 'MMM d, yyyy') : '';
  const defaultImage = `https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80`;

  return (
    <article className={`blog-card ${featured ? 'featured' : ''}`}>
      {/* Image */}
      <Link to={`/blog/${slug}`} className="card-image-wrap">
        <img
          src={image || defaultImage}
          alt={title}
          className="card-image"
          loading="lazy"
          onError={(e) => { e.target.src = defaultImage; }}
        />
        {featured && <span className="featured-badge">Featured</span>}
      </Link>

      {/* Content */}
      <div className="card-body">
        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="card-tags">
            {tags.slice(0, 3).map((tag) => (
              <Link key={tag} to={`/?tag=${tag}`} className="tag">
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <Link to={`/blog/${slug}`} className="card-title-link">
          <h2 className="card-title">{title}</h2>
        </Link>

        {/* Excerpt */}
        {excerpt && <p className="card-excerpt">{excerpt}</p>}

        {/* Footer */}
        <div className="card-footer">
          {/* Author */}
          <Link to={`/profile/${author?._id}`} className="card-author">
            {author?.avatar ? (
              <img src={author.avatar} alt={author.name} className="author-avatar" />
            ) : (
              <div className="author-avatar-placeholder">
                {author?.name?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <div className="author-info">
              <span className="author-name">{author?.name || 'Unknown'}</span>
              <span className="post-date">{formattedDate}</span>
            </div>
          </Link>

          {/* Meta */}
          <div className="card-meta">
            <span className="meta-item">
              <ClockIcon /> {readTime || 1}m
            </span>
            <span className="meta-item">
              <EyeIcon /> {views || 0}
            </span>
            <span className="meta-item">
              <HeartIcon /> {likeCount}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
