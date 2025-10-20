import React from "react";
import "../../styles/InformacionNegocio.css";

export default function ModalEditarNegocio({ form, setForm, logoPreview, setLogoPreview, handleLogoChange, handleChange, handleSubmit, loading, mensaje, onClose }) {
  return (
    <div className="modal-editar-negocio-overlay">
      <div className="modal-editar-negocio-panel modal-editar-negocio-panel-scroll">
        <button className="modal-close-btn" onClick={onClose}>✖</button>
        <form className="info-negocio-form info-negocio-form-grid-3col" onSubmit={handleSubmit}>
          {/* Columna 1 */}
          <div className="info-negocio-col">
            <label>Nombre
              <input name="nombre" value={form.nombre} onChange={handleChange} required />
            </label>
            <label>NIT
              <input name="nit" value={form.nit} onChange={handleChange} required />
            </label>
            <label>Teléfono
              <input name="telefono" value={form.telefono} onChange={handleChange} required />
            </label>
            <label>Dirección
              <input name="direccion" value={form.direccion} onChange={handleChange} required />
            </label>
          </div>
          {/* Columna 2 */}
          <div className="info-negocio-col">
            <label>Contacto
              <input name="contacto" value={form.contacto} onChange={handleChange} />
            </label>
            <label>Email
              <input name="email" value={form.email} onChange={handleChange} />
            </label>
            <label>País
              <select name="pais" value={form.pais} onChange={handleChange}>
                <option value="Colombia">Colombia</option>
              </select>
            </label>
            <label>Departamento
              <input name="departamento" value={form.departamento} onChange={handleChange} placeholder="Departamento" />
            </label>
            <label>Ciudad
              <input name="ciudad" value={form.ciudad} onChange={handleChange} placeholder="Ciudad" />
            </label>
          </div>
          {/* Columna 3 */}
          <div className="info-negocio-col">
            <label>Logo
              <input type="file" accept="image/*" onChange={handleLogoChange} />
            </label>
            {logoPreview && (
              <div className="logo-preview logo-preview-modal">
                <img src={logoPreview} alt="Logo preview" />
              </div>
            )}
            <label>Página Web
              <input name="paginaweb" value={form.paginaweb} onChange={handleChange} />
            </label>
          </div>
          <div className="guardar-derecha modal-guardar">
            <button type="submit" className="btn-guardar-negocio" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
          {mensaje && <div className="mensaje-guardar">{mensaje}</div>}
        </form>
      </div>
    </div>
  );
}
