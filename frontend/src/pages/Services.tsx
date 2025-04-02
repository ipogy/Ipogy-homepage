import React from 'react';
import styles from './Services.module.css';
import { servicesData } from '../../data/services-data';
import { Helmet } from 'react-helmet-async';

const Services: React.FC = () => {
  return (
    <div className="page-container">
      <Helmet>
        <title> サービス一覧 | Ipogy </title>
      </Helmet>
      <div className={styles.servicesPageWrapper}>
      <div className={styles.servicesPage}>
      <h1>Services</h1>
      <div className={styles.servicesList}>
        {servicesData.map((service) => (
          <div key={service.id} className={styles.serviceCard}>
            {service.icon && (
              <div className={styles.iconContainer}>
              <a
                href={service.url}
                className={styles.serviceIconLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={service.icon} alt={`${service.name} のアイコン`} className={styles.serviceIcon} />
                </a>
              </div>
            )}
            <h3>{service.name}</h3>
            <p>{service.description}</p>
            {service.price && service.displayPrice && ( // displayPrice が true の場合のみ表示
              <p className={styles.servicePrice}>料金: {service.price}</p>
            )}
            <a
              href={service.url}
              className={styles.learnMoreButton}
              target="_blank"
              rel="noopener noreferrer"
            >
              詳細はこちら
            </a>
          </div>
        ))}
      </div>
      </div>
      </div>
    </div>
  );
};

export default Services;