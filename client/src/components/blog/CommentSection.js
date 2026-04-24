import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { postsAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './CommentSection.css';

const TrashIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

export default function CommentSection({ postId, initialComments = [], postAuthorId }) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (text.trim().length > 500) { toast.error('Comment too long (max 500 chars)'); return; }

    setLoading(true);
    try {
      const { data } = await postsAPI.addComment(postId, text.trim());
      setComments((prev) => [...prev, data.data]);
      setText('');
      toast.success('Comment added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await postsAPI.deleteComment(postId, commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success('Comment deleted');
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  const canDelete = (comment) => {
    if (!user) return false;
    return (
      comment.user?._id === user._id ||
      comment.user === user._id ||
      postAuthorId === user._id ||
      user.role === 'admin'
    );
  };

  return (
    <div className="comments-section">
      <h3 className="comments-heading">
        Comments <span className="comments-count">{comments.length}</span>
      </h3>

      {/* Add comment */}
      {isAuthenticated ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <div className="comment-form-inner">
            <div className="commenter-avatar">
              {user?.avatar
                ? <img src={user.avatar} alt={user.name} />
                : <div className="avatar-init">{user?.name?.charAt(0).toUpperCase()}</div>
              }
            </div>
            <div className="comment-input-wrap">
              <textarea
                className="comment-input"
                placeholder="Share your thoughts…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                maxLength={500}
              />
              <div className="comment-form-footer">
                <span className="char-hint">{text.length}/500</span>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={loading || !text.trim()}
                >
                  {loading ? <div className="spinner" style={{width:14,height:14}} /> : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="comment-login-prompt">
          <p>
            <Link to="/login">Sign in</Link> to join the conversation.
          </p>
        </div>
      )}

      {/* List */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="no-comments">
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="comment-item">
              <Link to={`/profile/${comment.user?._id || comment.user}`} className="comment-avatar">
                {comment.user?.avatar
                  ? <img src={comment.user.avatar} alt={comment.user?.name} />
                  : <div className="avatar-init sm">{(comment.user?.name || 'U').charAt(0).toUpperCase()}</div>
                }
              </Link>
              <div className="comment-body">
                <div className="comment-header">
                  <Link to={`/profile/${comment.user?._id || comment.user}`} className="comment-author">
                    {comment.user?.name || 'User'}
                  </Link>
                  <span className="comment-date">
                    {comment.createdAt ? format(new Date(comment.createdAt), 'MMM d, yyyy') : ''}
                  </span>
                  {canDelete(comment) && (
                    <button
                      className="comment-delete"
                      onClick={() => handleDelete(comment._id)}
                      title="Delete comment"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
                <p className="comment-text">{comment.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
