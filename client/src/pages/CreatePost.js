import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { postsAPI } from '../utils/api';
import PostForm from '../components/blog/PostForm';
import toast from 'react-hot-toast';
import './PostPage.css';

export default function CreatePost() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const { data } = await postsAPI.create(formData);
      toast.success('Post published! 🎉');
      navigate(`/blog/${data.data.slug}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Write a Post — BlogSpace</title></Helmet>
      <div className="post-page">
        <div className="container">
          <div className="post-page-header">
            <h1>Write a New Post</h1>
            <p>Share your story, knowledge, or ideas with the world.</p>
          </div>
          <PostForm onSubmit={handleSubmit} loading={loading} mode="create" />
        </div>
      </div>
    </>
  );
}
