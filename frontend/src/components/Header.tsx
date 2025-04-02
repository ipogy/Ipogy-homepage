import React, { useState, useEffect, useRef }  from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css'; // CSS Modules
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ScrollToTopLink from './ScrollToTopLink'; // 作成したカスタム Link

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const isFirstRender = useRef(true); // 初回レンダリングを追跡する ref
  
    const toggleMenu = () => {
      setIsMenuOpen(!isMenuOpen);
    };

    useEffect(() => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }
      // location が変更されたときにメニューを閉じる
      setIsMenuOpen(false);
    }, [location]); // 依存配列から isMenuOpen を削除

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to="/" onClick={() => setIsMenuOpen(false)}>
        <span>Ipogy</span>
        </Link>
      </div>
      <nav className={`${styles.nav} ${isMenuOpen ? styles.open : ''}`}>
        <ul>
          <li><ScrollToTopLink to="/" onClick={() => setIsMenuOpen(false)}>Home</ScrollToTopLink></li>
          <li><ScrollToTopLink to="/about" onClick={() => setIsMenuOpen(false)}>About</ScrollToTopLink></li>
          <li><ScrollToTopLink to="/services" onClick={() => setIsMenuOpen(false)}>Services</ScrollToTopLink></li>
          <li><ScrollToTopLink to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</ScrollToTopLink></li>
          <li><ScrollToTopLink to="/blog" onClick={() => setIsMenuOpen(false)}>Blog</ScrollToTopLink></li>
          {/* 他のナビゲーションリンク */}
        </ul>
      </nav>
      <button className={styles.hamburger} onClick={toggleMenu}>
        {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
      </button>
    </header>
  );
};

export default Header;