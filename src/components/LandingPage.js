import React, { useState } from 'react';
import { ArrowRight, Calendar, DollarSign, BarChart3, CheckCircle, Star, Users, TrendingUp, Clock, Target, Zap, Mail } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import SupportModal from './SupportModal';

const LandingPage = ({ onGetStarted }) => {
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Navigation */}
      <nav className="relative px-6 py-6 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="h-10 w-10 rounded-xl overflow-hidden flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-white">
              <img src="/favicon.png" alt="Poker Tracker" className="h-8 w-8 object-contain dark:hidden" />
              <img src="/invertedicon.png" alt="Poker Tracker" className="h-8 w-8 object-contain hidden dark:block" />
            </div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">Poker Tracker</span>
          </div>
          <div className="flex items-center space-x-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <ThemeToggle />
            <button
              onClick={onGetStarted}
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2 shadow-sm"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Star className="w-4 h-4 mr-2 text-yellow-500" />
            Completely free and simple to use
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight animate-fade-in" style={{ animationDelay: '0.4s' }}>
            The poker tracker built for <span className="text-gray-500 dark:text-gray-400">winning</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto font-normal leading-relaxed animate-fade-in" style={{ animationDelay: '0.5s' }}>
            Track your poker sessions, manage your bankroll, and improve your game with professional analytics. 
            Better than Excel spreadsheets, easier than complex software.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <button
              onClick={onGetStarted}
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2 shadow-lg"
            >
              <span>Start Tracking Free</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Setup in 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 animate-fade-in" style={{ animationDelay: '0.7s' }}>
            All-in-one poker tracking platform
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-normal animate-fade-in" style={{ animationDelay: '0.8s' }}>
            Professional poker tracking without the complexity. Everything you need to analyze your game and improve your results.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.9s' }}>
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mb-6">
              <Calendar className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Session Recording
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              Record every poker session with wins, losses, and time played. Get detailed insights into your performance across all game types and stakes.
            </p>
            <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 font-medium">
              <span>Learn more</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '1.0s' }}>
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mb-6">
              <DollarSign className="h-7 w-7 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Bankroll Management
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              Monitor your bankroll growth and track your profit over time. See your hourly rates and performance trends with clear, actionable insights.
            </p>
            <div className="flex items-center text-sm text-green-600 dark:text-green-400 font-medium">
              <span>Learn more</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '1.1s' }}>
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mb-6">
              <BarChart3 className="h-7 w-7 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Smart Analytics
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              Modern interface that's easier than Excel spreadsheets. Clean charts, automatic calculations, and professional analytics that help you improve your game.
            </p>
            <div className="flex items-center text-sm text-purple-600 dark:text-purple-400 font-medium">
              <span>Learn more</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Build a poker tracking engine Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 animate-fade-in" style={{ animationDelay: '1.2s' }}>
            Build a poker tracking engine
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Mock interface */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 animate-fade-in" style={{ animationDelay: '1.3s' }}>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">PS</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">PokerStars</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">+$150 • 2.5 hours • Jan 15</div>
                  </div>
                </div>
                <div className="text-green-600 dark:text-green-400 font-semibold">+$150</div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">GG</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">GGPoker</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">-$75 • 1.5 hours • Jan 14</div>
                  </div>
                </div>
                <div className="text-red-600 dark:text-red-400 font-semibold">-$75</div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">AC</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Aria Casino</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">+$300 • 4 hours • Jan 13</div>
                  </div>
                </div>
                <div className="text-green-600 dark:text-green-400 font-semibold">+$300</div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Today's Summary</div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">+$375</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">8 hours • $46.88/hr</div>
            </div>
          </div>

          {/* Right side - Description */}
          <div className="animate-fade-in" style={{ animationDelay: '1.4s' }}>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Track sessions anywhere.
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Record every poker session — cash games, tournaments, live games, online poker — in a single view. 
              Get instant insights into your performance across all game types.
            </p>
            <button className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2">
              <span>Learn about Session Tracking</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="mt-8 space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Track cash games and tournaments in one place</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Automatic hourly rate calculations</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Works with any poker site or live games</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 animate-fade-in" style={{ animationDelay: '1.5s' }}>
            Analytics that matter
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '1.6s' }}>
            Get insights into your poker performance with clear charts and statistics
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Analytics description */}
          <div className="animate-fade-in" style={{ animationDelay: '1.7s' }}>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Track your progress over time.
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              See your bankroll growth, hourly rates, and performance trends with professional analytics. 
              Much better than Excel spreadsheets for tracking your poker results.
            </p>
            <button className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2">
              <span>Learn about Analytics</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="mt-8 space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Visual charts and graphs for easy understanding</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Automatic hourly rate calculations</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Track performance across different game types</span>
              </div>
            </div>
          </div>

          {/* Right side - Mock analytics interface */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 animate-fade-in" style={{ animationDelay: '1.8s' }}>
            <div className="space-y-6">
              {/* Performance Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">This Month</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">+$2,450</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">+12.5% vs last month</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Hourly Rate</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">$28.50</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Last 30 days</div>
                </div>
              </div>

              {/* Bankroll Chart Mock */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-3">Bankroll Growth</div>
                <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded flex items-end space-x-1">
                  <div className="w-4 bg-green-400 h-8 rounded-t"></div>
                  <div className="w-4 bg-green-400 h-12 rounded-t"></div>
                  <div className="w-4 bg-green-400 h-16 rounded-t"></div>
                  <div className="w-4 bg-green-400 h-20 rounded-t"></div>
                  <div className="w-4 bg-green-400 h-24 rounded-t"></div>
                  <div className="w-4 bg-green-400 h-18 rounded-t"></div>
                  <div className="w-4 bg-green-400 h-22 rounded-t"></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                </div>
              </div>

              {/* Session Summary */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Weekly Summary</div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-900 dark:text-blue-100">7</div>
                    <div className="text-xs text-blue-700 dark:text-blue-300">Sessions</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-900 dark:text-blue-100">28.5h</div>
                    <div className="text-xs text-blue-700 dark:text-blue-300">Total Time</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-900 dark:text-blue-100">$812</div>
                    <div className="text-xs text-blue-700 dark:text-blue-300">Profit</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 animate-fade-in" style={{ animationDelay: '1.9s' }}>
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 animate-fade-in" style={{ animationDelay: '2.0s' }}>
            Everything you need to know about our free poker tracker
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 animate-fade-in" style={{ animationDelay: '2.1s' }}>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Is this poker tracker really free?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Yes! Our poker tracker is completely free to use. Record your sessions, manage your bankroll, and analyze your performance without any cost or hidden fees.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 animate-fade-in" style={{ animationDelay: '2.2s' }}>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              How is this better than Excel spreadsheets?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Our poker tracker is much easier to use than Excel spreadsheets. No complex formulas or manual calculations - just simple, clean features designed specifically for poker players.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 animate-fade-in" style={{ animationDelay: '2.3s' }}>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Can I track sessions from multiple sites?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Absolutely! Record sessions from any poker site or live games. Our software combines everything into one comprehensive view of your performance across all platforms.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 animate-fade-in" style={{ animationDelay: '2.4s' }}>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              What poker statistics can I track?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Track wins, losses, profit, hourly rates, session duration, and bankroll growth. Everything you need to analyze and improve your poker game with professional insights.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 animate-fade-in" style={{ animationDelay: '2.5s' }}>
            Ready to improve your poker game?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 animate-fade-in" style={{ animationDelay: '2.6s' }}>
            Start tracking your sessions today with the best free poker tracker.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '2.7s' }}>
            <button
              onClick={onGetStarted}
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2 shadow-lg"
            >
              <span>Start Tracking Free</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Setup in 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="animate-fade-in" style={{ animationDelay: '2.8s' }}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center border border-gray-600 bg-white">
                  <img src="/favicon.png" alt="Poker Tracker" className="h-6 w-6 object-contain dark:hidden" />
                  <img src="/invertedicon.png" alt="Poker Tracker" className="h-6 w-6 object-contain hidden dark:block" />
                </div>
                <span className="text-xl font-semibold text-white">Poker Tracker</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                The best free poker tracker for serious players. Track your sessions, manage your bankroll, and improve your game.
              </p>
              <button
                onClick={() => setIsSupportOpen(true)}
                className="inline-flex items-center space-x-2 bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 text-sm"
              >
                <Mail className="w-4 h-4" />
                <span>Contact Us</span>
              </button>
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: '2.9s' }}>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Session Tracking</a></li>
              </ul>
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: '3.0s' }}>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tutorials</a></li>
              </ul>
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: '3.1s' }}>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row items-center justify-between animate-fade-in" style={{ animationDelay: '3.2s' }}>
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 Poker Tracker. All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Cookies</a>
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
      
      {/* Support Modal */}
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
    </div>
  );
};

export default LandingPage;
