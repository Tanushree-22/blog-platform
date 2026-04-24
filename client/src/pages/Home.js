import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { postsAPI } from '../utils/api';
import BlogCard from '../components/blog/BlogCard';
import Pagination from '../components/common/Pagination';
import { BlogCardSkeleton } from '../components/common/Loaders';
import './Home.css';

const SearchIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [popularTags, setPopularTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const currentPage = Number(searchParams.get('page') || 1);
  const currentTag = searchParams.get('tag') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sortBy') || 'createdAt';

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 9, sortBy: currentSort };
      if (currentSearch) params.search = currentSearch;
      if (currentTag) params.tag = currentTag;
      const { data } = await postsAPI.getAll(params);
      setPosts(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentSearch, currentTag, currentSort]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  useEffect(() => {
    postsAPI.getPopularTags()
      .then(({ data }) => setPopularTags(data.data || []))
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams(searchParams);
    if (searchInput.trim()) p.set('search', searchInput.trim());
    else p.delete('search');
    p.set('page', '1');
    setSearchParams(p);
  };

  const setTag = (tag) => {
    const p = new URLSearchParams();
    if (tag) p.set('tag', tag);
    p.set('page', '1');
    setSearchParams(p);
  };

  const setSort = (sort) => {
    const p = new URLSearchParams(searchParams);
    p.set('sortBy', sort);
    p.set('page', '1');
    setSearchParams(p);
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const isFiltered = currentSearch || currentTag;

  return (
    <>
      <Helmet>
        <title>BlogSpace — Stories Worth Telling</title>
        <meta name="description" content="Discover insightful articles, tutorials, and stories from writers around the world." />
      </Helmet>

      {/* Hero */}
      <section className="home-hero">
        <div className="container">
          <div className="hero-content">
            <span className="hero-eyebrow">✦ Welcome to BlogSpace</span>
            <h1 className="hero-title">
              Stories worth telling,<br />
              <em>ideas worth sharing.</em>
            </h1>
            <p className="hero-sub">
              Discover thoughtful articles, tutorials, and perspectives from writers around the world.
            </p>

            {/* Search */}
            <form className="search-form" onSubmit={handleSearch}>
              <div className="search-input-wrap">
                <SearchIcon />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search posts, topics, tags…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary">Search</button>
            </form>
          </div>
        </div>
      </section>

      <div className="container home-body">
        {/* Tag bar */}
        {popularTags.length > 0 && (
          <div className="tag-bar">
            <button
              className={`tag ${!currentTag ? 'tag-active' : ''}`}
              onClick={() => setTag('')}
            >All</button>
            {popularTags.slice(0, 12).map(({ _id, count }) => (
              <button
                key={_id}
                className={`tag ${currentTag === _id ? 'tag-active' : ''}`}
                onClick={() => setTag(_id)}
              >
                {_id} <span className="tag-count">{count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="posts-toolbar">
          <div className="toolbar-left">
            {isFiltered ? (
              <div className="filter-info">
                {currentSearch && <span>Results for "<strong>{currentSearch}</strong>"</span>}
                {currentTag && <span>Tag: <strong>#{currentTag}</strong></span>}
                {pagination.total !== undefined && (
                  <span className="result-count">{pagination.total} post{pagination.total !== 1 ? 's' : ''}</span>
                )}
                <button className="btn btn-ghost btn-sm" onClick={clearFilters}>✕ Clear</button>
              </div>
            ) : (
              <p className="posts-count">
                {pagination.total !== undefined ? `${pagination.total} posts` : ''}
              </p>
            )}
          </div>

          <div className="sort-tabs">
            <button className={`sort-tab ${currentSort === 'createdAt' ? 'active' : ''}`} onClick={() => setSort('createdAt')}>Latest</button>
            <button className={`sort-tab ${currentSort === 'views' ? 'active' : ''}`} onClick={() => setSort('views')}>Trending</button>
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="posts-grid">
            {Array.from({ length: 9 }).map((_, i) => <BlogCardSkeleton key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No posts found</h3>
            <p>{isFiltered ? 'Try different search terms or clear the filters.' : 'Be the first to write a post!'}</p>
            <div className="empty-actions">
              {isFiltered && <button className="btn btn-secondary" onClick={clearFilters}>Clear Filters</button>}
              <Link to="/create" className="btn btn-primary">Write a Post</Link>
            </div>
          </div>
        ) : (
          <div className="posts-grid">
            {posts.map((post, i) => (
              <div key={post._id} className="animate-fadeUp" style={{ animationDelay: `${i * 0.05}s` }}>
                <BlogCard post={post} />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            onPageChange={(p) => {
              const params = new URLSearchParams(searchParams);
              params.set('page', p);
              setSearchParams(params);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </div>
    </>
  );
}
