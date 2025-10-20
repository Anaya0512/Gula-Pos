import React, { useState, useEffect } from "react";
import ModalEditarNegocio from "./ModalEditarNegocio";
import "../../styles/InformacionNegocio.css";

import { supabase } from "../../lib/supabaseClient";

const camposIniciales = {
  id: "",
  nombre: "",
  nit: "",
  telefono: "",
  direccion: "",
  logo_url: "",
  logo_file: null,
  contacto: "",
  email: "",
  pais: "Colombia",
  departamento: "",
  ciudad: "",
  paginaweb: ""
};

export default function InformacionNegocio() {
  const [form, setForm] = useState(camposIniciales);
  const [logoPreview, setLogoPreview] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Cargar datos del negocio al montar
  useEffect(() => {
    async function fetchNegocio() {
      const { data } = await supabase.from("negocio").select("*").limit(1).single();
      if (data) {
        setForm({ ...form, ...data, logo_file: null });
        setLogoPreview("");
      }
    }
    fetchNegocio();
    // eslint-disable-next-line
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Manejar cambio de archivo de logo
  const handleLogoChange = e => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, logo_file: file });
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");
    let logoUrl = form.logo_url;
    // Si hay archivo nuevo, subirlo a Supabase Storage
    if (form.logo_file) {
      const fileExt = form.logo_file.name.split('.').pop();
      const fileName = `logo_negocio_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('imagenes').upload(fileName, form.logo_file, { upsert: true });
      if (!uploadError) {
        const { data: publicUrl } = supabase.storage.from('imagenes').getPublicUrl(fileName);
        logoUrl = publicUrl.publicUrl;
      } else {
        setMensaje("❌ Error al subir logo: " + uploadError.message);
        setLoading(false);
        return;
      }
    }
    // Guardar en Supabase (actualizar por id)
    const { error } = await supabase.from("negocio").upsert({
      id: form.id,
      nombre: form.nombre,
      nit: form.nit,
      telefono: form.telefono,
      direccion: form.direccion,
      logo_url: logoUrl,
      contacto: form.contacto,
      email: form.email,
      pais: form.pais,
      departamento: form.departamento,
      ciudad: form.ciudad,
      paginaweb: form.paginaweb
    });
    setLoading(false);
    if (error) {
      setMensaje("❌ Error al guardar: " + error.message);
    } else {
      setMensaje("✅ Información guardada correctamente");
      setForm({ ...form, logo_url: logoUrl, logo_file: null });
      setLogoPreview("");
    }
  };

  return (
    <main className="info-negocio-main info-negocio-main-solo">
      <button className="btn-editar-negocio btn-editar-negocio-solo" onClick={() => setShowModal(true)}>
        Editar
      </button>
      <div className="logo-nombre-negocio logo-nombre-negocio-solo">
        <h2 className="nombre-negocio nombre-negocio-centrado">{form.nombre || 'Nombre del Negocio'}</h2>
        <div className="logo-preview logo-preview-grande logo-preview-max">
          {(logoPreview || form.logo_url) ? (
            <img src={logoPreview || form.logo_url} alt="Logo negocio" className="logo-img logo-img-max" />
          ) : (
            <div className="logo-placeholder logo-placeholder-max">Logo</div>
          )}
        </div>
      </div>
      {showModal && (
        <ModalEditarNegocio
          form={form}
          setForm={setForm}
          logoPreview={logoPreview}
          setLogoPreview={setLogoPreview}
          handleLogoChange={handleLogoChange}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          loading={loading}
          mensaje={mensaje}
          onClose={() => setShowModal(false)}
        />
      )}
    </main>
  );
}
