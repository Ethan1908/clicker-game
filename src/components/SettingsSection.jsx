export default function SettingsSection({ state, actions, t, lastSaveTime }) {
  const { darkMode, language } = state;
  const { setDarkMode, changeLanguage, exportSave, importSave } = actions;

  // Nouvelle fonction pour gérer la sélection de langue
  const handleLanguageChange = (e) => {
    actions.changeLanguage(e.target.value);
  };

  return (
    <div className="settings-section">
      <h2>{t.settings}</h2>
      <div className="settings-options">
        <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle">
          {darkMode ? '☀️ Mode clair' : '🌙 Mode sombre'}
        </button>
        <div className="language-select">
          <label htmlFor="language-dropdown">{t.languageToggle}</label>
          <select
            id="language-dropdown"
            value={language}
            onChange={handleLanguageChange}
            className="language-dropdown"
          >
            <option value="fr">🇫🇷 Français</option>
            <option value="es">🇪🇸 Español</option>
            <option value="en">🇬🇧 English</option>
          </select>
        </div>
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