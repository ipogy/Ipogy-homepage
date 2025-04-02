export interface Service {
    id: string;
    name: string;
    description: string;
    url: string; // 外部リンクの URL を追加
    icon?: string; // アイコンのパス (例: '/images/website-icon.png') または React コンポーネント
    price?: string; // 料金に関する情報 (例: '基本料金 ¥100,000〜', '個別見積もり')
    displayPrice?: boolean; // 料金表示のオンオフフラグ
    // 必要に応じて他の情報 (アイコンなど) を追加
  }
  
  export const servicesData: Service[] = [
    {
      id: '1',
      name: '中国語学習支援', //自信が芽生える中国語
      description: '中国語学習を効果的にサポートするツールやリソースを提供します。レベルに合わせた学習コンテンツで目標達成を支援します。',
      url: 'https://cpop-to-tyuugokubunka.org', // 実際の外部リンクURLに置き換える
      icon: '/images/00074-422372899.png', // アイコンのパス
      price: '無料',
      displayPrice: true,
    },
    {
      id: '2',
      name: '希望の言語ノベル（近日公開）', //現エスペラントノベル
      description: 'エスペラント語学習者向けのインタラクティブなノベルゲームです。物語を楽しみながら、自然に語彙や文法を習得できます。',
      url: '', // 実際の外部リンクURLに置き換える
      icon: '/novel.svg', // アイコンのパス
      price: 'ご支援待ってます💛（※無料）',
      displayPrice: true,
    },
    {
      id: '3',
      name: 'カスタムソフトウェア開発',
      description: '業務効率化のためのシステム開発、ウェブアプリケーション開発、モバイルアプリケーション開発など、お客様の課題を解決するプログラミングサービスを提供します。',
      url: '/contact', // 実際の外部リンクURLに置き換える
      icon: '/software.jpg', // アイコンのパス
      price: '個別見積もり',
      displayPrice: true, 
    },
    {
      id: '4',
      name: '開発レポジトリ',
      description: '個人で開発しているWeb開発やツール開発などのオープンソースプロジェクトを公開しています。ぜひ詳細をご覧ください。',
      url: 'https://github.com/ipogy', // 実際の外部リンクURLに置き換える
      icon: '/github.png', // アイコンのパス
      price: '',
      displayPrice: false, 
    },
    {
      id: '5',
      name: '技術ブログ',
      description: 'プログラミング、Web開発、AI技術など、幅広い技術に関する知識やノウハウを発信します。学習や問題解決にご活用ください。　※当サイト',
      url: '/blog', // 実際の外部リンクURLに置き換える
      icon: '/icon_bg.svg', // アイコンのパス
      price: '',
      displayPrice: false,
    },
    {
      id: '6',
      name: 'CPOP音楽紹介ブログ',
      description: 'CPOP大好き！HSK5級のブログ主が、独自の視点で中国・台湾の素敵な音楽をお届けします。（はてなブログに遷移します）',
      url: 'https://chinaculturesongs.hatenablog.com/', // 実際の外部リンクURLに置き換える
      icon: '/images/cpop.svg', // アイコンのパス
      price: '',
      displayPrice: false,
    },
    // 他のサービスも同様に URL を追加
  ];