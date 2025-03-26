import React from 'react';
import { useLanguage, languages } from '../utils/LanguageContext';
import './LanguageSwitcher.css';

function LanguageSwitcher() {
  const { language, changeLanguage, translations } = useLanguage();
  const { general } = translations;

  return (
    <div className="language-switcher">
      <div className="language-selector">
        <select 
          value={language} 
          onChange={(e) => changeLanguage(e.target.value)}
          aria-label={general.language}
        >
          <option value="no">{general.norwegian}</option>
          <option value="en">{general.english}</option>
        </select>
      </div>
    </div>
  );
}

export default LanguageSwitcher; 