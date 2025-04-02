import React from 'react';
import styles from './Footer.module.css';
import GitHubIcon from '@mui/icons-material/GitHub';
import XIcon from '@mui/icons-material/X';
import InstagramIcon from '@mui/icons-material/Instagram';
import ScrollToTopLink from './ScrollToTopLink'; // 作成したカスタム Link 

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <p className={styles.copyright}>&copy; 2025 Shanshan CS & Language. All rights reserved.</p>
        <div className={styles.socialLinks}>
          <a href="https://github.com/ipogy" target="_blank" rel="noopener noreferrer" aria-label="Github">
            <GitHubIcon className={styles.socialIcon} />
          </a>
          <a href="https://x.com/sugi_h_en" target="_blank" rel="noopener noreferrer" aria-label="X">
            <XIcon className={styles.socialIcon} />
          </a>
          <a href="https://www.instagram.com/s.g.haru/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <InstagramIcon className={styles.socialIcon} />
          </a>
          {/* 必要に応じて他のソーシャルメディアリンクを追加 */}
        </div>
        <nav className={styles.siteMap}>
          <ul>
            <li><ScrollToTopLink to="/privacy-policy">プライバシーポリシー</ScrollToTopLink></li>
            <li><ScrollToTopLink to="/terms-of-service">利用規約</ScrollToTopLink></li>
            <li><ScrollToTopLink to="/contact">お問い合わせ</ScrollToTopLink></li>
            {/* 必要に応じて他のサイトマップリンクを追加 */}
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;