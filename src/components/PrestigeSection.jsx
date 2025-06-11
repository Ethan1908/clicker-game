export default function PrestigeSection({ state, actions, t, formatNumber }) {
  const { clicks, prestigeLevel, prestigePoints, upgrades } = state;
  const { performPrestige, buyPrestigeUpgrade } = actions;

  return (
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
        {/* Click Power */}
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
        {/* Auto Clicker */}
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
        {/* Golden Click */}
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
  );
}