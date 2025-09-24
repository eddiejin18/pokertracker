import React from 'react';
import { ArrowRight, Calendar, DollarSign, BarChart3, CheckCircle, Star, Users, TrendingUp, Clock, Target, Zap } from 'lucide-react';
import { ThemeProvider } from './ThemeProvider';
import ThemeToggle from './ThemeToggle';

const LandingPage = ({ onGetStarted }) => {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-black">
      {/* Navigation */}
      <nav className="relative px-6 py-6 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="h-10 w-10 rounded-xl overflow-hidden flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <img src="/favicon.png" alt="Poker Tracker" className="h-8 w-8 object-contain" />
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
            Trusted by 10,000+ poker players
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight animate-fade-in" style={{ animationDelay: '0.4s' }}>
            The poker tracker built for <span className="text-gray-500 dark:text-gray-400">serious players</span>
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
                    <span className="text-white text-sm font-medium">SB</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Spencer Brown</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">+$150 • 2.5 hours</div>
                  </div>
                </div>
                <div className="text-green-600 dark:text-green-400 font-semibold">+$150</div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">JG</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Jennifer Green</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">-$75 • 1.5 hours</div>
                  </div>
                </div>
                <div className="text-red-600 dark:text-red-400 font-semibold">-$75</div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">BT</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Brandon Teal</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">+$300 • 4 hours</div>
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

      {/* Social Proof Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 animate-fade-in" style={{ animationDelay: '1.5s' }}>
            Trusted by poker players worldwide
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '1.6s' }}>
            Join thousands of players who've improved their game with our free poker tracker
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 animate-fade-in" style={{ animationDelay: '1.7s' }}>
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              "Finally, a poker tracker that's actually easy to use. I've been tracking my sessions for 6 months and my hourly rate has improved by 40%."
            </p>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">MJ</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Mike Johnson</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Professional Player</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 animate-fade-in" style={{ animationDelay: '1.8s' }}>
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              "Better than Poker Tracker 4 and completely free. The interface is clean and the analytics are exactly what I need."
            </p>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">SL</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Sarah Lee</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Tournament Player</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 animate-fade-in" style={{ animationDelay: '1.9s' }}>
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              "I was using Excel spreadsheets before this. This is so much easier and gives me better insights into my game."
            </p>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">DR</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">David Rodriguez</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Cash Game Player</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center animate-fade-in" style={{ animationDelay: '2.0s' }}>
          <div className="inline-flex items-center space-x-8 text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span className="font-semibold">10,000+</span>
              <span>Active Users</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold">$2.5M+</span>
              <span>Tracked Winnings</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">50,000+</span>
              <span>Hours Tracked</span>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 animate-fade-in" style={{ animationDelay: '2.1s' }}>
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 animate-fade-in" style={{ animationDelay: '2.2s' }}>
            Everything you need to know about our free poker tracker
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 animate-fade-in" style={{ animationDelay: '2.3s' }}>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Is this poker tracker really free?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Yes! Our poker tracker is completely free to use. Record your sessions, manage your bankroll, and analyze your performance without any cost or hidden fees.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 animate-fade-in" style={{ animationDelay: '2.4s' }}>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              How is this better than Excel spreadsheets?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Our poker tracker is much easier to use than Excel spreadsheets. No complex formulas or manual calculations - just simple, clean features designed specifically for poker players.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 animate-fade-in" style={{ animationDelay: '2.5s' }}>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Can I track sessions from multiple sites?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Absolutely! Record sessions from any poker site or live games. Our software combines everything into one comprehensive view of your performance across all platforms.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 animate-fade-in" style={{ animationDelay: '2.6s' }}>
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
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 animate-fade-in" style={{ animationDelay: '2.7s' }}>
            Ready to improve your poker game?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 animate-fade-in" style={{ animationDelay: '2.8s' }}>
            Join thousands of players using the best free poker tracker. Start tracking your sessions today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '2.9s' }}>
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
      <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="animate-fade-in" style={{ animationDelay: '3.0s' }}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                  <img src="/favicon.png" alt="Poker Tracker" className="h-6 w-6 object-contain" />
                </div>
                <span className="text-xl font-semibold text-gray-900 dark:text-white">Poker Tracker</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                The best free poker tracker for serious players. Track your sessions, manage your bankroll, and improve your game.
              </p>
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: '3.1s' }}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: '3.2s' }}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: '3.3s' }}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between animate-fade-in" style={{ animationDelay: '3.4s' }}>
            <div className="text-gray-600 dark:text-gray-300 text-sm">
              © 2025 Poker Tracker. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">Terms</a>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">Privacy</a>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">Cookies</a>
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
