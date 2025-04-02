import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AdminDashboard.module.css';
import { Helmet } from 'react-helmet-async';

const AdminDashboard: React.FC = () => {
  return (
    <div className={styles.dashboardContainer}>
        <Helmet>
            <title>管理ダッシュボード | Ipogy</title>
        </Helmet>
      <h2>管理ダッシュボード</h2>
      <p>ようこそ、管理者様。</p>

      <div className={styles.dashboardActions}>
        <div className={styles.actionItem}>
          <h3>記事管理</h3>
          <ul>
            <li>
              <Link to="/admin/articles">記事一覧</Link>
            </li>
            <li>
              <Link to="/admin/articles/new">新規記事作成</Link>
            </li>
          </ul>
        </div>

        {/* 他の管理機能へのリンクもここに追加できます */}
      </div>
    </div>
  );
};

export default AdminDashboard;