import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { postsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import PostForm from '../components/blog/PostForm';
import { PageLoader } from '../components/common/Loaders';
import toast from 'react-hot-toast';
import './PostPage.css';

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // Fetch by slug won't work for edit page (we have id), use a workaround:
        // We get slug from dashboard navigation state or just list user's posts
        // For simplicity, we expose a get-by-id route (add to backend) or use slug
        // Here we search user posts – cleaner: store slug when navigating
        // Simple approach: navigate to edit passes slug via state
        // We'll fetch via posts list and find
        const { data } = await postsAPI.getAll({ author: user._id, limit: 100 });
        const found = data.data.find(p => p._id === id);
        if (!found) { toast.error('Post not found or not authorized'); navigate('/dashboard'); return; }
        // Fetch full content via slug
        const { data: full } = await postsAPI.getBySlug(found.slug);
        setPost(full.data);
      } catch (err) {
        toast.error('Failed to load post');
        navigate('/dashboard');
      } finally {
        setFetching(false);
      }
    };
    if (user) fetchPost();
  }, [id, user, navigate]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const { data } = await postsAPI.update(id, formData);
      toast.success('Post updated!');
      navigate(`/blog/${data.data.slug}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <PageLoader />;
  if (!post) return null;

  return (
    <>
      <Helmet><title>Edit Post — BlogSpace</title></Helmet>
      <div className="post-page">
        <div className="container">
          <div className="post-page-header">
            <h1>Edit Post</h1>
            <p>Make changes to your published story.</p>
          </div>
          <PostForm initialData={post} onSubmit={handleSubmit} loading={loading} mode="edit" />
        </div>
      </div>
    </>
  );
}
