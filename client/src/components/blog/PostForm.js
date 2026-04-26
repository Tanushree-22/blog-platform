import React, { useState } from 'react';
import toast from 'react-hot-toast';
import './PostForm.css';



export default function PostForm({ initialData = {}, onSubmit, loading, mode = 'create' }) {
  const [form, setForm] = useState({
    title: initialData.title || '',
    content: initialData.content || '',
    image: initialData.image || '',
    tags: initialData.tags ? initialData.tags.join(', ') : '',
    excerpt: initialData.excerpt || '',
  });

  const [preview, setPreview] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.title.trim() || form.title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters';
    }
    if (!form.content.trim() || form.content.trim().length < 50) {
      errs.content = 'Content must be at least 50 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    const tagsArray = form.tags
      ? form.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 10)
      : [];

    onSubmit({ ...form, tags: tagsArray });
  };

  const wordCount = form.content.trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="post-form-container">
      {/* Toolbar */}
      <div className="post-form-toolbar">
        <div className="toolbar-info">
          <span>{wordCount} words · ~{readTime} min read</span>
        </div>
        <div className="toolbar-actions">
          <button
            type="button"
            className={`btn btn-sm ${preview ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={() => setPreview(!preview)}
          >
            {preview ? 'Edit' : 'Preview'}
          </button>
        </div>
      </div>

      {preview ? (
        /* ── Preview Mode ── */
        <div className="post-preview">
          {form.image && (
            <img src={form.image} alt="Cover" className="preview-cover" onError={(e) => e.target.style.display = 'none'} />
          )}
          <h1 className="preview-title">{form.title || 'Untitled Post'}</h1>
          {form.excerpt && <p className="preview-excerpt">{form.excerpt}</p>}
          {form.tags && (
            <div className="preview-tags">
              {form.tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag, i) => (
                <span key={i} className="tag">{tag}</span>
              ))}
            </div>
          )}
          <div className="blog-content preview-body">
            {form.content.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      ) : (
        /* ── Edit Mode ── */
        <form onSubmit={handleSubmit} className="post-form" noValidate>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className={`form-input title-input ${errors.title ? 'input-error' : ''}`}
              placeholder="Enter a compelling title…"
              maxLength={150}
            />
            <div className="field-footer">
              {errors.title && <span className="form-error">{errors.title}</span>}
              <span className="char-count">{form.title.length}/150</span>
            </div>
          </div>

          {/* Cover Image URL */}
          <div className="form-group">
            <label className="form-label">Cover Image URL <span className="optional">(optional)</span></label>
            <input
              type="url"
              name="image"
              value={form.image}
              onChange={handleChange}
              className="form-input"
              placeholder="https://example.com/image.jpg"
            />
            {form.image && (
              <div className="image-preview-thumb">
                <img
                  src={form.image}
                  alt="Cover preview"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          {/* Excerpt */}
          <div className="form-group">
            <label className="form-label">Excerpt <span className="optional">(optional — auto-generated if blank)</span></label>
            <textarea
              name="excerpt"
              value={form.excerpt}
              onChange={handleChange}
              className="form-textarea"
              placeholder="A brief description shown in card previews…"
              rows={3}
              maxLength={300}
              style={{ minHeight: '80px' }}
            />
          </div>

          {/* Content */}
          <div className="form-group">
            <label className="form-label">Content *</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              className={`form-textarea content-textarea ${errors.content ? 'input-error' : ''}`}
              placeholder="Write your story here… Supports plain text. Use double line breaks for paragraphs."
              rows={20}
            />
            {errors.content && <span className="form-error">{errors.content}</span>}
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">Tags <span className="optional">(optional — comma separated, max 10)</span></label>
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              className="form-input"
              placeholder="technology, design, tutorial, react…"
            />
            {form.tags && (
              <div className="tags-preview">
                {form.tags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 10).map((tag, i) => (
                  <span key={i} className="tag">{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? (
                <><div className="spinner" /> {mode === 'edit' ? 'Saving…' : 'Publishing…'}</>
              ) : (
                mode === 'edit' ? 'Save Changes' : 'Publish Post'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
