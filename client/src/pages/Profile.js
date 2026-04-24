import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { usersAPI } from '../utils/api';
import BlogCard from '../components/blog/BlogCard';
import { PageLoader, BlogCardSkeleton } from '../components/common/Loaders';
import toast from 'react-hot-toast';
import './Profile.css';

export default function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const { data } = await usersAPI.getProfile(id);
        setProfile(data.data);
      } catch {
        toast.error('User not found');
      } finally {
        setLoadingProfile(false);
      }
    };
    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        const { data } = await usersAPI.getUserPosts(id, { limit: 12 });
        setPosts(data.data);
      } catch {
        /* silent */
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchProfile();
    fetchPosts();
  }, [id]);

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  if (loadingProfile) return <PageLoader />;
  if (!profile) return <div className="container" style={{padding:'80px 0',textAlign:'center'}}><p>User not found.</p><Link to="/" className="btn btn-primary" style={{marginTop:16}}>Go Home</Link></div>;

  return (
    <>
      <Helmet><title>{profile.name} — BlogSpace</title></Helmet>
      <div className="profile-page">
        {/* Cover band */}
        <div className="profile-banner" />

        <div className="container">
          <div className="profile-header">
            <div className="profile-avatar-wrap">
              {profile.avatar
                ? <img src={profile.avatar} alt={profile.name} className="profile-avatar" />
                : <div className="profile-avatar-init">{getInitials(profile.name)}</div>
              }
            </div>
            <div className="profile-info">
              <h1 className="profile-name">{profile.name}</h1>
              {profile.bio && <p className="profile-bio">{profile.bio}</p>}
              <p className="profile-joined">Member since {format(new Date(profile.createdAt), 'MMMM yyyy')}</p>
            </div>
            <div className="profile-stats-row">
              <div className="profile-stat"><span className="stat-n">{profile.postCount || 0}</span><span className="stat-l">Posts</span></div>
            </div>
          </div>

          <div className="profile-divider" />

          <h2 className="profile-posts-heading">Posts by {profile.name}</h2>

          {loadingPosts ? (
            <div className="posts-grid-profile">
              {[1,2,3].map(i => <BlogCardSkeleton key={i} />)}
            </div>
          ) : posts.length === 0 ? (
            <div style={{textAlign:'center',padding:'60px 0',color:'var(--text-muted)'}}>
              <p>No posts yet.</p>
            </div>
          ) : (
            <div className="posts-grid-profile">
              {posts.map(post => <BlogCard key={post._id} post={post} />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
