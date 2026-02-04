import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast'; // Asumiendo que usas react-hot-toast

export default function Register() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',         // Breve descripción
    location: ''     // Ciudad/País
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Únete a IWork</h1>
          <p className="text-gray-500 mt-2">Crea tu perfil profesional en segundos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre completo</label>
            <input
              name="name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
              required
              type="text"
              placeholder="Ej. Rodrigo García"
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                name="email"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none"
                required
                type="email"
                placeholder="tu@email.com"
                onChange={handleChange}
              />
            </div>
            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
              <input
                name="password"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none"
                required
                type="password"
                placeholder="••••••••"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ubicación (Opcional)</label>
            <input
              name="location"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none"
              type="text"
              placeholder="Ej. Buenos Aires, Argentina"
              onChange={handleChange}
            />
          </div>

          {/* Bio / Descripción */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Sobre ti</label>
            <textarea
              name="bio"
              rows="3"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none resize-none"
              placeholder="Cuéntanos brevemente qué haces o qué buscas..."
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3.5 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 ${isSubmitting
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-yellow-400 text-black hover:bg-yellow-300 hover:shadow-yellow-100'
              }`}
          >
            {isSubmitting ? 'Procesando...' : 'Crear mi cuenta'}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-600">
          ¿Ya eres parte? <Link to="/login" className="text-yellow-600 font-bold hover:text-yellow-500 transition-colors">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
}