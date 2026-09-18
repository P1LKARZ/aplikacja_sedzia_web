import React from "react";
import "./Team.css"

export function Team({
  druzyny,
  gospodarz,
  gosc,
  onGospodarzChange,
  onGoscChange,
}) {
  return (
    <div className="form-section team-section">
      <h3 className="section-title">Drużyny</h3>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Gospodarz</label>
          <select 
            value={gospodarz} 
            onChange={onGospodarzChange} 
            className="form-select"
            required
          >
            <option value="">Wybierz drużynę</option>
            {druzyny.map((d) => (
              <option key={d.id} value={d.nazwa}>
                {d.nazwa}
              </option>
            ))}
          </select>
          <div className="select-underline"></div>
        </div>

        <div className="form-group">
          <label className="form-label">Gość</label>
          <select 
            value={gosc} 
            onChange={(e) => onGoscChange(e.target.value)} 
            className="form-select"
            required
          >
            <option value="">Wybierz drużynę</option>
            {druzyny.map((d) => (
              <option key={d.id} value={d.nazwa}>
                {d.nazwa}
              </option>
            ))}
          </select>
          <div className="select-underline"></div>
        </div>
      </div>
    </div>
  );
}
