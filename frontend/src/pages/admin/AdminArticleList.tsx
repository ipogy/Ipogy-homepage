import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ScrollToTopLink from '../../components/ScrollToTopLink'; // 作成したカスタム Link
import styles from './AdminArticleList.module.css'; // CSS モジュールはそのまま使用
import { Helmet } from 'react-helmet-async';

interface Article {
  title: string;
  slug: string;
  created_at: string;
  is_published: boolean;
}

const AdminArticleList: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams(); // 更新関数を setSearchParams に格納
  const page = parseInt(searchParams.get('page') || '1', 10);
  const [totalCount, setTotalCount] = useState<number>(0); // 全記事数を管理する state
  const limit = 10;
  const token = localStorage.getItem('adminToken');

  const apiUrl = `${__API_BASE_URL__}/articles/all?page=${page}&limit=${limit}`;

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetch(apiUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        setTotalCount(parseInt(response.headers.get('X-Total-Count') || '0', 10)); // ヘッダーから全記事数を取得
        return response.json() as Promise<Article[]>;
      })
      .then(data => {
        setArticles(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('記事一覧の取得に失敗しました:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [apiUrl, token]);

  const handleDeleteArticle = async (slug: string) => {
    if (!window.confirm(`記事「${articles.find(article => article.slug === slug)?.title}」を削除しますか？`)) {
      return;
    }

    if (!token) {
      setError('認証が必要です。');
      return;
    }

    try {
      const response = await fetch(`${__API_BASE_URL__}/articles/${slug}`, { // 削除APIのエンドポイント (以前と同じと仮定)
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 204) {
        // 削除成功
        setArticles(prevArticles => prevArticles.filter(article => article.slug !== slug));
      } else if (response.status === 401) {
        setError('削除権限がありません。');
      } else if (response.status === 404) {
        setError('記事が見つかりませんでした。');
      } else {
        const errorData = await response.json();
        setError(errorData.error || '記事の削除に失敗しました。');
      }
    } catch (error) {
      console.error('記事の削除に失敗しました:', error);
      setError('記事の削除中にエラーが発生しました。');
    }
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
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
    return <div>記事一覧を読み込み中...</div>;
  }

  if (error) {
    return <div>エラー: {error}</div>;
  }

  return (
    <div>
        <Helmet>
            <title>記事一覧 | Ipogy</title>
        </Helmet>
      <div className={styles.articleListWrapper}>
      <h2>記事一覧</h2>
      {articles?.length === 0 ? (
        <p>まだ記事がありません。</p>
      ) : (
        <div className={styles.articleList}>
          {articles?.map(article => (
            <div key={article.slug} className={styles.articleItem}>
              <h3>
                <ScrollToTopLink to={`/admin/articles/${article.slug}/edit`} className={styles.articleTitleLink}>
                  {article.title}
                </ScrollToTopLink>
              </h3>
              <p className={styles.articleDate}>
                公開日: {new Date(article.created_at).toLocaleDateString()}
              </p>
              <p className={styles.articleStatus}>
                ステータス: <span className={article.is_published ? styles.published : styles.unpublished}>
                  {article.is_published ? '公開' : '非公開'}
                </span>
              </p>
              <div className={styles.articleActions}>
                <ScrollToTopLink to={`/admin/articles/${article.slug}/edit`} className={styles.editButton}>編集</ScrollToTopLink>
                <button onClick={() => handleDeleteArticle(article.slug)} className={styles.deleteButton}>削除</button> {/* 削除ボタンを再度追加 */}
              </div>
            </div>
          ))}
        </div>
      )}
      {renderPagination()}
      <ScrollToTopLink to="/admin/articles/new" className={styles.createButton}>新規記事作成</ScrollToTopLink>
    </div>
    </div>
  );
};

export default AdminArticleList;