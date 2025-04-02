import React from 'react';
import { Link as RouterLink, LinkProps } from 'react-router-dom';

interface CustomLinkProps extends LinkProps {
  children: React.ReactNode;
}

const ScrollToTopLink: React.FC<CustomLinkProps> = ({ to, children, ...rest }) => {
  const handleClick = () => {
    window.scrollTo(0, 0); // ページの一番上にスクロール
  };

  return (
    <RouterLink to={to} onClick={handleClick} {...rest}>
      {children}
    </RouterLink>
  );
};

export default ScrollToTopLink;