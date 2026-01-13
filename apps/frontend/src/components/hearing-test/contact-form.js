"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ContactForm;
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
function ContactForm({ locale, onSubmit, onBack, isSubmitting }) {
    const isRu = locale === 'ru';
    const [name, setName] = (0, react_1.useState)('');
    const [phone, setPhone] = (0, react_1.useState)('');
    const [email, setEmail] = (0, react_1.useState)('');
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            name: name.trim() || undefined,
            phone: phone.trim() || undefined,
            email: email.trim() || undefined,
        });
    };
    return (<div className="space-y-6 max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {isRu ? 'Связаться с нами' : 'Biz bilan bog\'lanish'}
        </h2>
        <p className="text-gray-600">
          {isRu
            ? 'Оставьте свои контактные данные, и мы свяжемся с вами'
            : 'Kontakt ma\'lumotlaringizni qoldiring, biz siz bilan bog\'lanamiz'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isRu ? 'Имя' : 'Ism'} <span className="text-gray-400">({isRu ? 'необязательно' : 'ixtiyoriy'})</span>
          </label>
          <div className="relative">
            <lucide_react_1.User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary" placeholder={isRu ? 'Ваше имя' : 'Ismingiz'}/>
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isRu ? 'Телефон' : 'Telefon'} <span className="text-gray-400">({isRu ? 'необязательно' : 'ixtiyoriy'})</span>
          </label>
          <div className="relative">
            <lucide_react_1.Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary" placeholder={isRu ? '+998 90 123 45 67' : '+998 90 123 45 67'}/>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isRu ? 'Email' : 'Email'} <span className="text-gray-400">({isRu ? 'необязательно' : 'ixtiyoriy'})</span>
          </label>
          <div className="relative">
            <lucide_react_1.Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary" placeholder={isRu ? 'example@email.com' : 'example@email.com'}/>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button type="button" onClick={onBack} disabled={isSubmitting} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isRu ? 'Назад' : 'Orqaga'}
          </button>
          <button type="submit" disabled={isSubmitting} className="flex-1 px-6 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting
            ? (isRu ? 'Отправка...' : 'Yuborilmoqda...')
            : (isRu ? 'Отправить' : 'Yuborish')}
          </button>
        </div>
      </form>
    </div>);
}
//# sourceMappingURL=contact-form.js.map