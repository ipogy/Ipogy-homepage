import React, { useState, useEffect } from 'react';
import styles from './Blog.module.css';
import ScrollToTopLink from '../components/ScrollToTopLink'; // 作成したカスタム Link
import { Helmet } from 'react-helmet-async';

interface Article {
  title: string;
  slug: string;
  created_at: string;
  tags: string[];
}

const Blog: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1); // 現在のページ番号
  const [totalCount, setTotalCount] = useState<number>(0); // 全記事数
  const limit = 10; // 1ページあたりの記事数

  const apiUrl = `${__API_BASE_URL__}/articles?page=${page}&limit=${limit}`;

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log(response.headers.get('X-Total-Count'))
      setTotalCount(parseInt(response.headers.get('X-Total-Count') || '0', 10)); // ヘッダーから全記事数を取得
      return response.json() as Promise<Article[]>;
    })
    .then(data => {
      setArticles(data);
      setLoading(false);
    })
    .catch(err => {
      console.error('ブログ記事一覧の取得に失敗しました:', err);
      setError(err.message);
      setLoading(false);
    });
    }, [page, limit /* 必要に応じて tag, sort, order を依存配列に追加 */]);

    const handlePageChange = (newPage: number) => {
        if (newPage > 0) {
          setPage(newPage);
        }
      };

      const renderPagination = () => {
        const totalPages = Math.ceil(totalCount / limit);
        if (totalPages <= 1) return null;
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        return (
          <div className={styles.pagination}>
            {page > 1 && (
              <button onClick={() => handlePageChange(page - 1)} className={styles.paginationButton}>
                « 前へ
              </button>
            )}
            {pages.map(p => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`${styles.paginationButton} ${p === page ? styles.active : ''}`}
              >
                {p}
              </button>
            ))}
            {page < totalPages && (
              <button onClick={() => handlePageChange(page + 1)} className={styles.paginationButton}>
                次へ »
              </button>
            )}
          </div>
        );
      };

  if (loading) {
    return <div>記事を読み込み中...</div>;
  }

  if (error) {
    return <div>エラー: {error}</div>;
  }

  return (
    <div className="page-container">
        <Helmet>
          <title> Blog | Ipogy</title>
        </Helmet>
      <div className={styles.blogWrapper}>
      <div className={styles.blogContainer}>
      <h1>ブログ</h1>
      <p className={styles.totalCount}>全 {totalCount} 件</p> {/* 全記事数を表示 */}
      <div className={styles.articleList}>
        {articles?.map(article => (
          <div key={article.slug} className={styles.articleItem}>
            <h2>
              <ScrollToTopLink to={`/blog/${article.slug}`}>{article.title}</ScrollToTopLink>
            </h2>
            <p className={styles.articleDate}>
              {new Date(article.created_at).toLocaleDateString()}
            </p>
            {article.tags && article.tags.length > 0 && (
              <div className={styles.articleTags}>
                タグ: {article.tags.map(tag => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
              </div>
            )}
          </div>
        ))}
        {articles?.length === 0 && <p>まだ記事はありません。</p>}
        </div>
        </div>
      {renderPagination()}
    </div>
    </div>
  );
};

export default Blog;