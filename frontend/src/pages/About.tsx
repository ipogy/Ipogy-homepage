import React from 'react';
import styles from './About.module.css';
import logoImage from '/icon.svg'
import GitHubIcon from '@mui/icons-material/GitHub';
import XIcon from '@mui/icons-material/X';
import InstagramIcon from '@mui/icons-material/Instagram';
import { SiSession } from "react-icons/si";
import { SiDiscord } from "react-icons/si";
import { Helmet } from 'react-helmet-async';
import { toast, ToastContainer } from 'react-toastify';

const SESSION_ID ='05de7acf65f6c09f7a22f43cb041cd59c90c7f91d22397fa316d6f5c8eb9041d14';
const DISCORD_ID ='_shanshan_3';

const About: React.FC = () => {
  const handleCopySessionId = async () => {
    if (!SESSION_ID) {
      toast.error('Session IDが設定されていません。');
      return;
    }

    try {
      await navigator.clipboard.writeText(SESSION_ID);
      toast.success('クリップボードにコピーしました！');
    } catch (err) {
      console.error('クリップボードへのコピーに失敗しました:', err);
      toast.error('コピーに失敗しました。');
    }
  };

  const handleCopyDiscordId = async () => {
    if (!DISCORD_ID) {
      toast.error('Session IDが設定されていません。');
      return;
    }

    try {
      await navigator.clipboard.writeText(DISCORD_ID);
      toast.success('クリップボードにコピーしました！');
    } catch (err) {
      console.error('クリップボードへのコピーに失敗しました:', err);
      toast.error('コピーに失敗しました。');
    }
  };

  return (
    <div className="page-container">
    <Helmet>
      <title>About Us | Ipogy</title>
    </Helmet>
    <div className={styles.aboutContentWrapper}>
    <div className={styles.aboutContent}>
      <h1>About Us</h1>
      <ToastContainer />
      <img src={logoImage} alt="サイトのロゴ" className={styles.logoImage} />
      <hr />
        <div className={styles.socialLinks}>
          <div className={styles.tooltipWrapper} data-tooltip="Githubを開く">
            <a href="https://github.com/ipogy" title="Githubを開く" target="_blank" rel="noopener noreferrer" aria-label="Github">
              <GitHubIcon className={styles.socialIcon} />
            </a>
          </div>
          <div className={styles.tooltipWrapper} data-tooltip="Xを開く">
            <a href="https://x.com/sugi_h_en" title="Xを開く" target="_blank" rel="noopener noreferrer" aria-label="X">
              <XIcon className={styles.socialIcon} />
            </a>
          </div>
          <div className={styles.tooltipWrapper} data-tooltip="Instagramを開く">
            <a href="https://www.instagram.com/s.g.haru/" title="Instagramを開く" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <InstagramIcon className={styles.socialIcon} />
            </a>
          </div>
          {/* 必要に応じて他のソーシャルメディアリンクを追加 */}
        </div>
        <div className={styles.socialLinksButton}>
          <div className={styles.tooltipWrapper} data-tooltip="Session IDをコピー">
          <button
            onClick={handleCopySessionId}
            aria-label="Copy Session ID"
            title="Session IDをコピー"
            className={styles.socialIconButton}
          >
            <SiSession className={styles.socialIcon} style={{ marginRight: '8px' }} />
            <span>Session ID</span>
          </button>
          </div>
          <div className={styles.tooltipWrapper} data-tooltip="Discord IDをコピー">
          <button
            onClick={handleCopyDiscordId}
            aria-label="Copy Discord UserID"
            title="Discordのユーザー名をコピー"
            className={styles.socialIconButton}
          >
            <SiDiscord className={styles.socialIcon} style={{ marginRight: '8px' }} />
            <span>_shanshan_3</span>
          </button>
          </div>
        </div>
      <div className={styles.aboutTextContent}>
      <p>　　未来のビッグプロジェクトを夢見る大学生、"Ipogy"と申します！肩書ですか？そうですね…『自宅兼開発室代表』、『深夜のコーディング担当』、そして『たまにいる近所のお兄さん』といったところでしょうか。ええ、実質フルオーナーならぬフルソロオーナー、かつ学業との二刀流です！</p>
      <p>　　この度はこちらのサイトにお越しいただき、誠にありがとうございます。普段は大学の講義とレポートに追われつつ（そして、たまにサークルの活動に精を出しつつ）、皆様のお役に立てるようなサービスやコンテンツを開発しております。</p>
      <p>　　『About Us』と立派に飾りたい気持ちはあるのですが、実際は『About Me！』、チームメンバーは私一人。少数精鋭…というより、正真正銘のワンオペです！しかし、その分、フットワークの軽さと、自分の理想をダイレクトに反映できる点が強みだと考えています。</p>
      <p>　　まだまだ未熟な点も多いと感じておりますが、皆様からの温かい応援を励みに、より価値のあるものを提供できるよう邁進してまいりますので、どうぞよろしくお願いいたします！</p>
      {/* 後で具体的なコンテンツを追加 */}
      </div>
    </div>
    </div>
    </div>
  );
};

export default About;