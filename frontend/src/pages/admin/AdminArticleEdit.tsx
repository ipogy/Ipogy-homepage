import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './AdminArticleEdit.module.css';
import ImageUploader from '../../components/ImageUploader';
import { Helmet } from 'react-helmet-async';

interface FormData {
  title: string;
  slug: string;
  content: string;
  tags: string[];
}

const AdminArticleEdit: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    content: '',
    tags: [],
  });
  const [publishStatus, setPublishStatus] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(false);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(null);
    if (!token) {
      setError('認証が必要です。');
      setLoading(false);
      return;
    }

    fetch(`${__API_BASE_URL__}/admin/articles/${slug}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('記事が見つかりませんでした。');
          } else if (response.status === 401) {
            throw new Error('認証が必要です。');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setFormData({
          title: data.title,
          slug: data.slug,
          content: data.content,
          tags: data.tags || [],
        });
        setPublishStatus(data.is_published);
        setLoading(false);
      })
      .catch(error => {
        console.error('記事データの取得に失敗しました:', error);
        setError(error.message);
        setLoading(false);
      });
  }, [slug, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prevData => ({
      ...prevData,
      tags: e.target.value.split(',').map(tag => tag.trim()),
    }));
  };

  const togglePreview = () => {
    setIsPreviewVisible(!isPreviewVisible);
  };

  const handlePublishChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPublishStatus(e.target.checked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('保存中...');

    if (!token) {
      setSaveStatus('認証が必要です。');
      return;
    }

    try {
      const response = await fetch(`${__API_BASE_URL__}/articles/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, is_published: publishStatus }),
      });

      if (response.status === 200) {
        setSaveStatus('記事を保存しました。');
      } else if (response.status === 401) {
        setSaveStatus('保存権限がありません。');
      } else if (response.status === 404) {
        setSaveStatus('記事が見つかりませんでした。');
      } else {
        const errorData = await response.json();
        setSaveStatus(errorData.error || '記事の保存に失敗しました。');
      }
    } catch (error) {
      console.error('記事の保存に失敗しました:', error);
      setSaveStatus('記事の保存中にエラーが発生しました。');
    }
  };

  if (loading) {
    return <div>記事データを読み込み中...</div>;
  }

  if (error) {
    return <div>エラー: {error}</div>;
  }

  return (
    <div>
        <Helmet>
          <title>記事編集 | Ipogy</title>
        </Helmet>
      <h2 className={styles.h2}>記事編集</h2>
      {saveStatus && <p className={saveStatus === '記事を保存しました。' ? styles.success : styles.error}>{saveStatus}</p>}
      <form onSubmit={handleSubmit} className={styles.articleForm}>
        <div className={styles.formGroup}>
          <label htmlFor="title">タイトル</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="slug">スラッグ (URLの一部)</label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="content">本文</label>
          <textarea
            id="content"
            name="content"
            className={styles.contentTextArea} // 必要に応じてスタイルを適用
            value={formData.content}
            onChange={handleChange}
            rows={15} // 行数を指定
          />
        </div>
        <div className={styles.formGroup}>
          <ImageUploader />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="tags">タグ (カンマ区切り)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags.join(', ')}
            onChange={handleTagChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="publish">公開する</label>
          <input
            type="checkbox"
            id="publish"
            name="publish"
            checked={publishStatus}
            onChange={handlePublishChange}
          />
        </div>
        <button type="submit" className={styles.submitButton}>保存</button>
        <button type="button" onClick={togglePreview} className={styles.previewButton}>
          プレビュー
        </button>
      </form>

      {isPreviewVisible && (
        <div className={styles.previewContainer}>
          <h3>プレビュー</h3>
          <h1>{formData.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: formData.content }} className={styles.previewContent} />
        </div>
      )}
    </div>
  );
};

export default AdminArticleEdit;