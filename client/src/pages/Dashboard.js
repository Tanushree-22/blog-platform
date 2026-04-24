import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { postsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/common/Loaders';
import toast from 'react-hot-toast';
import './Dashboard.css';

const EditIcon = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>;
const EyeIcon = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, totalViews: 0, totalLikes: 0 });

  const fetchMyPosts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await postsAPI.getAll({ author: user._id, limit: 100, sortBy: 'createdAt' });
      const myPosts = data.data;
      setPosts(myPosts);
      const totalViews = myPosts.reduce((sum, p) => sum + (p.views || 0), 0);
      const totalLikes = myPosts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
      setStats({ total: myPosts.length, totalViews, totalLikes });
    } catch (err) {
      toast.error('Failed to load your posts');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchMyPosts(); }, [fetchMyPosts]);

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      await postsAPI.delete(postId);
      setPosts(prev => prev.filter(p => p._id !== postId));
      toast.success('Post deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  if (loading) return <PageLoader />;

  return (
    <>
      <Helmet><title>Dashboard — BlogSpace</title></Helmet>
      <div className="dashboard-page">
        <div className="container">

          {/* Profile header */}
          <div className="dash-header">
            <div className="dash-avatar">
              {user?.avatar
                ? <img src={user.avatar} alt={user.name} />
                : <div className="avatar-init-lg">{getInitials(user?.name)}</div>
              }
            </div>
            <div className="dash-user-info">
              <h1>{user?.name}</h1>
              <p>{user?.email}</p>
              {user?.bio && <p className="dash-bio">{user.bio}</p>}
            </div>
            <div className="dash-header-actions">
              <Link to={`/profile/${user?._id}`} className="btn btn-secondary btn-sm">View Profile</Link>
              <Link to="/create" className="btn btn-primary btn-sm">+ New Post</Link>
            </div>
          </div>

          {/* Stats */}
          <div className="dash-stats">
            <div className="stat-card"><div className="stat-value">{stats.total}</div><div className="stat-label">Posts</div></div>
            <div className="stat-card"><div className="stat-value">{stats.totalViews.toLocaleString()}</div><div className="stat-label">Total Views</div></div>
            <div className="stat-card"><div className="stat-value">{stats.totalLikes}</div><div className="stat-label">Total Likes</div></div>
          </div>

          {/* Posts table */}
          <div className="dash-posts-section">
            <h2 className="dash-section-title">Your Posts</h2>

            {posts.length === 0 ? (
              <div className="dash-empty">
                <p>📝 You haven't written anything yet.</p>
                <Link to="/create" className="btn btn-primary">Write Your First Post</Link>
              </div>
            ) : (
              <div className="posts-table-wrap">
                <table className="posts-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Tags</th>
                      <th>Views</th>
                      <th>Likes</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map(post => (
                      <tr key={post._id}>
                        <td>
                          <Link to={`/blog/${post.slug}`} className="table-post-title">{post.title}</Link>
                        </td>
                        <td>
                          <div className="table-tags">
                            {post.tags?.slice(0, 2).map(t => <span key={t} className="tag">{t}</span>)}
                          </div>
                        </td>
                        <td><span className="table-stat"><EyeIcon /> {post.views || 0}</span></td>
                        <td><span className="table-stat">♥ {post.likes?.length || 0}</span></td>
                        <td className="table-date">{post.createdAt ? format(new Date(post.createdAt), 'MMM d, yyyy') : ''}</td>
                        <td>
                          <div className="table-actions">
                            <button className="action-btn edit" onClick={() => navigate(`/edit/${post._id}`)} title="Edit"><EditIcon /></button>
                            <button className="action-btn delete" onClick={() => handleDelete(post._id)} title="Delete"><TrashIcon /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
