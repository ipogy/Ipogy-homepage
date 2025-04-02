import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './BlogPost.module.css';
import { Helmet } from 'react-helmet-async';

interface BlogPostData {
  title: string;
  slug: string;
  content: string;
  created_at: string;
  updated_at?: string;
  tags: string[];
}

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = `${__API_BASE_URL__}/articles/${slug}`;

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('記事が見つかりませんでした。');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setPost(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('ブログ記事の取得に失敗しました:', error);
        setError(error.message);
        setLoading(false);
      });
  }, [apiUrl, slug]);

  const decodeHtmlEntities = (html: string): string => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    return textarea.value;
  };

  if (loading) {
    return <div>記事を読み込み中...</div>;
  }

  if (error) {
    return <div>エラー: {error}</div>;
  }

  if (!post) {
    return <div>記事が見つかりませんでした。</div>;
  }

  const decodedContent = decodeHtmlEntities(post.content);

  return (
  <div className="page-container">
  <Helmet>
    <title>{post.title} | Ipogy Blog</title>
  </Helmet>
    <div className={styles.blogPostContainer}>
      <h1 className={styles.postTitle}>{post.title}</h1>
      <p className={styles.postDate}>
        公開日: {new Date(post.created_at).toLocaleDateString()}
        {post.updated_at && ` (最終更新日: ${new Date(post.updated_at).toLocaleDateString()})`}
      </p>
      <div className={styles.blogContent}>
        <div className={styles.postContent} dangerouslySetInnerHTML={{ __html: decodedContent }} />
        {post.tags && post.tags.length > 0 && (
          <div className={styles.postTags}>
            <h2>タグ</h2>
            <div className={styles.tagList}>
              {post.tags.map(tag => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  );
};

export default BlogPost;