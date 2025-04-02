import React, { useState, useEffect } from 'react';
import styles from './Home.module.css';
import { Helmet } from 'react-helmet-async';
import ScrollToTopLink from '../components/ScrollToTopLink'; // 作成したカスタム Link

// アイコンのインポート (例: Material Icons)
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import TranslateIcon from '@mui/icons-material/Translate';
import CodeIcon from '@mui/icons-material/Code';
import PsychologyIcon from '@mui/icons-material/Psychology';

interface Article {
  title: string;
  slug: string;
  created_at: string;
  tags: string[];
}

const Home: React.FC = () => {
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const apiUrl = `${__API_BASE_URL__}/articles?page=1&limit=6`; // 最新6件の記事を取得するAPIエンドポイント

  useEffect(() => {
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setLatestArticles(data);
      })
      .catch(error => {
        console.error('最新記事の取得に失敗しました:', error);
        // エラーハンドリング (例: エラーメッセージの表示)
      });
  }, [apiUrl]);

  return (
    <div className={styles.homeContainerWrapper}>
    <div className={styles.homeContainer}>
            <Helmet>
              <title>Ipogy</title>
            </Helmet>
        <div className={styles.heroSection}>
            <div className={styles.heroContent}>
            <div className={styles.heroText}>
                <h1>Go to  'Next'  Stage.</h1> {/* 仮の紹介テキスト */}
                <p>Ipogy CS & Language へようこそ！</p> {/* 仮のキャッチフレーズ */}
                {/* 必要に応じてボタンなどを追加 */}
            </div>
            <div className={styles.heroImage}>
                {/* 背景画像をここに追加（CSSで設定） */}
            </div>
            </div>
        </div>

        <section className={styles.servicesSection}>
        <div className={styles.servicesContainer}>
          <h2>提供サービス</h2>
          <div className={styles.servicesGrid}>
            <div className={styles.serviceItem}>
              <PsychologyIcon className={styles.serviceIcon} />
              <h3>AIツール</h3>
              <p>AI技術で未来を拓くソリューションを提供します。</p> {/* 仮の説明 */}
            </div>
            <div className={styles.serviceItem}>
              <TranslateIcon className={styles.serviceIcon} />
              <h3>学習支援</h3>
              <p>学びを加速するデジタルプラットフォーム。</p> {/* 仮の説明 */}
            </div>
            <div className={styles.serviceItem}>
              <RecordVoiceOverIcon className={styles.serviceIcon} />
              <h3>ゲーム</h3>
              <p>日常を彩るエンターテイメント体験を提供します。</p> {/* 仮の説明 */}
            </div>
            <div className={styles.serviceItem}>
              <CodeIcon className={styles.serviceIcon} />
              <h3>プログラミング</h3>
              <p>ウェブサイトやアプリケーションの開発を行います。</p> {/* 仮の説明 */}
            </div>
            {/* 必要に応じて他のサービスを追加 */}
            </div>
            </div>
        </section>

        {/* 最新記事セクションは後で追加 */}
        <section className={styles.latestArticlesSection}>
        <div className={styles.latestArticlesContainer}>
          <h2>最新記事</h2>
          <div className={styles.articlesGrid}>
            {latestArticles.map(article => (
              <div key={article.slug} className={styles.articleItem}>
                <h3>{article.title}</h3>
                <p className={styles.articleDate}>
                  {new Date(article.created_at).toLocaleDateString()}
                </p>
                {/* 概要表示はAPIレスポンスに含まれていないため、ここでは省略 */}
                <ScrollToTopLink to={`/blog/${article.slug}`}>続きを読む</ScrollToTopLink>
              </div>
            ))}
            {latestArticles.length === 0 && <p>最新記事はありません。</p>}
          </div>
        </div>
      </section>
    </div>
    </div>
  );
};

export default Home;