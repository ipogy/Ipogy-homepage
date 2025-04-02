import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost'; // BlogPost コンポーネントをインポート
import TermsOfService from './pages/TermsOfService'; // 追加
import PrivacyPolicy from './pages/PrivacyPolicy'; // 追加
import './App.css';
import logo from '/icon_bg.svg'; // ロゴ画像をインポート

const RequireAdminAuth = lazy(() => import('./components/RequireAdminAuth'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminArticleList = lazy(() => import('./pages/admin/AdminArticleList'));
const AdminArticleEdit = lazy(() => import('./pages/admin/AdminArticleEdit'));
const AdminArticleCreate = lazy(() => import('./pages/admin/AdminArticleCreate'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 簡単な例として、2秒後にローディングを終了する
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer); // クリーンアップ
  }, []);

  return (
    <HelmetProvider>
      <Router>
        <div className="app-container">
          {isLoading ? (
            <div className="splash-screen">
              <img src={logo} alt="ロゴ" />
            </div>
          ) : (
            <div className="main-content">
              <Header />
              <div className="content">
                <Suspense fallback={<div>Loading...</div>}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPost />} /> {/* ブログ記事詳細ページのルーティング */}
                    <Route path="/admin/login" element={<AdminLogin />} /> {/* 管理画面ログインへのルーティング */}


                    <Route path="/admin/*" element={<RequireAdminAuth />}>
                      <Route element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} /> {/* /admin へのアクセスで AdminDashboard を表示 */}
                        <Route path="articles" element={<AdminArticleList />} />
                        <Route path="articles/new" element={<AdminArticleCreate />} />
                        <Route path="articles/:slug/edit" element={<AdminArticleEdit />} />
                      </Route>
                    </Route>
                    <Route path="/terms-of-service" element={<TermsOfService />} /> {/* 追加 */}
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} /> {/* 追加 */}
                  </Routes>
                </Suspense>
              </div>
              <Footer /> {/* フッターを追加 */}
            </div>
          )}
        </div>
      </Router>
    </HelmetProvider>
  );
};

export default App;