import React from "react";
import "./League.css";

export function League({
  poziomy,
  liga,
  kasa,
  podatek,
  onLigaChange,
}) {
  return (
    <div className="form-section league-section">
      <h3 className="section-title">Finanse</h3>
      <div className="form-grid form-grid-3">
        <div className="form-group">
          <label className="form-label">Liga</label>
          <select 
            value={liga} 
            onChange={onLigaChange} 
            className="form-select"
            required
          >
            <option value="">Wybierz ligę</option>
            {poziomy.map((p) => (
              <option key={p.id} value={p.nazwa}>
                {p.nazwa}
              </option>
            ))}
          </select>
          <div className="select-underline"></div>
        </div>

        <div className="form-group">
          <label className="form-label">Kasa</label>
          <input 
            type="text" 
            value={kasa} 
            className="form-input"
            
          />
        </div>

        <div className="form-group">
          <label className="form-label">Podatek</label>
          <input 
            type="text" 
            value={podatek} 
            className="form-input"
            
          />
        </div>
      </div>
    </div>
  );
}
