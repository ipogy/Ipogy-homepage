import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import styles from './AdminLayout.module.css';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className={styles.adminLayout}>
      <header className={styles.adminHeader}>
        <h1>管理画面</h1>
        <nav>
          <ul>
            <li><Link to="/admin/articles">記事一覧</Link></li>
            <li><Link to="/admin/articles/new">新規記事作成</Link></li>
            {/* 他の管理機能へのリンクを追加 */}
          </ul>
        </nav>
        <button onClick={handleLogout}>ログアウト</button>
      </header>
      <div className={styles.adminContent}>
        <Outlet /> {/* 子コンポーネントの表示場所 */}
      </div>
      <footer className={styles.adminFooter}>
        &copy; 2025 管理画面
      </footer>
    </div>
  );
};

export default AdminLayout;