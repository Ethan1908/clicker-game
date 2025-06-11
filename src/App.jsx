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
  const [activeTab, setActiveTab] = useState('shop');
  const [temporaryBoost, setTemporaryBoost] = useState(false);

  // Prestige
  const [prestigeLevel, setPrestigeLevel] = useState(0);
  const [prestigePoints, setPrestigePoints] = useState(0);

  // Améliorations
  const [upgrades, setUpgrades] = useState({
    multiplicateur: { level: 1, cost: 50 },
    goldenClick: { active: false, duration: 10 },
    globalMultiplier: { level: 0, cost: 5000, multiplier: 1.0 },
    prestige: {
      clickPower: { level: 0, cost: 100 },
      autoClicker: { level: 0, cost: 200 },
      goldenTime: { level: 0, cost: 300 }
    }
  });

  // Investissements
  const [investments, setInvestments] = useState({
    bank: { level: 0, cost: 10000, income: 100 },
    realEstate: { level: 0, cost: 25000, income: 250 }
  });

  // Compétences
  const [skills, setSkills] = useState({
    megaClick: { level: 0, cost: 5000, power: 100, ready: true, cooldown: 30 }
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
    let power = clickPower * upgrades.globalMultiplier.multiplier;
    if (upgrades.goldenClick.active) power *= 5;
    if (temporaryBoost) power *= 2;
    setClicks(prev => prev + power);
  }, [clickPower, upgrades, temporaryBoost]);

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
      if (type === 'globalMultiplier') {
        setUpgrades(prev => ({
          ...prev,
          globalMultiplier: {
            ...prev.globalMultiplier,
            multiplier: prev.globalMultiplier.multiplier + 0.1
          }
        }));
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

  const buyGlobalMultiplier = useCallback(() => {
    buyUpgrade('globalMultiplier');
  }, [buyUpgrade]);

  const activateTemporaryBoost = useCallback(() => {
    if (clicks >= 5000 && !temporaryBoost) {
      setClicks(prev => prev - 5000);
      setTemporaryBoost(true);
      setTimeout(() => setTemporaryBoost(false), 30000);
    }
  }, [clicks, temporaryBoost]);

  const buyInvestment = useCallback((type) => {
    if (clicks >= investments[type].cost) {
      setClicks(prev => prev - investments[type].cost);
      setInvestments(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          level: prev[type].level + 1,
          income: Math.floor(prev[type].income * 1.5),
          cost: Math.floor(prev[type].cost * 2.5)
        }
      }));
    }
  }, [clicks, investments]);

  const upgradeSkill = useCallback((type) => {
    if (clicks >= skills[type].cost) {
      setClicks(prev => prev - skills[type].cost);
      setSkills(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          level: prev[type].level + 1,
          power: prev[type].power * 2,
          cost: Math.floor(prev[type].cost * 2.5)
        }
      }));
    }
  }, [clicks, skills]);

  const useSkill = useCallback((type) => {
    if (skills[type].ready && skills[type].level > 0) {
      setClicks(prev => prev + skills[type].power);
      setSkills(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          ready: false
        }
      }));
      
      setTimeout(() => {
        setSkills(prev => ({
          ...prev,
          [type]: {
            ...prev[type],
            ready: true
          }
        }));
      }, skills[type].cooldown * 1000);
    }
  }, [skills]);

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
        globalMultiplier: { level: 0, cost: 5000, multiplier: 1.0 },
        prestige: upgrades.prestige
      });
      setInvestments({
        bank: { level: 0, cost: 10000, income: 100 },
        realEstate: { level: 0, cost: 25000, income: 250 }
      });
      setSkills({
        megaClick: { level: 0, cost: 5000, power: 100, ready: true, cooldown: 30 }
      });
      setTemporaryBoost(false);
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

  // Effets pour les auto-clics et revenus passifs
  useEffect(() => {
    const autoClickInterval = setInterval(() => {
      if (autoClickers > 0) {
        let power = 1 + upgrades.prestige.autoClicker.level;
        power *= upgrades.globalMultiplier.multiplier;
        if (upgrades.goldenClick.active) power *= 5;
        if (temporaryBoost) power *= 2;
        setClicks(prev => prev + autoClickers * power);
      }
    }, 1000);

    const incomeInterval = setInterval(() => {
      let income = 0;
      if (investments.bank.level > 0) {
        income += investments.bank.income;
      }
      if (investments.realEstate.level > 0) {
        income += investments.realEstate.income;
      }
      if (income > 0) {
        setClicks(prev => prev + income);
      }
    }, 60000);

    return () => {
      clearInterval(autoClickInterval);
      clearInterval(incomeInterval);
    };
  }, [autoClickers, upgrades, temporaryBoost, investments]);

  // Système de sauvegarde
  const SAVE_KEY = 'clickerSave_v3';

  const compressData = (data) => {
    return Object.entries(data)
      .map(([key, val]) => `${key}=${val}`)
      .join(';');
  };

  const saveGame = useCallback(() => {
    const saveData = {
      v: 3,
      c: clicks,
      cp: clickPower,
      ac: autoClickers,
      pl: prestigeLevel,
      pp: prestigePoints,
      l: language,
      dm: darkMode ? 1 : 0,
      ml: upgrades.multiplicateur.level,
      mc: upgrades.multiplicateur.cost,
      gc: upgrades.goldenClick.active ? 1 : 0,
      gd: upgrades.goldenClick.duration,
      gm: upgrades.globalMultiplier.level,
      gmc: upgrades.globalMultiplier.cost,
      tb: temporaryBoost ? 1 : 0,
      bk: investments.bank.level,
      re: investments.realEstate.level,
      sk: skills.megaClick.level,
      pcp: upgrades.prestige.clickPower.level,
      pac: upgrades.prestige.autoClicker.level,
      pgt: upgrades.prestige.goldenTime.level,
      ts: Date.now()
    };

    localStorage.setItem(SAVE_KEY, compressData(saveData));
    setLastSaveTime(new Date().toLocaleTimeString());
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 1000);
  }, [clicks, clickPower, autoClickers, prestigeLevel, prestigePoints, language, darkMode, upgrades, temporaryBoost, investments, skills]);

  const loadGame = useCallback(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return false;

    try {
      const saveData = Object.fromEntries(
        saved.split(';').map(item => {
          const [key, val] = item.split('=');
          return [key, isNaN(val) ? val : Number(val)];
        })
      );
      
      if (saveData.v !== 3) {
        if (!confirm(t.oldSaveWarning || "Version incompatible. Charger quand même ?")) {
          return false;
        }
      }

      const shouldLoadLanguage = !language;
      
      setClicks(saveData.c || 0);
      setClickPower(saveData.cp || 1);
      setAutoClickers(saveData.ac || 0);
      setPrestigeLevel(saveData.pl || 0);
      setPrestigePoints(saveData.pp || 0);
      setTemporaryBoost(saveData.tb === 1);
      
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
        globalMultiplier: {
          level: saveData.gm || 0,
          cost: saveData.gmc || 5000,
          multiplier: 1.0 + (saveData.gm || 0) * 0.1
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

      setInvestments({
        bank: {
          level: saveData.bk || 0,
          cost: 10000 * Math.pow(2.5, saveData.bk || 0),
          income: 100 * Math.pow(1.5, saveData.bk || 0)
        },
        realEstate: {
          level: saveData.re || 0,
          cost: 25000 * Math.pow(2.5, saveData.re || 0),
          income: 250 * Math.pow(1.5, saveData.re || 0)
        }
      });

      setSkills({
        megaClick: {
          level: saveData.sk || 0,
          cost: 5000 * Math.pow(2.5, saveData.sk || 0),
          power: 100 * Math.pow(2, saveData.sk || 0),
          ready: true,
          cooldown: 30
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

  const changeLanguage = useCallback(() => {
    const newLang = language === 'fr' ? 'es' : 'fr';
    setLanguage(newLang);
    setTimeout(saveGame, 0);
  }, [language, saveGame]);

  // Sauvegarde automatique
  useEffect(() => {
    const timer = setTimeout(saveGame, 600);
    return () => clearTimeout(timer);
  }, [clicks, autoClickers, prestigeLevel, saveGame]);

  // Chargement initial
  useEffect(() => {
    loadGame();
  }, [loadGame]);

  return (
    <div className={`game-container ${darkMode ? 'dark' : 'light'} ${saveFlash ? 'save-flash' : ''}`}>
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>{t.gameTitle}</h2>
        </div>
        <nav className="sidebar-nav">
          <button 
            onClick={() => setActiveTab('shop')} 
            className={activeTab === 'shop' ? 'active' : ''}
          >
            {t.shopTitle}
          </button>
          <button 
            onClick={() => setActiveTab('prestige')} 
            className={activeTab === 'prestige' ? 'active' : ''}
          >
            {t.prestigeTitle}
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={activeTab === 'settings' ? 'active' : ''}
          >
            {t.settings}
          </button>
        </nav>
        <div className="click-display">
          <span className="points-display">
            {formatNumber(clicks)} {t.points}
            {upgrades.goldenClick.active && <span className="golden-effect">{t.goldenEffect}</span>}
          </span>
          <motion.button
            onClick={handleClick}
            className={`click-button ${temporaryBoost ? 'temporary-boost' : ''}`}
            whileTap={{ scale: 0.95 }}
          >
            {t.clickMe}
          </motion.button>
        </div>
      </div>

      <div className="main-content">
        {activeTab === 'shop' && (
          <div className="shop-section">
            <div className="shop-item">
              <h3>{t.autoClicker}</h3>
              <p>{t.quantity}: {autoClickers}</p>
              <p>{t.clickPower}: {1 + upgrades.prestige.autoClicker.level}</p>
              <button 
                onClick={buyAutoClicker} 
                disabled={clicks < autoClickerCost}
                className="shop-button"
              >
                {t.buy} ({formatNumber(autoClickerCost)})
              </button>
            </div>

            <div className="shop-item">
              <h3>{t.multiplier}</h3>
              <p>{t.level}: {upgrades.multiplicateur.level}</p>
              <button 
                onClick={() => buyUpgrade('multiplicateur')} 
                disabled={clicks < upgrades.multiplicateur.cost}
                className="shop-button"
              >
                {t.buy} ({formatNumber(upgrades.multiplicateur.cost)})
              </button>
            </div>

            <div className="shop-item">
              <h3>{t.goldenClick}</h3>
              <p>{t.duration}: {upgrades.goldenClick.duration}s</p>
              <button 
                onClick={activateGoldenClick} 
                disabled={clicks < 1000 || upgrades.goldenClick.active}
                className="golden-button"
              >
                {upgrades.goldenClick.active ? t.active : t.activate} (1K)
              </button>
            </div>

            <div className="shop-item">
              <h3>{t.globalMultiplier}</h3>
              <p>{t.level}: {upgrades.globalMultiplier.level}</p>
              <p>Bonus: x{upgrades.globalMultiplier.multiplier.toFixed(1)}</p>
              <button 
                onClick={buyGlobalMultiplier}
                disabled={clicks < upgrades.globalMultiplier.cost}
                className="shop-button"
              >
                {t.buy} ({formatNumber(upgrades.globalMultiplier.cost)})
              </button>
            </div>

            <div className="shop-item">
              <h3>{t.temporaryBoost}</h3>
              <p>Status: {temporaryBoost ? t.active : t.ready}</p>
              <button 
                onClick={activateTemporaryBoost}
                disabled={clicks < 5000 || temporaryBoost}
                className="golden-button"
              >
                {temporaryBoost ? t.active : `${t.activate} (5K)`}
              </button>
            </div>

            <div className="shop-item">
              <h3>{t.investments}</h3>
              <div className="investment-options">
                <div>
                  <h4>{t.bank}</h4>
                  <p>{t.level}: {investments.bank.level}</p>
                  <p>{t.incomePerMin}: {formatNumber(investments.bank.income)}</p>
                  <button 
                    onClick={() => buyInvestment('bank')}
                    disabled={clicks < investments.bank.cost}
                    className="shop-button"
                  >
                    {t.buy} ({formatNumber(investments.bank.cost)})
                  </button>
                </div>
                <div>
                  <h4>{t.realEstate}</h4>
                  <p>{t.level}: {investments.realEstate.level}</p>
                  <p>{t.incomePerMin}: {formatNumber(investments.realEstate.income)}</p>
                  <button 
                    onClick={() => buyInvestment('realEstate')}
                    disabled={clicks < investments.realEstate.cost}
                    className="shop-button"
                  >
                    {t.buy} ({formatNumber(investments.realEstate.cost)})
                  </button>
                </div>
              </div>
            </div>

            <div className="shop-item">
              <h3>{t.skills}</h3>
              <div className="skill-options">
                <div>
                  <h4>{t.megaClick}</h4>
                  <p>{t.level}: {skills.megaClick.level}</p>
                  <p>Puissance: {formatNumber(skills.megaClick.power)}</p>
                  <button 
                    onClick={() => upgradeSkill('megaClick')}
                    disabled={clicks < skills.megaClick.cost}
                    className="shop-button"
                  >
                    {t.buy} ({formatNumber(skills.megaClick.cost)})
                  </button>
                  <button 
                    onClick={() => useSkill('megaClick')}
                    disabled={!skills.megaClick.ready || skills.megaClick.level === 0}
                    className="golden-button"
                  >
                    {skills.megaClick.ready ? t.use : `${t.cooldown}...`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prestige' && (
          <div className="prestige-section">
            <h2>{t.prestigeTitle}</h2>
            <p>{t.prestigeDesc}</p>
            <p>{t.level}: {prestigeLevel}</p>
            <p>{t.points}: {prestigePoints}</p>
            
            <button 
              onClick={performPrestige} 
              disabled={clicks < 1_000_000}
              className="prestige-button"
            >
              {t.rebirth} (1M)
            </button>

            <div className="prestige-upgrades">
              <h3>{t.prestigeUpgrades}</h3>
              <div className="upgrade-item">
                <div>
                  <h4>{t.clickPower}</h4>
                  <p>{t.level}: {upgrades.prestige.clickPower.level}</p>
                </div>
                <button 
                  onClick={() => buyPrestigeUpgrade('clickPower')}
                  disabled={prestigePoints < upgrades.prestige.clickPower.cost}
                  className="shop-button"
                >
                  {t.buy} ({formatNumber(upgrades.prestige.clickPower.cost)})
                </button>
              </div>
              
              <div className="upgrade-item">
                <div>
                  <h4>{t.autoClicker}</h4>
                  <p>{t.level}: {upgrades.prestige.autoClicker.level}</p>
                </div>
                <button 
                  onClick={() => buyPrestigeUpgrade('autoClicker')}
                  disabled={prestigePoints < upgrades.prestige.autoClicker.cost}
                  className="shop-button"
                >
                  {t.buy} ({formatNumber(upgrades.prestige.autoClicker.cost)})
                </button>
              </div>
              
              <div className="upgrade-item">
                <div>
                  <h4>{t.goldenClick}</h4>
                  <p>{t.level}: {upgrades.prestige.goldenTime.level}</p>
                </div>
                <button 
                  onClick={() => buyPrestigeUpgrade('goldenTime')}
                  disabled={prestigePoints < upgrades.prestige.goldenTime.cost}
                  className="shop-button"
                >
                  {t.buy} ({formatNumber(upgrades.prestige.goldenTime.cost)})
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-section">
            <h2>{t.settings}</h2>
            <div className="settings-options">
              <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle">
                {darkMode ? '☀️ Mode clair' : '🌙 Mode sombre'}
              </button>
              <button onClick={changeLanguage} className="language-button">
                {t.languageToggle}
              </button>
              <button onClick={exportSave} className="export-button">
                {t.exportSave}
              </button>
              <label className="import-button">
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
          </div>
        )}
      </div>
    </div>
  );
}