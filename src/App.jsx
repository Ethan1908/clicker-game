import Sidebar from './components/Sidebar';
import ShopSection from './components/ShopSection';
import PrestigeSection from './components/PrestigeSection';
import SettingsSection from './components/SettingsSection';
import useClickerGame from './hooks/useClickerGame';
import './App.css';

export default function ClickerGame() {
  const {
    t,
    state,
    actions,
    formatNumber,
    saveFlash,
    lastSaveTime,
    activeTab,
    setActiveTab
  } = useClickerGame();

  return (
    <div className={`game-container ${state.darkMode ? 'dark' : 'light'} ${saveFlash ? 'save-flash' : ''}`}>
      <Sidebar
        t={t}
        clicks={state.clicks}
        upgrades={state.upgrades}
        temporaryBoost={state.temporaryBoost}
        handleClick={actions.handleClick}
        formatNumber={formatNumber}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div className="main-content">
        {activeTab === 'shop' && (
          <ShopSection
            state={state}
            actions={actions}
            t={t}
            formatNumber={formatNumber}
          />
        )}
        {activeTab === 'prestige' && (
          <PrestigeSection
            state={state}
            actions={actions}
            t={t}
            formatNumber={formatNumber}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsSection
            state={state}
            actions={actions}
            t={t}
            lastSaveTime={lastSaveTime}
          />
        )}
      </div>
    </div>
  );
}