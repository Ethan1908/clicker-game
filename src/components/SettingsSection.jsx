export default function SettingsSection({ state, actions, t, lastSaveTime }) {
  const { darkMode } = state;
  const { setDarkMode, changeLanguage, exportSave, importSave } = actions;

  return (
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
  );
}