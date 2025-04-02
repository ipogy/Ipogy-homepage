import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminArticleCreate.module.css'
import ImageUploader from '../../components/ImageUploader';
import { Helmet } from 'react-helmet-async';

interface FormData {
  title: string;
  slug: string;
  content: string;
  tags: string[];
}

const AdminArticleCreate: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    content: '',
    tags: [],
  });
  const [publishStatus, setPublishStatus] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value || e.target.value,
    }));
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prevData => ({
      ...prevData,
      tags: e.target.value.split(',').map(tag => tag.trim()),
    }));
  };

  const handlePublishChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPublishStatus(e.target.checked);
  };

  const togglePreview = () => {
    setIsPreviewVisible(!isPreviewVisible);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('保存中...');

    if (!token) {
      setSaveStatus('認証が必要です。');
      return;
    }

    try {
      const response = await fetch(`${__API_BASE_URL__}/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, is_published: publishStatus }),
      });

      if (response.status === 201) {
        setSaveStatus('記事を保存しました。');
        const data = await response.json();
        navigate(`/admin/articles/${data.slug}/edit`); // 保存後に編集画面へリダイレクト
      } else {
        const errorData = await response.json();
        setSaveStatus(errorData.error || '記事の保存に失敗しました。');
      }
    } catch (error) {
      console.error('記事の保存に失敗しました:', error);
      setSaveStatus('記事の保存中にエラーが発生しました。');
    }
  };

  return (
    <div>
        <Helmet>
          <title>新規記事作成 | Ipogy</title>
        </Helmet>
      <h2 className={styles.h2}>新規記事作成</h2>
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

export default AdminArticleCreate;