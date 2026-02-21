import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\+\d][\d\s\-\(\)]{6,}$/;
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'\-]{2,}$/;
const PWD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

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
    setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const errors = {};
    if (!NAME_REGEX.test(formData.name))
      errors.name = formData.name.length < 2 ? t('validation.name_short') : t('validation.name_invalid');
    if (!EMAIL_REGEX.test(formData.email))
      errors.email = t('validation.email_invalid');
    if (!PWD_REGEX.test(formData.password))
      errors.password = formData.password.length < 8 ? t('validation.password_short') : t('validation.password_weak');
    if (role === 'worker' && !formData.phone)
      errors.phone = t('validation.field_required');
    else if (role === 'worker' && formData.phone && !PHONE_REGEX.test(formData.phone))
      errors.phone = t('validation.phone_invalid');
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(t('common.success'));
        navigate('/login');
      } else {
        toast.error(data.message || t('common.error'));
      }
    } catch (err) {
      toast.error(t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };


  if (step === 1) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{t('auth.register_title')}</h1>
          <p className="text-xl text-gray-600">{t('auth.register_subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tarjeta Cliente */}
          <div
            onClick={() => handleRoleSelect('client')}
            className="cursor-pointer bg-white rounded-3xl p-8 border-2 border-transparent hover:border-yellow-400 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 text-center"
          >
            <div className="h-20 w-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              🤝
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('home.cta_hire')}</h3>
            <p className="text-gray-500 mb-6">{t('register.client_desc') || 'Quiero contratar profesionales.'}</p>
            <button className="w-full py-3 rounded-xl font-bold bg-gray-50 hover:bg-yellow-400 transition-colors">
              {t('register.continue_client') || 'Continuar como Cliente'}
            </button>
          </div>

          {/* Tarjeta Trabajador */}
          <div
            onClick={() => handleRoleSelect('worker')}
            className="cursor-pointer bg-white rounded-3xl p-8 border-2 border-transparent hover:border-blue-400 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 text-center"
          >
            <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              👷
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('home.cta_find_work')}</h3>
            <p className="text-gray-500 mb-6">{t('register.worker_desc') || 'Ofrezco mis servicios.'}</p>
            <button className="w-full py-3 rounded-xl font-bold bg-gray-50 hover:bg-blue-500 hover:text-white transition-colors">
              {t('register.continue_worker') || 'Continuar como Profesional'}
            </button>
          </div>
        </div>

        <p className="text-center mt-12 text-gray-600">
          {t('auth.have_account')} <Link to="/login" className="text-yellow-600 font-bold hover:underline">{t('auth.login_button')}</Link>
        </p>
      </div>
    );
  }


  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <button onClick={() => setStep(1)} className="mb-6 text-sm text-gray-500 hover:text-black">
        ← {t('common.back')}
      </button>

      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-extrabold text-center mb-8">
          {t('auth.register_button')}
        </h1>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">{t('auth.name')}</label>
            <input name="name" onChange={handleChange} required placeholder="Ej. Juan Pérez"
              className={`w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 transition-colors ${fieldErrors.name ? 'border-red-400 bg-red-50 focus:ring-red-300' : 'border-gray-200 focus:ring-yellow-400'}`} />
            {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">{t('auth.email')}</label>
            <input name="email" type="email" onChange={handleChange} required placeholder="tu@email.com"
              className={`w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 transition-colors ${fieldErrors.email ? 'border-red-400 bg-red-50 focus:ring-red-300' : 'border-gray-200 focus:ring-yellow-400'}`} />
            {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">{t('auth.password')}</label>
            <input name="password" type="password" onChange={handleChange} required placeholder="Mínimo 8 caracteres, letras y números"
              className={`w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 transition-colors ${fieldErrors.password ? 'border-red-400 bg-red-50 focus:ring-red-300' : 'border-gray-200 focus:ring-yellow-400'}`} />
            {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
            {!fieldErrors.password && <p className="text-gray-400 text-[10px] mt-1">Mínimo 8 caracteres, debe incluir letras y números.</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">{t('profile.location')}</label>
            <input name="location" onChange={handleChange} className="w-full px-4 py-2 border rounded-xl" placeholder="Ciudad, País" />
          </div>

          {role === 'worker' && (
            <>
              <div>
                <label className="block text-sm font-bold text-blue-700 mb-1">{t('people.profession')}</label>
                <select
                  name="profession"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">{t('common.select') || "Selecciona..."}</option>
                  {['electrician', 'plumber', 'carpenter', 'gardener', 'mason', 'painter', 'cleaner', 'mover', 'tech', 'other'].map(key => (
                    <option key={key} value={key}>
                      {t(`professions.${key}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-blue-700 mb-1">Teléfono / WhatsApp</label>
                <input name="phone" type="tel" onChange={handleChange} required placeholder="+61 4XX XXX XXX"
                  className={`w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 transition-colors ${fieldErrors.phone ? 'border-red-400 bg-red-50 focus:ring-red-300' : 'border-gray-200 focus:ring-blue-400'}`} />
                {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
                {!fieldErrors.phone && <p className="text-gray-400 text-[10px] mt-1">Incluya el código de país. Ej: +61 412 345 678</p>}
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              {t('profile.about')}
            </label>
            <textarea name="bio" onChange={handleChange} rows="3" className="w-full px-4 py-2 border rounded-xl" placeholder="..." />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-yellow-400 font-bold rounded-xl hover:bg-yellow-300 transition-colors">
            {isSubmitting ? t('common.loading') : t('auth.register_button')}
          </button>
        </form>
      </div>
    </div>
  );
}