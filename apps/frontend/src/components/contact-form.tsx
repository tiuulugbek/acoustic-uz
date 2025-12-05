'use client';

import { useState } from 'react';
import { User, Phone, Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import type { Locale } from '@/lib/locale';

interface ContactFormProps {
  locale: Locale;
}

export default function ContactForm({ locale }: ContactFormProps) {
  const isRu = locale === 'ru';
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim() || undefined,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          message: message.trim() || undefined,
          source: 'contact-page',
        }),
      });

      if (!response.ok) {
        throw new Error(isRu ? 'Ошибка при отправке' : 'Yuborishda xatolik');
      }

      // Success
      setIsSuccess(true);
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');

      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : (isRu ? 'Ошибка при отправке' : 'Yuborishda xatolik'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2" suppressHydrationWarning>
          {isRu ? 'Сообщение отправлено!' : 'Xabar yuborildi!'}
        </h3>
        <p className="text-muted-foreground" suppressHydrationWarning>
          {isRu 
            ? 'Мы свяжемся с вами в ближайшее время'
            : 'Biz tez orada siz bilan bog\'lanamiz'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2" suppressHydrationWarning>
          {isRu ? 'Имя' : 'Ism'} <span className="text-muted-foreground">({isRu ? 'необязательно' : 'ixtiyoriy'})</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors"
            placeholder={isRu ? 'Ваше имя' : 'Ismingiz'}
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2" suppressHydrationWarning>
          {isRu ? 'Телефон' : 'Telefon'} <span className="text-muted-foreground">({isRu ? 'необязательно' : 'ixtiyoriy'})</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors"
            placeholder="+998 90 123 45 67"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2" suppressHydrationWarning>
          Email <span className="text-muted-foreground">({isRu ? 'необязательно' : 'ixtiyoriy'})</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors"
            placeholder="example@email.com"
          />
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2" suppressHydrationWarning>
          {isRu ? 'Сообщение' : 'Xabar'} <span className="text-muted-foreground">({isRu ? 'необязательно' : 'ixtiyoriy'})</span>
        </label>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors resize-none"
            placeholder={isRu ? 'Ваше сообщение...' : 'Xabaringiz...'}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span suppressHydrationWarning>{isRu ? 'Отправка...' : 'Yuborilmoqda...'}</span>
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            <span suppressHydrationWarning>{isRu ? 'Отправить сообщение' : 'Xabar yuborish'}</span>
          </>
        )}
      </button>

      <p className="text-xs text-muted-foreground text-center" suppressHydrationWarning>
        {isRu 
          ? 'Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности'
          : 'Tugmani bosish orqali siz maxfiylik siyosatiga rozilik bildirasiz'}
      </p>
    </form>
  );
}

