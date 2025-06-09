import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { translations } from './translations';
import './App.css';

export default function ClickerGame() {
  // États du jeu
  const [clicks, setClicks] = useState(0);
  const [clickPower, setClickPower] = useState(1);
  const [autoClickers, setAutoClickers] = useState(0);
  const [language, setLanguage] = useState(() => {
    // Charger la langue depuis le localStorage si elle existe
    const saved = localStorage.getItem('clickerSave_v3');
    if (saved) {
      try {
        const saveData = Object.fromEntries(
          saved.split(';').map(item => {
            const [key, val] = item.split('=');
            return [key, isNaN(val) ? val : Number(val)];
          })
        );
        return saveData.l || 'fr';
      } catch {
        return 'fr';
      }
    }
    return 'fr';
  });
  const [darkMode, setDarkMode] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [saveFlash, setSaveFlash] = useState(false);

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
    if (num >= 1_000_000_000_000) return (num / 1_000_000_000_000).toFixed(4) + 'T';
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(3) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toString();
  }, []);

  // Logique de jeu
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
          cost: Math.floor(prev[type].cost * 2.5)
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
      setClickPower(1);
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

  // Système de sauvegarde
  const SAVE_KEY = 'clickerSave_v3';

  const compressData = (data) => {
    return Object.entries(data)
      .map(([key, val]) => `${key}=${val}`)
      .join(';');
  };

  const decompressData = (str) => {
    return Object.fromEntries(
      str.split(';').map(item => {
        const [key, val] = item.split('=');
        return [key, isNaN(val) ? val : Number(val)];
      })
    );
  };

  const saveGame = useCallback(() => {
    const saveData = {
      v: 2, // version
      c: clicks,
      cp: clickPower,
      ac: autoClickers,
      pl: prestigeLevel,
      pp: prestigePoints,
      l: language, // Inclure la langue actuelle
      dm: darkMode ? 1 : 0,
      ml: upgrades.multiplicateur.level,
      mc: upgrades.multiplicateur.cost,
      gc: upgrades.goldenClick.active ? 1 : 0,
      gd: upgrades.goldenClick.duration,
      pcp: upgrades.prestige.clickPower.level,
      pac: upgrades.prestige.autoClicker.level,
      pgt: upgrades.prestige.goldenTime.level,
      ts: Date.now()
    };

    localStorage.setItem(SAVE_KEY, compressData(saveData));
    setLastSaveTime(new Date().toLocaleTimeString());
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 1000);
  }, [clicks, clickPower, autoClickers, prestigeLevel, prestigePoints, language, darkMode, upgrades]);

  const loadGame = useCallback(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return false;

    try {
      const saveData = decompressData(saved);
      
      if (saveData.v !== 2) {
        console.error("Version incompatible");
        return false;
      }

      if (saveData.ts && Date.now() - saveData.ts > 30 * 24 * 60 * 60 * 1000) {
        if (!confirm(t.oldSaveWarning || "Sauvegarde ancienne. Charger quand même ?")) {
          return false;
        }
      }

      // Ne pas charger la langue depuis la sauvegarde si elle est déjà définie
      const shouldLoadLanguage = !language;
      
      setClicks(saveData.c || 0);
      setClickPower(saveData.cp || 1);
      setAutoClickers(saveData.ac || 0);
      setPrestigeLevel(saveData.pl || 0);
      setPrestigePoints(saveData.pp || 0);
      
      if (shouldLoadLanguage) {
        setLanguage(saveData.l || 'fr');
      }
      
      setDarkMode(saveData.dm === 1);

      setUpgrades({
        multiplicateur: {
          level: saveData.ml || 1,
          cost: saveData.mc || 50
        },
        goldenClick: {
          active: saveData.gc === 1,
          duration: saveData.gd || 10
        },
        prestige: {
          clickPower: { 
            level: saveData.pcp || 0, 
            cost: 100 * Math.pow(1.5, saveData.pcp || 0) 
          },
          autoClicker: { 
            level: saveData.pac || 0, 
            cost: 200 * Math.pow(1.5, saveData.pac || 0) 
          },
          goldenTime: { 
            level: saveData.pgt || 0, 
            cost: 300 * Math.pow(1.5, saveData.pgt || 0) 
          }
        }
      });

      return true;
    } catch (error) {
      console.error("Erreur de chargement:", error);
      return false;
    }
  }, [t.oldSaveWarning, language]);

  const exportSave = () => {
    saveGame();
    const saved = localStorage.getItem(SAVE_KEY);
    const blob = new Blob([saved], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clicker_save_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSave = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        if (window.confirm(t.importConfirm)) {
          localStorage.setItem(SAVE_KEY, data);
          window.location.reload();
        }
      } catch {
        alert(t.importError);
      }
    };
    reader.readAsText(file);
  };

  // Fonction de changement de langue
  const changeLanguage = useCallback(() => {
    const newLang = language === 'fr' ? 'es' : 'fr';
    setLanguage(newLang);
    // Sauvegarder immédiatement après le changement
    setTimeout(saveGame, 0);
  }, [language, saveGame]);

  // Sauvegarde automatique
  useEffect(() => {
    const timer = setTimeout(saveGame, 3000);
    return () => clearTimeout(timer);
  }, [clicks, autoClickers, prestigeLevel, saveGame]);

  // Chargement initial
  useEffect(() => {
    loadGame();
  }, []); // Chargement unique au montage

  return (
    <div className={`game-container ${darkMode ? 'dark' : 'light'} ${saveFlash ? 'save-flash' : ''}`}>
      <div className="settings-buttons">
        <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle">
          {darkMode ? '☀️' : '🌙'}
        </button>
        <button onClick={changeLanguage} className="language-button">
          {t.languageToggle}
        </button>
        <button onClick={exportSave} className="language-button">
          {t.exportSave}
        </button>
        <label className="language-button" style={{ cursor: 'pointer' }}>
          {t.importSave}
          <input 
            type="file" 
            accept=".txt,.text" 
            onChange={importSave} 
            style={{ display: 'none' }} 
          />
        </label>
        {lastSaveTime && <div className="save-status">{t.lastSave}: {lastSaveTime}</div>}
      </div>

      <div className="main-content">
        <h1>{t.gameTitle}</h1>

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