import React from "react";
import "./Details.css";
import { getRundaSezon } from "../../../utils/getRundaSezon";

export function Details({
  sedziowie,
  sedzia,
  data,
  numerMeczu,
  delegacja,
  zaplacone,
  onSedziaChange,
  onDataChange,
  onNumerMeczuChange,
}) {
  const { runda, sezon } = getRundaSezon(data);

  return (
    <div className="form-section details-section">
      <h3 className="section-title">Szczegóły Meczu</h3>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Sędzia główny</label>
          <select 
            value={sedzia} 
            onChange={(e) => onSedziaChange(e.target.value)} 
            className="form-select"
            required
          >
            <option value="">Wybierz sędziego</option>
            {sedziowie.map((s) => (
              <option key={s.id} value={s.imie}>
                {s.imie}
              </option>
            ))}
          </select>
          <div className="select-underline"></div>
        </div>

        <div className="form-group">
          <label className="form-label">Data meczu</label>
          <input
            type="date"
            value={data}
            onChange={(e) => onDataChange(e.target.value)}
            className="form-input"
            required
          />
          {runda && sezon && (
            <p className="runda-preview">
              📅 Runda <strong>{runda}</strong> · Sezon <strong>{sezon}</strong>
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Numer meczu</label>
          <input
            type="number"
            value={numerMeczu}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d{0,7}$/.test(value)) {
                onNumerMeczuChange(value ? parseInt(value) : '');
              }
            }}
            className="form-input"
            placeholder="7 cyfr"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Zapłacone</label>
          <input 
            type="text" 
            value={zaplacone} 
            className="form-input"
            disabled 
          />
        </div>
      </div>
    </div>
  );
}
