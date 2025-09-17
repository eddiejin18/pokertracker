import React, { useState, useEffect } from 'react';
import { X, DollarSign, MapPin, Calendar, Clock, Gamepad2, Users, FileText } from 'lucide-react';
import ApiService from '../services/api';

const SessionPanel = ({ isOpen, onClose, onSessionAdded, selectedDate, editingSession }) => {
  const formatLocalDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [formData, setFormData] = useState({
    gameType: 'No Limit Hold\'em',
    blinds: '',
    location: '',
    locationType: 'home',
    casinoName: '',
    buyIn: '',
    endAmount: '',
    duration: '',
    notes: '',
    sessionDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [casinoSuggestions, setCasinoSuggestions] = useState([]);
  const [showCasinoSuggestions, setShowCasinoSuggestions] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const pokerVariations = [
    'No Limit Hold\'em',
    'Pot Limit Omaha',
    'No Limit Omaha',
    'Limit Hold\'em',
    'Limit Omaha',
    '7-Card Stud',
    'Razz',
    '2-7 Triple Draw',
    'Badugi',
    'Mixed Games'
  ];

  const commonBlinds = [
    '$0.25/$0.50',
    '$0.50/$1',
    '$1/$2',
    '$1/$3',
    '$2/$5',
    '$3/$6',
    '$5/$10',
    '$10/$20',
    '$25/$50',
    '$50/$100',
    '$100/$200'
  ];

  const tournamentBuyIns = [
    '$5',
    '$10',
    '$20',
    '$50',
    '$100',
    '$200',
    '$500',
    '$1000'
  ];

  // Comprehensive casino database by major cities
  const mockCasinos = [
    // Las Vegas, NV
    'Bellagio (Las Vegas)',
    'Aria Resort & Casino (Las Vegas)',
    'Caesars Palace (Las Vegas)',
    'MGM Grand (Las Vegas)',
    'Wynn Las Vegas',
    'Venetian Resort (Las Vegas)',
    'Mirage (Las Vegas)',
    'Planet Hollywood (Las Vegas)',
    'Luxor (Las Vegas)',
    'Excalibur (Las Vegas)',
    'New York-New York (Las Vegas)',
    'Paris Las Vegas',
    'Bally\'s (Las Vegas)',
    'Flamingo (Las Vegas)',
    'Harrah\'s (Las Vegas)',
    'Rio All-Suite Hotel (Las Vegas)',
    'Palms Casino Resort (Las Vegas)',
    'Red Rock Casino (Las Vegas)',
    'Green Valley Ranch (Las Vegas)',
    'Suncoast Hotel & Casino (Las Vegas)',
    'Circus Circus (Las Vegas)',
    'Treasure Island (Las Vegas)',
    'The Cosmopolitan (Las Vegas)',
    'Encore (Las Vegas)',
    'Resorts World (Las Vegas)',
    
    // Atlantic City, NJ
    'Borgata Hotel Casino & Spa (Atlantic City)',
    'Caesars Atlantic City',
    'Harrah\'s Atlantic City',
    'Tropicana Atlantic City',
    'Hard Rock Hotel & Casino (Atlantic City)',
    'Ocean Casino Resort (Atlantic City)',
    'Resorts Casino Hotel (Atlantic City)',
    'Golden Nugget (Atlantic City)',
    'Bally\'s Atlantic City',
    'Showboat (Atlantic City)',
    
    // Los Angeles, CA
    'Commerce Casino (Los Angeles)',
    'Bicycle Casino (Los Angeles)',
    'Hollywood Park Casino (Los Angeles)',
    'Hustler Casino (Los Angeles)',
    'Lucky Lady Casino (Los Angeles)',
    'Crystal Casino (Los Angeles)',
    'Gardens Casino (Los Angeles)',
    'Normandie Casino (Los Angeles)',
    
    // San Francisco Bay Area, CA
    'Bay 101 (San Jose)',
    'M8trix (San Jose)',
    'Graton Resort & Casino (Rohnert Park)',
    'Cache Creek Casino Resort (Brooks)',
    'Thunder Valley Casino Resort (Lincoln)',
    'Harrah\'s Northern California (Ione)',
    'Jackson Rancheria Casino Resort (Jackson)',
    'Red Hawk Casino (Placerville)',
    
    // San Diego, CA
    'Sycuan Casino Resort (El Cajon)',
    'Barona Resort & Casino (Lakeside)',
    'Viejas Casino & Resort (Alpine)',
    'Valley View Casino & Hotel (Valley Center)',
    'Jamul Casino (Jamul)',
    'Pechanga Resort Casino (Temecula)',
    
    // Phoenix, AZ
    'Talking Stick Resort (Scottsdale)',
    'Wild Horse Pass (Chandler)',
    'Desert Diamond Casino (Glendale)',
    'Casino Arizona (Scottsdale)',
    'Gila River Casino (Chandler)',
    'Lone Butte Casino (Chandler)',
    'Vee Quiva Casino (Laveen)',
    
    // Denver, CO
    'Ameristar Casino Resort (Black Hawk)',
    'Monarch Casino Resort Spa (Black Hawk)',
    'Golden Gates Casino (Black Hawk)',
    'Golden Gulch Casino (Black Hawk)',
    'The Lodge Casino (Black Hawk)',
    'Mardi Gras Casino (Black Hawk)',
    'Z Casino (Black Hawk)',
    
    // Chicago, IL
    'Rivers Casino (Des Plaines)',
    'Harrah\'s Joliet',
    'Hollywood Casino (Joliet)',
    'Grand Victoria Casino (Elgin)',
    'Casino Queen (East St. Louis)',
    'Argosy Casino (Alton)',
    
    // Detroit, MI
    'MotorCity Casino Hotel (Detroit)',
    'MGM Grand Detroit',
    'Greektown Casino (Detroit)',
    'Caesars Windsor (Windsor, ON)',
    'Soaring Eagle Casino (Mount Pleasant)',
    'FireKeepers Casino (Battle Creek)',
    
    // New Orleans, LA
    'Harrah\'s New Orleans',
    'Boomtown Casino (Harvey)',
    'Treasure Chest Casino (Kenner)',
    'Coushatta Casino Resort (Kinder)',
    'L\'Auberge Casino Resort (Lake Charles)',
    'Golden Nugget (Lake Charles)',
    
    // Miami, FL
    'Seminole Hard Rock Hotel & Casino (Hollywood)',
    'Magic City Casino (Miami)',
    'Calder Casino (Miami Gardens)',
    'Gulfstream Park (Hallandale Beach)',
    'Seminole Casino Coconut Creek',
    'Seminole Casino Immokalee',
    
    // Tampa, FL
    'Seminole Hard Rock Hotel & Casino (Tampa)',
    'Tampa Bay Downs (Tampa)',
    'Seminole Casino (Tampa)',
    
    // Orlando, FL
    'Seminole Hard Rock Hotel & Casino (Tampa)',
    'Daytona Beach Racing',
    'Palm Beach Kennel Club',
    
    // Dallas, TX
    'WinStar World Casino (Thackerville, OK)',
    'Choctaw Casino Resort (Durant, OK)',
    'Riverwind Casino (Norman, OK)',
    'Winstar Casino (Thackerville, OK)',
    
    // Houston, TX
    'Sam Houston Race Park (Houston)',
    'Gulf Greyhound Park (La Marque)',
    'Retama Park (Selma)',
    
    // Austin, TX
    'Kickapoo Lucky Eagle Casino (Eagle Pass)',
    'Naskila Gaming (Livingston)',
    'Speaking Rock Entertainment (El Paso)',
    
    // Seattle, WA
    'Tulalip Resort Casino (Tulalip)',
    'Snoqualmie Casino (Snoqualmie)',
    'Muckleshoot Casino (Auburn)',
    'Emerald Queen Casino (Tacoma)',
    'Quil Ceda Creek Casino (Tulalip)',
    'Angel of the Winds Casino (Arlington)',
    
    // Portland, OR
    'Spirit Mountain Casino (Grand Ronde)',
    'Chinook Winds Casino Resort (Lincoln City)',
    'Seven Feathers Casino Resort (Canyonville)',
    'Wildhorse Resort & Casino (Pendleton)',
    'Three Rivers Casino (Florence)',
    
    // Reno, NV
    'Peppermill Resort Spa Casino (Reno)',
    'Atlantis Casino Resort Spa (Reno)',
    'Eldorado Resort Casino (Reno)',
    'Silver Legacy Resort Casino (Reno)',
    'Circus Circus (Reno)',
    'Grand Sierra Resort (Reno)',
    'Harrah\'s (Reno)',
    
    // Laughlin, NV
    'Colorado Belle (Laughlin)',
    'Edgewater Casino Resort (Laughlin)',
    'Golden Nugget (Laughlin)',
    'Harrah\'s (Laughlin)',
    'Aquarius Casino Resort (Laughlin)',
    'Tropicana (Laughlin)',
    
    // Biloxi, MS
    'Beau Rivage Resort & Casino (Biloxi)',
    'Hard Rock Hotel & Casino (Biloxi)',
    'Golden Nugget (Biloxi)',
    'IP Casino Resort Spa (Biloxi)',
    'Palace Casino Resort (Biloxi)',
    'Treasure Bay Casino (Biloxi)',
    
    // Tunica, MS
    'Gold Strike Casino Resort (Tunica)',
    'Horseshoe Casino (Tunica)',
    'Sam\'s Town (Tunica)',
    'Hollywood Casino (Tunica)',
    'Fitz Casino (Tunica)',
    
    // Kansas City, MO
    'Ameristar Casino Hotel (Kansas City)',
    'Harrah\'s North Kansas City',
    'Argosy Casino (Riverside)',
    'Isle of Capri (Boonville)',
    
    // St. Louis, MO
    'River City Casino (St. Louis)',
    'Lumiere Place (St. Louis)',
    'Ameristar Casino (St. Charles)',
    'Hollywood Casino (Maryland Heights)',
    
    // Minneapolis, MN
    'Mystic Lake Casino Hotel (Prior Lake)',
    'Treasure Island Resort & Casino (Welch)',
    'Grand Casino Mille Lacs (Onamia)',
    'Grand Casino Hinckley (Hinckley)',
    'Running Aces (Columbus)',
    
    // Milwaukee, WI
    'Potawatomi Hotel & Casino (Milwaukee)',
    'Ho-Chunk Gaming (Madison)',
    'Oneida Casino (Green Bay)',
    'Menominee Casino Resort (Keshena)',
    
    // Cleveland, OH
    'Jack Cleveland Casino (Cleveland)',
    'Hollywood Casino (Toledo)',
    'Hollywood Casino (Columbus)',
    'Belterra Park (Cincinnati)',
    'Hard Rock Casino (Cincinnati)',
    
    // Pittsburgh, PA
    'Rivers Casino (Pittsburgh)',
    'The Meadows Racetrack & Casino (Washington)',
    'Hollywood Casino (Washington)',
    'Mountaineer Casino (New Cumberland, WV)',
    
    // Philadelphia, PA
    'SugarHouse Casino (Philadelphia)',
    'Parx Casino (Bensalem)',
    'Harrah\'s Philadelphia (Chester)',
    'Valley Forge Casino Resort (King of Prussia)',
    
    // Baltimore, MD
    'Horseshoe Casino (Baltimore)',
    'Live! Casino & Hotel (Hanover)',
    'MGM National Harbor (Oxon Hill)',
    'Rocky Gap Casino Resort (Flintstone)',
    
    // Washington, DC
    'MGM National Harbor (Oxon Hill)',
    'Live! Casino & Hotel (Hanover)',
    'Horseshoe Casino (Baltimore)',
    
    // Boston, MA
    'Plainridge Park Casino (Plainville)',
    'Encore Boston Harbor (Everett)',
    'MGM Springfield (Springfield)',
    'Twin River Casino (Lincoln, RI)',
    
    // New York, NY
    'Resorts World Casino (Queens)',
    'Empire City Casino (Yonkers)',
    'Tioga Downs Casino (Nichols)',
    'Del Lago Resort & Casino (Waterloo)',
    'Rivers Casino & Resort (Schenectady)',
    
    // Buffalo, NY
    'Seneca Niagara Resort & Casino (Niagara Falls)',
    'Seneca Allegany Resort & Casino (Salamanca)',
    'Seneca Buffalo Creek Casino (Buffalo)',
    'Fallsview Casino Resort (Niagara Falls, ON)',
    'Casino Niagara (Niagara Falls, ON)',
    
    // Toronto, ON
    'Woodbine Casino (Toronto)',
    'Great Blue Heron Casino (Port Perry)',
    'Casino Rama (Rama)',
    'Fallsview Casino Resort (Niagara Falls)',
    'Casino Niagara (Niagara Falls)',
    
    // Montreal, QC
    'Casino de Montréal',
    'Casino du Lac-Leamy (Gatineau)',
    'Casino de Charlevoix (Pointe-au-Pic)',
    
    // Vancouver, BC
    'River Rock Casino Resort (Richmond)',
    'Hard Rock Casino (Coquitlam)',
    'Cascades Casino (Langley)',
    'Starlight Casino (New Westminster)',
    
    // Online Casinos
    'PokerStars (Online)',
    '888poker (Online)',
    'PartyPoker (Online)',
    'WSOP.com (Online)',
    'BetMGM Poker (Online)',
    'Caesars Poker (Online)',
    'Borgata Poker (Online)',
    'Unibet Poker (Online)',
    'GGPoker (Online)',
    'WPT Global (Online)',
    'ACR Poker (Online)',
    'Black Chip Poker (Online)',
    'BetOnline (Online)',
    'SportsBetting (Online)',
    'Ignition Casino (Online)'
  ];

  useEffect(() => {
    if (editingSession) {
      // Populate form with editing session data
      // Handle both date strings and full timestamps
      const sessionDate = editingSession.timestamp.includes('T') 
        ? new Date(editingSession.timestamp).toISOString().split('T')[0]
        : editingSession.timestamp;
      
      setFormData({
        gameType: editingSession.game_type || 'No Limit Hold\'em',
        blinds: editingSession.blinds || '',
        location: editingSession.location_type === 'home' ? editingSession.location || '' : '',
        locationType: editingSession.location_type || 'home',
        casinoName: editingSession.location_type === 'casino' ? editingSession.location || '' : '',
        buyIn: editingSession.buy_in ? editingSession.buy_in.toString() : '',
        endAmount: editingSession.end_amount ? editingSession.end_amount.toString() : '',
        duration: editingSession.duration ? editingSession.duration.toString() : '',
        notes: editingSession.notes || '',
        sessionDate: sessionDate
      });
    } else if (selectedDate) {
      // Reset form for new session
      setFormData({
        gameType: 'No Limit Hold\'em',
        blinds: '',
        location: '',
        locationType: 'home',
        casinoName: '',
        buyIn: '',
        endAmount: '',
        duration: '',
        notes: '',
        sessionDate: formatLocalDate(selectedDate)
      });
    }
  }, [selectedDate, editingSession]);

  // Reset closing state when panel opens
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      onClose();
    }, 200); // 200ms matches the transition duration
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Handle casino search with city grouping
    if (name === 'casinoName' && value.length > 0) {
      const searchTerm = value.toLowerCase();
      const filtered = mockCasinos.filter(casino =>
        casino.toLowerCase().includes(searchTerm)
      );
      
      // Group by city for better organization
      const grouped = filtered.reduce((acc, casino) => {
        const cityMatch = casino.match(/\(([^)]+)\)$/);
        const city = cityMatch ? cityMatch[1] : 'Other';
        if (!acc[city]) acc[city] = [];
        acc[city].push(casino);
        return acc;
      }, {});
      
      setCasinoSuggestions(grouped);
      setShowCasinoSuggestions(true);
    } else if (name === 'casinoName' && value.length === 0) {
      setShowCasinoSuggestions(false);
    }
  };

  const handleCasinoSelect = (casino) => {
    setFormData(prev => ({
      ...prev,
      casinoName: casino
    }));
    setShowCasinoSuggestions(false);
  };

  const calculateWinnings = () => {
    const buyIn = parseFloat(formData.buyIn) || 0;
    const endAmount = parseFloat(formData.endAmount) || 0;
    return endAmount - buyIn;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const winnings = calculateWinnings();
      const dateOnly = formData.sessionDate || (selectedDate ? formatLocalDate(selectedDate) : null);
      const normalizedTimestamp = dateOnly ? `${dateOnly}T12:00:00` : new Date().toISOString().split('T')[0] + 'T12:00:00';
      const sessionData = {
        gameType: formData.gameType,
        blinds: formData.blinds,
        location: formData.locationType === 'casino' ? formData.casinoName : formData.location,
        locationType: formData.locationType,
        buyIn: parseFloat(formData.buyIn) || 0,
        endAmount: parseFloat(formData.endAmount) || 0,
        winnings: winnings,
        duration: parseFloat(formData.duration) || 0,
        notes: formData.notes,
        // Always send a normalized date-time to avoid timezone shifts
        timestamp: normalizedTimestamp
      };
      

      if (editingSession) {
        await ApiService.updateSession(editingSession.id, sessionData);
      } else {
        await ApiService.createSession(sessionData);
      }
      
      onSessionAdded();
      
      // Reset form
      setFormData({
        gameType: 'No Limit Hold\'em',
        blinds: '',
        location: '',
        locationType: 'home',
        casinoName: '',
        buyIn: '',
        endAmount: '',
        duration: '',
        notes: '',
        sessionDate: ''
      });
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Failed to save session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const winnings = calculateWinnings();

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onMouseDown={handleClose}
    >
      <div
        className={`bg-white dark:bg-black rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-black/10 dark:border-white/30 transition-all duration-200 ${
          isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-black/10 dark:border-white/30">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {editingSession ? 'Edit Poker Session' : 'Add Poker Session'}
            </h2>
            {selectedDate && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Game Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Gamepad2 className="h-4 w-4 inline mr-1" />
                Poker Variation
              </label>
              <select
                name="gameType"
                value={formData.gameType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white"
                required
              >
                {pokerVariations.map(variation => (
                  <option key={variation} value={variation}>{variation}</option>
                ))}
              </select>
            </div>

            {/* Blinds/Stakes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Blinds/Stakes
              </label>
              <select
                name="blinds"
                value={formData.blinds}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white"
              >
                <option value="">Select blinds</option>
                {commonBlinds.map(blind => (
                  <option key={blind} value={blind}>{blind}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <MapPin className="h-4 w-4 inline mr-1" />
              Location Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center text-gray-700 dark:text-gray-300">
                <input
                  type="radio"
                  name="locationType"
                  value="home"
                  checked={formData.locationType === 'home'}
                  onChange={handleInputChange}
                  className="mr-2 text-blue-600 dark:text-blue-400"
                />
                Home Game
              </label>
              <label className="flex items-center text-gray-700 dark:text-gray-300">
                <input
                  type="radio"
                  name="locationType"
                  value="casino"
                  checked={formData.locationType === 'casino'}
                  onChange={handleInputChange}
                  className="mr-2 text-blue-600 dark:text-blue-400"
                />
                Casino
              </label>
            </div>
          </div>

          {/* Location Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {formData.locationType === 'casino' ? 'Casino Name' : 'Location'}
            </label>
            {formData.locationType === 'casino' ? (
              <div className="relative">
                <input
                  type="text"
                  name="casinoName"
                  value={formData.casinoName}
                  onChange={handleInputChange}
                  placeholder="Search for casino..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                {showCasinoSuggestions && Object.keys(casinoSuggestions).length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-black border border-gray-300 dark:border-white/20 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {Object.entries(casinoSuggestions).map(([city, casinos]) => (
                      <div key={city}>
                        <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-white/10">
                          {city}
                        </div>
                        {casinos.map((casino, index) => (
                          <button
                            key={`${city}-${index}`}
                            type="button"
                            onClick={() => handleCasinoSelect(casino)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white"
                          >
                            {casino}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., John's house, Online, etc."
                className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            )}
          </div>

          {/* Session Date - Only show when editing or as optional field */}
          {(editingSession || formData.sessionDate) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Session Date
              </label>
              <input
                type="date"
                name="sessionDate"
                value={formData.sessionDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white"
              />
            </div>
          )}

          {/* Show date field button for new sessions */}
          {!editingSession && !formData.sessionDate && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, sessionDate: selectedDate ? formatLocalDate(selectedDate) : formatLocalDate(new Date()) }))}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white underline"
              >
                Change session date
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Buy-in */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Buy-in Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                name="buyIn"
                value={formData.buyIn}
                onChange={handleInputChange}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
            </div>

            {/* End Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                name="endAmount"
                value={formData.endAmount}
                onChange={handleInputChange}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Duration (hours)
              </label>
              <input
                type="number"
                step="0.25"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
            </div>
          </div>

          {/* Profit/Loss Display */}
          {formData.buyIn && formData.endAmount && (
            <div className={`p-4 rounded-lg ${
              winnings >= 0 ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Session Result:</span>
                <span className={`text-lg font-bold ${
                  winnings >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {winnings >= 0 ? '+' : ''}${winnings.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Notable hands, observations, or any other notes..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-white dark:bg-black text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Saving...' : (editingSession ? 'Update Session' : 'Save Session')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionPanel;
