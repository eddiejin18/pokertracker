import React from 'react';
import { ArrowRight, Calendar, DollarSign, BarChart3 } from 'lucide-react';
import { ThemeProvider } from './ThemeProvider';
import ThemeToggle from './ThemeToggle';

const LandingPage = ({ onGetStarted }) => {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-black">
      {/* Navigation */}
      <nav className="relative px-6 py-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center border border-black dark:border-white/20 bg-white">
              <img src="/favicon.png" alt="Poker Tracker" className="h-6 w-6 object-contain" />
            </div>
            <span className="text-xl font-medium text-black dark:text-white">Poker Tracker</span>
          </div>
          <div className="flex items-center space-x-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <ThemeToggle />
            <button
              onClick={onGetStarted}
              className="border border-black dark:border-white text-black dark:text-white px-6 py-2 font-medium hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-colors duration-200 flex items-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-32">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-light text-black dark:text-white mb-8 leading-tight animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Free Poker Tracker
          </h1>
          <p className="text-lg text-black dark:text-white mb-12 max-w-2xl mx-auto font-light leading-relaxed animate-fade-in" style={{ animationDelay: '0.4s' }}>
            The best free poker tracker for serious players. Manage your bankroll, analyze your sessions, and improve your game with simple, clean tools that work better than Excel spreadsheets.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 font-medium text-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200 animate-fade-in"
            style={{ animationDelay: '0.5s' }}
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-light text-black dark:text-white mb-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            Everything You Need to Improve
          </h2>
          <p className="text-lg text-black dark:text-white max-w-2xl mx-auto font-light animate-fade-in" style={{ animationDelay: '0.7s' }}>
            Professional features without the complexity. Record your sessions, analyze your performance, and manage your bankroll with tools designed for serious players.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <div className="w-16 h-16 border border-black dark:border-white flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-8 w-8 text-black dark:text-white" />
            </div>
            <h3 className="text-lg font-medium text-black dark:text-white mb-4">
              Session Recording
            </h3>
            <p className="text-black dark:text-white font-light leading-relaxed">
              Record every poker session with wins, losses, and time played. Get detailed insights into your performance across all game types.
            </p>
          </div>

          <div className="text-center animate-fade-in" style={{ animationDelay: '0.9s' }}>
            <div className="w-16 h-16 border border-black dark:border-white flex items-center justify-center mx-auto mb-6">
              <DollarSign className="h-8 w-8 text-black dark:text-white" />
            </div>
            <h3 className="text-lg font-medium text-black dark:text-white mb-4">
              Bankroll Management
            </h3>
            <p className="text-black dark:text-white font-light leading-relaxed">
              Monitor your bankroll growth and track your profit over time. See your hourly rates and performance trends with clear, actionable insights.
            </p>
          </div>

          <div className="text-center animate-fade-in" style={{ animationDelay: '1.0s' }}>
            <div className="w-16 h-16 border border-black dark:border-white flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="h-8 w-8 text-black dark:text-white" />
            </div>
            <h3 className="text-lg font-medium text-black dark:text-white mb-4">
              Smart Analytics
            </h3>
            <p className="text-black dark:text-white font-light leading-relaxed">
              Modern interface that's easier than Excel spreadsheets. Clean charts, automatic calculations, and professional analytics that help you improve your game.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-light text-black dark:text-white mb-6 animate-fade-in" style={{ animationDelay: '1.1s' }}>
            How It Works
          </h2>
          <p className="text-lg text-black dark:text-white max-w-2xl mx-auto font-light animate-fade-in" style={{ animationDelay: '1.2s' }}>
            Improve your poker game in three simple steps. No complex spreadsheets or formulas needed.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center animate-fade-in" style={{ animationDelay: '1.3s' }}>
            <div className="w-16 h-16 border border-black dark:border-white flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-light text-black dark:text-white">1</span>
            </div>
            <h3 className="text-lg font-medium text-black dark:text-white mb-4">
              Create Sessions
            </h3>
            <p className="text-black dark:text-white font-light leading-relaxed">
              Add poker sessions to your calendar with wins, losses, and time played. Works with any game type or poker site.
            </p>
          </div>

          <div className="text-center animate-fade-in" style={{ animationDelay: '1.4s' }}>
            <div className="w-16 h-16 border border-black dark:border-white flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-light text-black dark:text-white">2</span>
            </div>
            <h3 className="text-lg font-medium text-black dark:text-white mb-4">
              Automatic Analysis
            </h3>
            <p className="text-black dark:text-white font-light leading-relaxed">
              Our software automatically calculates your hourly rate, profit trends, and bankroll growth. No manual calculations needed.
            </p>
          </div>

          <div className="text-center animate-fade-in" style={{ animationDelay: '1.5s' }}>
            <div className="w-16 h-16 border border-black dark:border-white flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-light text-black dark:text-white">3</span>
            </div>
            <h3 className="text-lg font-medium text-black dark:text-white mb-4">
              Track Your Progress
            </h3>
            <p className="text-black dark:text-white font-light leading-relaxed">
              View clean charts and insights to improve your game. Much easier than managing spreadsheets manually.
            </p>
          </div>
        </div>
      </div>

      {/* Why We Built This Section */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-light text-black dark:text-white mb-6 animate-fade-in" style={{ animationDelay: '1.6s' }}>
            Why We Built This
          </h2>
          <p className="text-lg text-black dark:text-white max-w-2xl mx-auto font-light animate-fade-in" style={{ animationDelay: '1.7s' }}>
            Most poker trackers are outdated, confusing, and expensive. We created this because poker players deserve better.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-light text-black dark:text-white mb-6 animate-fade-in" style={{ animationDelay: '1.8s' }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-8">
          <div className="border-b border-gray-300 dark:border-gray-600 pb-6 animate-fade-in" style={{ animationDelay: '1.9s' }}>
            <h3 className="text-lg font-medium text-black dark:text-white mb-3">
              Is this poker tracker really free?
            </h3>
            <p className="text-black dark:text-white font-light">
              Yes! Our poker tracker is completely free to use. Record your sessions, manage your bankroll, and analyze your performance without any cost.
            </p>
          </div>

          <div className="border-b border-gray-300 dark:border-gray-600 pb-6 animate-fade-in" style={{ animationDelay: '2.0s' }}>
            <h3 className="text-lg font-medium text-black dark:text-white mb-3">
              How is this better than Excel spreadsheets?
            </h3>
            <p className="text-black dark:text-white font-light">
              Our poker tracker is much easier to use than Excel spreadsheets. No complex formulas or manual calculations - just simple, clean features designed for poker players.
            </p>
          </div>

          <div className="border-b border-gray-300 dark:border-gray-600 pb-6 animate-fade-in" style={{ animationDelay: '2.1s' }}>
            <h3 className="text-lg font-medium text-black dark:text-white mb-3">
              Can I track sessions from multiple sites?
            </h3>
            <p className="text-black dark:text-white font-light">
              Absolutely! Record sessions from any poker site or live games. Our software combines everything into one comprehensive view of your performance.
            </p>
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '2.2s' }}>
            <h3 className="text-lg font-medium text-black dark:text-white mb-3">
              What poker statistics can I track?
            </h3>
            <p className="text-black dark:text-white font-light">
              Track wins, losses, profit, hourly rates, session duration, and bankroll growth. Everything you need to analyze and improve your poker game.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-6 py-32">
        <div className="text-center">
          <h2 className="text-3xl font-light text-black dark:text-white mb-8 animate-fade-in" style={{ animationDelay: '2.3s' }}>
            Start Your Free Poker Tracker Today
          </h2>
          <p className="text-lg text-black dark:text-white mb-12 font-light animate-fade-in" style={{ animationDelay: '2.4s' }}>
            Join players using the best free poker tracker to improve their game. No Excel spreadsheets needed.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 font-medium text-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200 animate-fade-in"
            style={{ animationDelay: '2.5s' }}
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-black dark:border-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0 animate-fade-in" style={{ animationDelay: '2.6s' }}>
              <div className="h-6 w-6 rounded overflow-hidden flex items-center justify-center border border-black dark:border-white/20 bg-white">
                <img src="/favicon.png" alt="Poker Tracker" className="h-4 w-4 object-contain" />
              </div>
              <span className="font-medium text-black dark:text-white">Poker Tracker</span>
            </div>
            <div className="text-black dark:text-white text-sm font-light animate-fade-in" style={{ animationDelay: '2.7s' }}>
              © 2025 Poker Tracker. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
      
      {/* Hidden SEO Content */}
      <div style={{ display: 'none' }}>
        <h1>Free Poker Tracker App - Best Free Poker Tracker Download</h1>
        <h2>Poker Tracker 4 Free Alternative - Poker Tracker App</h2>
        <h3>Download Free Poker Tracker App - Best Poker Tracking Software</h3>
        <p>
          Looking for the best free poker tracker? Our free poker tracker app is better than Poker Tracker 4 free versions. 
          Download our free poker tracker app today. This is the best free poker tracker available online. 
          Get your free poker tracker download now. Our poker tracker app works better than Poker Tracker 4.
          Free poker tracker app download available. Best free poker tracker for serious players.
          Poker Tracker 4 free alternative that's actually free. Download free poker tracker app.
          The best free poker tracker app for mobile and desktop. Free poker tracker download with no hidden costs.
          Poker Tracker 4 free version alternative. Best free poker tracker app download. Poker tracker app that beats Poker Tracker 4.
          Free poker tracker app download for Windows, Mac, and mobile. Best free poker tracker with advanced features.
          Poker Tracker 4 free alternative with better interface. Download the best free poker tracker app today.
          The best poker bankroll tracker for online poker players. Online poker tracker that works with all poker sites.
          Free poker tracker download for bankroll management. Poker tracker pt4 alternative that's completely free.
          Online poker tracker app for mobile and desktop. Poker tracker download free with no hidden costs.
          Poker bankroll tracker that beats Poker Tracker PT4. Online poker tracking software for serious players.
          Free poker bankroll tracker with advanced analytics. Poker tracker pt4 free alternative with better features.
          Online poker tracker app download available. Poker tracker software that works better than PT4.
          Poker bankroll management with our free poker tracker. Online poker tracker free download.
        </p>
        <div>
          <span>free poker tracker app</span>
          <span>free poker tracker download</span>
          <span>best free poker tracker</span>
          <span>poker tracker 4</span>
          <span>poker tracker 4 free</span>
          <span>poker tracker app</span>
          <span>download free poker tracker app</span>
          <span>best poker tracker app</span>
          <span>poker tracker 4 alternative</span>
          <span>free poker tracking software</span>
          <span>poker tracker mobile app</span>
          <span>poker tracker 4 free download</span>
          <span>poker bankroll tracker</span>
          <span>online poker tracker</span>
          <span>poker tracker download</span>
          <span>poker tracker pt4</span>
          <span>poker tracker free</span>
          <span>poker bankroll management</span>
          <span>online poker tracking</span>
          <span>poker tracker software</span>
          <span>poker tracker pt4 alternative</span>
          <span>free poker bankroll tracker</span>
          <span>online poker tracker app</span>
          <span>poker tracker download free</span>
          <span>poker tracker pt4 free</span>
        </div>
        <ul>
          <li>Free poker tracker app download</li>
          <li>Best free poker tracker software</li>
          <li>Poker Tracker 4 free alternative</li>
          <li>Download poker tracker app</li>
          <li>Free poker tracking app</li>
          <li>Poker tracker 4 vs free tracker</li>
          <li>Poker bankroll tracker free</li>
          <li>Online poker tracker app</li>
          <li>Poker tracker download free</li>
          <li>Poker tracker pt4 alternative</li>
          <li>Poker tracker free download</li>
          <li>Online poker tracking software</li>
          <li>Poker bankroll management tracker</li>
          <li>Poker tracker pt4 free</li>
        </ul>
      </div>
      </div>
    </ThemeProvider>
  );
};

export default LandingPage;
