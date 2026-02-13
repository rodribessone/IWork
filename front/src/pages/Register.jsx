import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Selección, 2: Formulario
  const [role, setRole] = useState(null); // 'client' o 'worker'
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
    location: '',
    profession: '',
    phone: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('¡Cuenta creada! Bienvenido a IWork');
        navigate('/login');
      } else {
        toast.error(data.message || 'Error en el registro');
      }
    } catch (err) {
      toast.error('Error de conexión con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };


  if (step === 1) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">¿Qué te trae a IWork?</h1>
          <p className="text-xl text-gray-600">Elige cómo quieres usar la plataforma</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tarjeta Cliente */}
          <div
            onClick={() => handleRoleSelect('client')}
            className="cursor-pointer bg-white rounded-3xl p-8 border-2 border-transparent hover:border-yellow-400 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 text-center"
          >
            <div className="h-20 w-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              🔍
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Busco Talento</h3>
            <p className="text-gray-500 mb-6">Quiero contratar profesionales.</p>
            <button className="w-full py-3 rounded-xl font-bold bg-gray-50 hover:bg-yellow-400 transition-colors">
              Continuar como Cliente
            </button>
          </div>

          {/* Tarjeta Trabajador */}
          <div
            onClick={() => handleRoleSelect('worker')}
            className="cursor-pointer bg-white rounded-3xl p-8 border-2 border-transparent hover:border-blue-400 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 text-center"
          >
            <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              🛠️
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Quiero Trabajar</h3>
            <p className="text-gray-500 mb-6">Ofrezco mis servicios.</p>
            <button className="w-full py-3 rounded-xl font-bold bg-gray-50 hover:bg-blue-500 hover:text-white transition-colors">
              Continuar como Profesional
            </button>
          </div>
        </div>

        <p className="text-center mt-12 text-gray-600">
          ¿Ya tienes cuenta? <Link to="/login" className="text-yellow-600 font-bold hover:underline">Inicia sesión</Link>
        </p>
      </div>
    );
  }


  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <button onClick={() => setStep(1)} className="mb-6 text-sm text-gray-500 hover:text-black">
        ← Volver a elegir
      </button>

      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-extrabold text-center mb-8">
          Registro de {role === 'client' ? 'Cliente' : 'Profesional'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo</label>
            <input name="name" onChange={handleChange} required className="w-full px-4 py-2 border rounded-xl" placeholder="Ej. Juan Pérez" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input name="email" type="email" onChange={handleChange} required className="w-full px-4 py-2 border rounded-xl" placeholder="tu@email.com" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña</label>
            <input name="password" type="password" onChange={handleChange} required className="w-full px-4 py-2 border rounded-xl" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Ubicación</label>
            <input name="location" onChange={handleChange} className="w-full px-4 py-2 border rounded-xl" placeholder="Ciudad, País" />
          </div>
          {/* 🚨 BLOQUE NUEVO: Solo se muestra si es worker */}
          {role === 'worker' && (
            <>
              <div>
                <label className="block text-sm font-bold text-blue-700 mb-1">Tu Profesión / Oficio</label>
                <select
                  name="profession"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Selecciona una opción...</option>
                  <option value="Electricista">Electricista</option>
                  <option value="Plomero">Plomero / Gasista</option>
                  <option value="Carpintero">Carpintero</option>
                  <option value="Jardinero">Jardinero</option>
                  <option value="Albañil">Albañil</option>
                  <option value="Pintor">Pintor</option>
                  <option value="Limpieza">Limpieza</option>
                  <option value="Mudanzas">Mudanzas</option>
                  <option value="Técnico PC">Técnico PC</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-blue-700 mb-1">Teléfono / WhatsApp</label>
                <input
                  name="phone"
                  type="tel"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Ej. 11 1234 5678"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              {role === 'client' ? 'Sobre ti (Opcional)' : 'Tu Presentación Profesional'}
            </label>
            <textarea name="bio" onChange={handleChange} rows="3" className="w-full px-4 py-2 border rounded-xl" placeholder="Cuéntanos un poco..." />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-yellow-400 font-bold rounded-xl hover:bg-yellow-300 transition-colors">
            {isSubmitting ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}