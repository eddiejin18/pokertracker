import React, { useEffect } from 'react';

const SEOContent = () => {
  useEffect(() => {
    // Update page title and meta tags based on URL
    const path = window.location.pathname;
    
    const seoConfigs = {
      '/free-poker-tracker-app': {
        title: 'Free Poker Tracker App | Download Best Poker Tracking App',
        description: 'Download the best free poker tracker app. Professional poker tracking app that works better than Poker Tracker 4. Free poker tracker app download available.',
        keywords: 'free poker tracker app, poker tracker app, download poker tracker app, best poker tracker app'
      },
      '/free-poker-tracker-download': {
        title: 'Free Poker Tracker Download | Best Poker Tracking Software',
        description: 'Free poker tracker download - get the best poker tracking software. Download our free poker tracker that beats Poker Tracker 4 free versions.',
        keywords: 'free poker tracker download, poker tracker download, download free poker tracker, poker tracking software download'
      },
      '/best-free-poker-tracker': {
        title: 'Best Free Poker Tracker | Top Rated Poker Tracking Software',
        description: 'The best free poker tracker available. Top rated poker tracking software that outperforms Poker Tracker 4. Best free poker tracker for serious players.',
        keywords: 'best free poker tracker, top poker tracker, best poker tracking software, free poker tracker review'
      },
      '/poker-tracker-4': {
        title: 'Poker Tracker 4 Alternative | Better Free Poker Tracker',
        description: 'Better alternative to Poker Tracker 4. Our free poker tracker outperforms Poker Tracker 4 with modern interface and better features.',
        keywords: 'poker tracker 4, poker tracker 4 alternative, poker tracker 4 vs, poker tracker 4 review'
      },
      '/poker-tracker-4-free': {
        title: 'Poker Tracker 4 Free Alternative | Better Free Poker Tracker',
        description: 'Better than Poker Tracker 4 free version. Our completely free poker tracker offers more features than Poker Tracker 4 free.',
        keywords: 'poker tracker 4 free, poker tracker 4 free alternative, poker tracker 4 free vs, poker tracker 4 free download'
      },
      '/poker-tracker-app': {
        title: 'Poker Tracker App | Best Mobile Poker Tracking App',
        description: 'The best poker tracker app for mobile and desktop. Professional poker tracking app that works on all devices. Free poker tracker app.',
        keywords: 'poker tracker app, poker tracking app, mobile poker tracker, poker tracker mobile app'
      },
      '/poker-bankroll-tracker': {
        title: 'Poker Bankroll Tracker | Free Bankroll Management Software',
        description: 'Free poker bankroll tracker for managing your poker bankroll. Best poker bankroll management software that works better than PT4.',
        keywords: 'poker bankroll tracker, poker bankroll management, free poker bankroll tracker, bankroll management software'
      },
      '/online-poker-tracker': {
        title: 'Online Poker Tracker | Best Online Poker Tracking Software',
        description: 'The best online poker tracker for all poker sites. Online poker tracking software that works with any online poker room.',
        keywords: 'online poker tracker, online poker tracking, poker tracker online, online poker tracking software'
      },
      '/poker-tracker-download': {
        title: 'Poker Tracker Download | Free Poker Tracking Software Download',
        description: 'Download the best free poker tracker software. Poker tracker download free with no hidden costs or subscriptions.',
        keywords: 'poker tracker download, poker tracker download free, download poker tracker, poker tracking software download'
      },
      '/poker-tracker-pt4': {
        title: 'Poker Tracker PT4 Alternative | Better Than Poker Tracker PT4',
        description: 'Better alternative to Poker Tracker PT4. Our free poker tracker outperforms PT4 with modern interface and better features.',
        keywords: 'poker tracker pt4, poker tracker pt4 alternative, poker tracker pt4 vs, poker tracker pt4 free'
      },
      '/poker-tracker-free': {
        title: 'Poker Tracker Free | Best Free Poker Tracking Software',
        description: 'The best free poker tracker available. Completely free poker tracking software with no hidden costs or limitations.',
        keywords: 'poker tracker free, free poker tracker, poker tracker free download, free poker tracking software'
      }
    };

    const config = seoConfigs[path];
    if (config) {
      // Update title
      document.title = config.title;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', config.description);
      }
      
      // Update meta keywords
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', metaKeywords.getAttribute('content') + ', ' + config.keywords);
      }
      
      // Update Open Graph title
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', config.title);
      }
      
      // Update Open Graph description
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', config.description);
      }
    }
  }, []);

  return null; // This component doesn't render anything visible
};

export default SEOContent;
