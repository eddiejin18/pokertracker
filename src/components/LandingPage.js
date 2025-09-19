import React from 'react';
import { ArrowRight } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      {/* Navigation */}
      <nav className="relative px-6 py-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center border border-black/20 bg-white">
              <img src="/favicon.png" alt="Poker Tracker" className="h-6 w-6 object-contain" />
            </div>
            <span className="text-xl font-medium text-black">Poker Tracker</span>
          </div>
          <button
            onClick={onGetStarted}
            className="border border-black text-black px-6 py-2 font-medium hover:bg-black hover:text-white transition-colors duration-200 flex items-center space-x-2 animate-fade-in"
            style={{ animationDelay: '0.2s' }}
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-32">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-light text-black mb-8 leading-tight animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Free Poker Tracker
          </h1>
          <p className="text-lg text-black mb-12 max-w-2xl mx-auto font-light leading-relaxed animate-fade-in" style={{ animationDelay: '0.4s' }}>
            The best free poker tracker for serious players. Manage your bankroll, analyze your sessions, and improve your game with simple, clean tools that work better than Excel spreadsheets.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-black text-white px-8 py-3 font-medium text-lg hover:bg-gray-800 transition-colors duration-200 animate-fade-in"
            style={{ animationDelay: '0.5s' }}
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-light text-black mb-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            Everything You Need to Improve
          </h2>
          <p className="text-lg text-black max-w-2xl mx-auto font-light animate-fade-in" style={{ animationDelay: '0.7s' }}>
            Professional features without the complexity. Record your sessions, analyze your performance, and manage your bankroll with tools designed for serious players.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <div className="w-16 h-16 border border-black flex items-center justify-center mx-auto mb-6">
              <div className="h-8 w-8 rounded overflow-hidden flex items-center justify-center border border-black/20 bg-white">
                <img src="/favicon.png" alt="Track Poker Winnings" className="h-6 w-6 object-contain" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-black mb-4">
              Session Recording
            </h3>
            <p className="text-black font-light leading-relaxed">
              Record every poker session with wins, losses, and time played. Get detailed insights into your performance across all game types.
            </p>
          </div>

          <div className="text-center animate-fade-in" style={{ animationDelay: '0.9s' }}>
            <div className="w-16 h-16 border border-black flex items-center justify-center mx-auto mb-6">
              <div className="h-8 w-8 rounded overflow-hidden flex items-center justify-center border border-black/20 bg-white">
                <img src="/favicon.png" alt="Profit Tracker Poker" className="h-6 w-6 object-contain" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-black mb-4">
              Bankroll Management
            </h3>
            <p className="text-black font-light leading-relaxed">
              Monitor your bankroll growth and track your profit over time. See your hourly rates and performance trends with clear, actionable insights.
            </p>
          </div>

          <div className="text-center animate-fade-in" style={{ animationDelay: '1.0s' }}>
            <div className="w-16 h-16 border border-black flex items-center justify-center mx-auto mb-6">
              <div className="h-8 w-8 rounded overflow-hidden flex items-center justify-center border border-black/20 bg-white">
                <img src="/favicon.png" alt="Better Than Excel" className="h-6 w-6 object-contain" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-black mb-4">
              Smart Analytics
            </h3>
            <p className="text-black font-light leading-relaxed">
              Modern interface that's easier than Excel spreadsheets. Clean charts, automatic calculations, and professional analytics that help you improve your game.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-light text-black mb-6 animate-fade-in" style={{ animationDelay: '1.1s' }}>
            How It Works
          </h2>
          <p className="text-lg text-black max-w-2xl mx-auto font-light animate-fade-in" style={{ animationDelay: '1.2s' }}>
            Improve your poker game in three simple steps. No complex spreadsheets or formulas needed.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center animate-fade-in" style={{ animationDelay: '1.3s' }}>
            <div className="w-16 h-16 border border-black flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-light text-black">1</span>
            </div>
            <h3 className="text-lg font-medium text-black mb-4">
              Create Sessions
            </h3>
            <p className="text-black font-light leading-relaxed">
              Add poker sessions to your calendar with wins, losses, and time played. Works with any game type or poker site.
            </p>
          </div>

          <div className="text-center animate-fade-in" style={{ animationDelay: '1.4s' }}>
            <div className="w-16 h-16 border border-black flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-light text-black">2</span>
            </div>
            <h3 className="text-lg font-medium text-black mb-4">
              Automatic Analysis
            </h3>
            <p className="text-black font-light leading-relaxed">
              Our software automatically calculates your hourly rate, profit trends, and bankroll growth. No manual calculations needed.
            </p>
          </div>

          <div className="text-center animate-fade-in" style={{ animationDelay: '1.5s' }}>
            <div className="w-16 h-16 border border-black flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-light text-black">3</span>
            </div>
            <h3 className="text-lg font-medium text-black mb-4">
              Track Your Progress
            </h3>
            <p className="text-black font-light leading-relaxed">
              View clean charts and insights to improve your game. Much easier than managing spreadsheets manually.
            </p>
          </div>
        </div>
      </div>

      {/* Why We Built This Section */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-light text-black mb-6 animate-fade-in" style={{ animationDelay: '1.6s' }}>
            Why We Built This
          </h2>
          <p className="text-lg text-black max-w-2xl mx-auto font-light animate-fade-in" style={{ animationDelay: '1.7s' }}>
            Most poker trackers are outdated, confusing, and expensive. We created this because poker players deserve better.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-light text-black mb-6 animate-fade-in" style={{ animationDelay: '1.8s' }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-8">
          <div className="border-b border-gray-300 pb-6 animate-fade-in" style={{ animationDelay: '1.9s' }}>
            <h3 className="text-lg font-medium text-black mb-3">
              Is this poker tracker really free?
            </h3>
            <p className="text-black font-light">
              Yes! Our poker tracker is completely free to use. Record your sessions, manage your bankroll, and analyze your performance without any cost.
            </p>
          </div>

          <div className="border-b border-gray-300 pb-6 animate-fade-in" style={{ animationDelay: '2.0s' }}>
            <h3 className="text-lg font-medium text-black mb-3">
              How is this better than Excel spreadsheets?
            </h3>
            <p className="text-black font-light">
              Our poker tracker is much easier to use than Excel spreadsheets. No complex formulas or manual calculations - just simple, clean features designed for poker players.
            </p>
          </div>

          <div className="border-b border-gray-300 pb-6 animate-fade-in" style={{ animationDelay: '2.1s' }}>
            <h3 className="text-lg font-medium text-black mb-3">
              Can I track sessions from multiple sites?
            </h3>
            <p className="text-black font-light">
              Absolutely! Record sessions from any poker site or live games. Our software combines everything into one comprehensive view of your performance.
            </p>
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '2.2s' }}>
            <h3 className="text-lg font-medium text-black mb-3">
              What poker statistics can I track?
            </h3>
            <p className="text-black font-light">
              Track wins, losses, profit, hourly rates, session duration, and bankroll growth. Everything you need to analyze and improve your poker game.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-6 py-32">
        <div className="text-center">
          <h2 className="text-3xl font-light text-black mb-8 animate-fade-in" style={{ animationDelay: '2.3s' }}>
            Start Your Free Poker Tracker Today
          </h2>
          <p className="text-lg text-black mb-12 font-light animate-fade-in" style={{ animationDelay: '2.4s' }}>
            Join players using the best free poker tracker to improve their game. No Excel spreadsheets needed.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-black text-white px-8 py-3 font-medium text-lg hover:bg-gray-800 transition-colors duration-200 animate-fade-in"
            style={{ animationDelay: '2.5s' }}
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-black py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0 animate-fade-in" style={{ animationDelay: '2.6s' }}>
              <div className="h-6 w-6 rounded overflow-hidden flex items-center justify-center border border-black/20 bg-white">
                <img src="/favicon.png" alt="Poker Tracker" className="h-4 w-4 object-contain" />
              </div>
              <span className="font-medium text-black">Poker Tracker</span>
            </div>
            <div className="text-black text-sm font-light animate-fade-in" style={{ animationDelay: '2.7s' }}>
              © 2025 Poker Tracker. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
