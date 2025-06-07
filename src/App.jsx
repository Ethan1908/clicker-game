import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { translations } from './translations';
import './App.css';

// Fonction de débounce pour optimiser les sauvegardes
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

export default function ClickerGame() {
  // États du jeu
  const [clicks, setClicks] = useState(0);
  const [clickPower, setClickPower] = useState(1);
  const [autoClickers, setAutoClickers] = useState(0);
  const [language, setLanguage] = useState('fr');
  const [darkMode, setDarkMode] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(null);

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

  // Formatage des nombres
  const formatNumber = useCallback((num) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toString();
  }, []);

  // Logique de jeu manquante
  const handleClick = useCallback(() => {
    let power = clickPower;
    if (upgrades.goldenClick.active) power *= 5;
    setClicks(prev => prev + power);
  }, [clickPower, upgrades.goldenClick.active]);

  const buyAutoClicker = useCallback(() => {
    const cost = 10 + autoClickers * 5;
    if (clicks >= cost) {
      setClicks(prev => prev - cost);
      setAutoClickers(prev => prev + 1);
    }
  }, [clicks, autoClickers]);

  const buyUpgrade = useCallback((type) => {
    if (clicks >= upgrades[type].cost) {
      setClicks(prev => prev - upgrades[type].cost);
      setUpgrades(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          level: prev[type].level + 1,
          cost: Math.floor(prev[type].cost * 1.5)
        }
      }));
      if (type === 'multiplicateur') {
        setClickPower(prev => prev * 2);
      }
    }
  }, [clicks, upgrades]);

  const activateGoldenClick = useCallback(() => {
    if (clicks >= 1000 && !upgrades.goldenClick.active) {
      setClicks(prev => prev - 1000);
      setUpgrades(prev => ({
        ...prev,
        goldenClick: { ...prev.goldenClick, active: true }
      }));
      setTimeout(() => {
        setUpgrades(prev => ({
          ...prev,
          goldenClick: { ...prev.goldenClick, active: false }
        }));
      }, upgrades.goldenClick.duration * 1000);
    }
  }, [clicks, upgrades.goldenClick.active, upgrades.goldenClick.duration]);

  const performPrestige = useCallback(() => {
    if (clicks >= 1_000_000) {
      const pointsEarned = Math.floor(clicks / 1_000_000);
      setPrestigePoints(prev => prev + pointsEarned);
      setPrestigeLevel(prev => prev + 1);
      setClicks(0);
      setAutoClickers(0);
      setUpgrades({
        multiplicateur: { level: 1, cost: 50 },
        goldenClick: { active: false, duration: 10 + upgrades.prestige.goldenTime.level * 5 },
        prestige: upgrades.prestige
      });
    }
  }, [clicks, upgrades.prestige]);

  const buyPrestigeUpgrade = useCallback((type) => {
    if (prestigePoints >= upgrades.prestige[type].cost) {
      setPrestigePoints(prev => prev - upgrades.prestige[type].cost);
      setUpgrades(prev => ({
        ...prev,
        prestige: {
          ...prev.prestige,
          [type]: {
            ...prev.prestige[type],
            level: prev.prestige[type].level + 1,
            cost: Math.floor(prev.prestige[type].cost * 1.5)
          }
        }
      }));
    }
  }, [prestigePoints, upgrades.prestige]);

  // Calcul des valeurs dérivées
  const autoClickerCost = useMemo(() => 10 + autoClickers * 5, [autoClickers]);
  const productionPerSecond = useMemo(() => autoClickers * (1 + upgrades.prestige.autoClicker.level), [autoClickers, upgrades.prestige.autoClicker.level]);

  // Effet pour les auto-clics
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoClickers > 0) {
        let power = 1 + upgrades.prestige.autoClicker.level;
        if (upgrades.goldenClick.active) power *= 5;
        setClicks(prev => prev + autoClickers * power);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [autoClickers, upgrades.goldenClick.active, upgrades.prestige.autoClicker.level]);

const exportSave = () => {
  const saveData = {
    version: 1.1,
    clicks,
    clickPower,
    autoClickers,
    upgrades,
    prestigeLevel,
    prestigePoints,
    language,
    darkMode,
    timestamp: Date.now()
  };

  const importSave = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const saveData = JSON.parse(e.target.result);
      
      // Validation basique de la sauvegarde
      if (typeof saveData.clicks !== 'number') {
        alert(t.importError);
        return;
      }

      if (window.confirm(t.importConfirm)) {
        setClicks(saveData.clicks || 0);
        setClickPower(saveData.clickPower || 1);
        setAutoClickers(saveData.autoClickers || 0);
        setUpgrades(saveData.upgrades || {
          multiplicateur: { level: 1, cost: 50 },
          goldenClick: { active: false, duration: 10 },
          prestige: {
            clickPower: { level: 0, cost: 100 },
            autoClicker: { level: 0, cost: 200 },
            goldenTime: { level: 0, cost: 300 }
          }
        });
        setPrestigeLevel(saveData.prestigeLevel || 0);
        setPrestigePoints(saveData.prestigePoints || 0);
        setLanguage(saveData.language || 'fr');
        setDarkMode(saveData.darkMode || false);
        setLastSaveTime(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error("Erreur d'import:", error);
      alert(t.importError);
    }
  };
  reader.readAsText(file);
};

  // Création d'un fichier JSON téléchargeable
  const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `clicker-save-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

  return (
    <div className={`game-container ${darkMode ? 'dark' : 'light'}`}>
      <div className="settings-buttons">
        <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle">
          {darkMode ? '☀️' : '🌙'}
        </button>
        <button onClick={() => setLanguage(lang => lang === 'fr' ? 'es' : 'fr')} className="language-button">
          {t.languageToggle}
        </button>
        <button onClick={exportSave} className="language-button">
          {t.exportSave}
        </button>
        <label className="language-button" style={{ cursor: 'pointer' }}>
          {t.importSave}
          <input 
            type="file" 
            accept=".json" 
            onChange={importSave} 
            style={{ display: 'none' }} 
          />
        </label>
        {lastSaveTime && <div className="save-status">{t.lastSave}: {lastSaveTime}</div>}
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
              {t.buy}
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
              {t.buy}
            </button>
          </div>

          <div className="shop-item">
            <h3>{t.goldenClick} (1000 {t.points})</h3>
            <button 
              onClick={activateGoldenClick}
              disabled={upgrades.goldenClick.active || clicks < 1000}
              className="golden-button"
            >
              {upgrades.goldenClick.active ? t.active : t.activate}
            </button>
            <p className="duration">{upgrades.goldenClick.duration}s {t.duration}</p>
          </div>
        </div>

        {/* Prestige */}
        <div className="prestige-section">
          <h2>{t.prestigeTitle}</h2>
          <p>{t.prestigeDesc}</p>
          <p>{t.level}: {prestigeLevel} | {t.points}: {prestigePoints}</p>
          
          <button 
            onClick={performPrestige}
            className="prestige-button"
            disabled={clicks < 1_000_000}
          >
            {t.rebirth} (1M {t.points})
          </button>

          <div className="prestige-upgrades">
            <h3>{t.prestigeUpgrades}</h3>
            
            <div className="upgrade-item">
              <span>+2% {t.clickPower} (Niv. {upgrades.prestige.clickPower.level})</span>
              <button 
                onClick={() => buyPrestigeUpgrade('clickPower')} 
                disabled={prestigePoints < upgrades.prestige.clickPower.cost}
                className="shop-button"
              >
                {formatNumber(upgrades.prestige.clickPower.cost)} pts
              </button>
            </div>

            <div className="upgrade-item">
              <span>+1 {t.autoClicker}/sec (Niv. {upgrades.prestige.autoClicker.level})</span>
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

