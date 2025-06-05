import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { translations } from './translations';
import './App.css';

export default function ClickerGame() {
  // États du jeu
  const [clicks, setClicks] = useState(0);
  const [clickPower, setClickPower] = useState(1);
  const [autoClickers, setAutoClickers] = useState(0);
  const [language, setLanguage] = useState('fr');
  const [darkMode, setDarkMode] = useState(false);

  // Prestige
  const [prestigeLevel, setPrestigeLevel] = useState(0);
  const [prestigePoints, setPrestigePoints] = useState(0);

  // Améliorations
  const [upgrades, setUpgrades] = useState({
    multiplicateur: { level: 1, cost: 50 },
    goldenClick: { active: false, duration: 10 },
    prestige: {
      clickPower: { level: 0, cost: 100 },
      autoClicker: { level: 0, cost: 200 },
      goldenTime: { level: 0, cost: 300 }
    }
  });

  // Traductions
  const t = translations[language];

  // Sauvegarde
  useEffect(() => {
    const saveGame = {
      clicks,
      clickPower,
      autoClickers,
      upgrades,
      prestigeLevel,
      prestigePoints,
      language,
      darkMode
    };
    localStorage.setItem('clickerSave', JSON.stringify(saveGame));
  }, [clicks, clickPower, autoClickers, upgrades, prestigeLevel, prestigePoints, language, darkMode]);

  // Chargement
  useEffect(() => {
    const savedGame = JSON.parse(localStorage.getItem('clickerSave'));
    if (savedGame) {
      setClicks(savedGame.clicks || 0);
      setClickPower(savedGame.clickPower || 1);
      setAutoClickers(savedGame.autoClickers || 0);
      setUpgrades(savedGame.upgrades || {
        multiplicateur: { level: 1, cost: 50 },
        goldenClick: { active: false, duration: 10 },
        prestige: {
          clickPower: { level: 0, cost: 100 },
          autoClicker: { level: 0, cost: 200 },
          goldenTime: { level: 0, cost: 300 }
        }
      });
      setPrestigeLevel(savedGame.prestigeLevel || 0);
      setPrestigePoints(savedGame.prestigePoints || 0);
      setLanguage(savedGame.language || 'fr');
      setDarkMode(savedGame.darkMode || false);
    }
  }, []);

  // Autoclicker
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoClickers > 0) {
        const basePower = clickPower * (1 + prestigeLevel * 0.01 + upgrades.prestige.clickPower.level * 0.02);
        const multiplier = upgrades.multiplicateur.level;
        setClicks(prev => prev + autoClickers * basePower * multiplier);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [autoClickers, clickPower, upgrades]);

  // Golden Click
  useEffect(() => {
    if (upgrades.goldenClick.active) {
      const timer = setTimeout(() => {
        setUpgrades(prev => ({
          ...prev,
          goldenClick: { ...prev.goldenClick, active: false }
        }));
      }, upgrades.goldenClick.duration * 1000);
      return () => clearTimeout(timer);
    }
  }, [upgrades.goldenClick.active]);

  // Fonctions
  const handleClick = () => {
    const basePower = clickPower * (1 + prestigeLevel * 0.01 + upgrades.prestige.clickPower.level * 0.02);
    const multiplier = upgrades.multiplicateur.level;
    const goldenMultiplier = upgrades.goldenClick.active ? 5 : 1;
    setClicks(prev => prev + basePower * multiplier * goldenMultiplier);
  };

  const buyAutoClicker = () => {
    const cost = 10 * Math.pow(1.15, autoClickers);
    if (clicks >= cost) {
      setClicks(prev => prev - cost);
      setAutoClickers(prev => prev + 1);
    }
  };

  const buyUpgrade = (type) => {
    const upgrade = upgrades[type];
    if (clicks >= upgrade.cost) {
      setClicks(prev => prev - upgrade.cost);
      setUpgrades(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          level: prev[type].level + 1,
          cost: prev[type].cost * 2
        }
      }));
    }
  };

  const activateGoldenClick = () => {
    if (clicks >= 1000 && !upgrades.goldenClick.active) {
      setClicks(prev => prev - 1000);
      setUpgrades(prev => ({
        ...prev,
        goldenClick: {
          ...prev.goldenClick,
          active: true,
          duration: 10 + upgrades.prestige.goldenTime.level * 5
        }
      }));
    }
  };

  const performPrestige = () => {
    if (clicks >= 1_000_000) {
      const pointsEarned = Math.floor(clicks / 1_000_000);
      setPrestigeLevel(prev => prev + pointsEarned);
      setPrestigePoints(prev => prev + pointsEarned);
      resetGame();
    }
  };

  const resetGame = () => {
    setClicks(0);
    setClickPower(1);
    setAutoClickers(0);
    setUpgrades({
      multiplicateur: { level: 1, cost: 50 },
      goldenClick: { active: false, duration: 10 },
      prestige: upgrades.prestige
    });
  };

  const buyPrestigeUpgrade = (type) => {
    const upgrade = upgrades.prestige[type];
    if (prestigePoints >= upgrade.cost) {
      setPrestigePoints(prev => prev - upgrade.cost);
      setUpgrades(prev => ({
        ...prev,
        prestige: {
          ...prev.prestige,
          [type]: {
            ...prev.prestige[type],
            level: prev.prestige[type].level + 1,
            cost: prev.prestige[type].cost * 2
          }
        }
      }));
    }
  };

  // Calculs
  const productionPerSecond = useMemo(() => {
    const basePower = clickPower * (1 + prestigeLevel * 0.01 + upgrades.prestige.clickPower.level * 0.02);
    return autoClickers * basePower * upgrades.multiplicateur.level;
  }, [autoClickers, clickPower, upgrades, prestigeLevel]);

  const autoClickerCost = useMemo(() => Math.floor(10 * Math.pow(1.15, autoClickers)), [autoClickers]);

  return (
    <div className={`game-container ${darkMode ? 'dark' : 'light'}`}>
      {/* Bouton thème en haut à droite */}
      <button 
        onClick={() => setDarkMode(!darkMode)} 
        className="theme-toggle"
        aria-label="Toggle theme"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      {/* Bouton langue en bas à gauche */}
      <div className="language-selector">
        <button 
          onClick={() => setLanguage(lang => lang === 'fr' ? 'es' : 'fr')}
          className="language-button"
          aria-label="Toggle language"
        >
          {t.languageToggle}
        </button>
      </div>

      <div className="main-content">
        <h1>{t.gameTitle}</h1>

        {/* Section Clic */}
        <div className="click-section">
          <motion.div className="click-display">
            <span className="points-display">
              {formatNumber(clicks)} {t.points}
              {upgrades.goldenClick.active && <span className="golden-effect">{t.goldenEffect}</span>}
            </span>
            <motion.button
              onClick={handleClick}
              className="click-button"
              whileTap={{ scale: 0.95 }}
            >
              {t.clickMe}
            </motion.button>
          </motion.div>
        </div>

        {/* Boutique */}
        <div className="shop-section">
          <h2>{t.shopTitle}</h2>
          
          <div className="shop-item">
            <h3>{t.autoClicker} ({formatNumber(autoClickerCost)} {t.points})</h3>
            <button 
              onClick={buyAutoClicker} 
              className="shop-button"
              disabled={clicks < autoClickerCost}
            >
              Acheter
            </button>
            <p className="quantity">{t.quantity}: {autoClickers} ({formatNumber(productionPerSecond)}/s)</p>
          </div>

          <div className="shop-item">
            <h3>{t.multiplier} x{upgrades.multiplicateur.level + 1} ({formatNumber(upgrades.multiplicateur.cost)} {t.points})</h3>
            <button 
              onClick={() => buyUpgrade('multiplicateur')} 
              className="shop-button"
              disabled={clicks < upgrades.multiplicateur.cost}
            >
              Acheter
            </button>
          </div>

          <div className="shop-item">
            <h3>{t.goldenClick} (1000 {t.points})</h3>
            <button 
              onClick={activateGoldenClick}
              disabled={upgrades.goldenClick.active || clicks < 1000}
              className="golden-button"
            >
              {upgrades.goldenClick.active ? 'Actif!' : 'Activer'}
            </button>
            <p className="duration">{upgrades.goldenClick.duration}s {t.duration}</p>
          </div>
        </div>

        {/* Prestige */}
        <div className="prestige-section">
          <h2>{t.prestigeTitle}</h2>
          <p>{t.prestigeDesc}</p>
          <p>Niveau: {prestigeLevel} | Points: {prestigePoints}</p>
          
          <button 
            onClick={performPrestige}
            className="prestige-button"
            disabled={clicks < 1_000_000}
          >
            {t.rebirth} (1M {t.points})
          </button>

          <div className="prestige-upgrades">
            <h3>Améliorations de Prestige</h3>
            
            <div className="upgrade-item">
              <span>+2% Force de clic (Niv. {upgrades.prestige.clickPower.level})</span>
              <button 
                onClick={() => buyPrestigeUpgrade('clickPower')} 
                disabled={prestigePoints < upgrades.prestige.clickPower.cost}
                className="shop-button"
              >
                {formatNumber(upgrades.prestige.clickPower.cost)} pts
              </button>
            </div>

            <div className="upgrade-item">
              <span>+1 Auto-clic/sec (Niv. {upgrades.prestige.autoClicker.level})</span>
              <button 
                onClick={() => buyPrestigeUpgrade('autoClicker')} 
                disabled={prestigePoints < upgrades.prestige.autoClicker.cost}
                className="shop-button"
              >
                {formatNumber(upgrades.prestige.autoClicker.cost)} pts
              </button>
            </div>

            <div className="upgrade-item">
              <span>+5s Golden (Niv. {upgrades.prestige.goldenTime.level})</span>
              <button 
                onClick={() => buyPrestigeUpgrade('goldenTime')} 
                disabled={prestigePoints < upgrades.prestige.goldenTime.cost}
                className="shop-button"
              >
                {formatNumber(upgrades.prestige.goldenTime.cost)} pts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
}