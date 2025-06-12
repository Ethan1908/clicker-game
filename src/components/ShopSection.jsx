export default function ShopSection({ state, actions, t, formatNumber }) {
  const { clicks, autoClickers, upgrades, temporaryBoost, investments, skills, prestigeLevel } = state;
  const { buyAutoClicker, buyUpgrade, activateGoldenClick, activateDiamondClick, buyGlobalMultiplier, activateTemporaryBoost, buyInvestment, upgradeSkill, useSkill } = actions;
  const autoClickerCost = 10 + autoClickers * 5;
  const diamondCost = 500000000000;

  return (
    <div className="shop-section">
      {/* AutoClicker */}
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
      {/* Multiplier */}
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
      {/* Golden Click */}
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
      {/* Diamond Click */}
      <div className="shop-item">
        <h3>💎 {t.diamondClick}</h3>
        <p>{t.diamondDuration}: {upgrades.diamondClick.duration}s</p>
        <p>{t.diamondEffect}</p>
        <p>{t.diamondRequired}</p>
        <button
          onClick={activateDiamondClick}
          disabled={clicks < diamondCost || upgrades.diamondClick.active || prestigeLevel < 2}
          className="golden-button"
        >
          {upgrades.diamondClick.active ? t.active : `${t.activate} (500B)`}
        </button>
      </div>
      {/* Global Multiplier */}
      <div className="shop-item">
        <h3>{t.globalMultiplier}</h3>
        <p>{t.level}: {upgrades.globalMultiplier.level}</p>
        <p>{t.bonus}: x{upgrades.globalMultiplier.multiplier.toFixed(1)}</p>
        <button 
          onClick={buyGlobalMultiplier}
          disabled={clicks < upgrades.globalMultiplier.cost}
          className="shop-button"
        >
          {t.buy} ({formatNumber(upgrades.globalMultiplier.cost)})
        </button>
      </div>
      {/* Temporary Boost */}
      <div className="shop-item">
        <h3>{t.temporaryBoost}</h3>
         <p>{t.status}: {temporaryBoost ? t.active : t.ready}</p>
        <button 
          onClick={activateTemporaryBoost}
          disabled={clicks < 5000 || temporaryBoost}
          className="golden-button"
        >
          {temporaryBoost ? t.active : `${t.activate} (5K)`}
        </button>
      </div>
      {/* Investments */}
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
      {/* Skills */}
      <div className="shop-item">
        <h3>{t.skills}</h3>
        <div className="skill-options">
          <div>
            <h4>{t.megaClick}</h4>
            <p>{t.level}: {skills.megaClick.level}</p>
            <p>{t.power}: {formatNumber(skills.megaClick.power)}</p>
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
  );
}