import { motion } from 'framer-motion';

export default function Sidebar({
  t, clicks, upgrades, temporaryBoost, handleClick, formatNumber, activeTab, setActiveTab
}) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>{t.gameTitle}</h2>
      </div>
      <nav className="sidebar-nav">
        <button onClick={() => setActiveTab('shop')} className={activeTab === 'shop' ? 'active' : ''}>
          {t.shopTitle}
        </button>
        <button onClick={() => setActiveTab('prestige')} className={activeTab === 'prestige' ? 'active' : ''}>
          {t.prestigeTitle}
        </button>
        <button onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'active' : ''}>
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
  );
}