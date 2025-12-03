'use client';

import { useState, useEffect } from 'react';
import { Phone, MapPin, CheckCircle, User } from 'lucide-react';
import { getBranches, createLead } from '@/lib/api';
import { getBilingualText } from '@/lib/locale';
import type { BranchResponse } from '@/lib/api';

interface AppointmentFormProps {
  locale: 'uz' | 'ru';
  doctorId?: string | null;
}

// Phone number mask function for Uzbekistan (+998)
const formatPhoneNumber = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // If starts with 998, remove it (we'll add it back)
  let cleanDigits = digits.startsWith('998') ? digits.slice(3) : digits;
  
  // Limit to 9 digits (Uzbekistan mobile format)
  cleanDigits = cleanDigits.slice(0, 9);
  
  // Format: +998 XX XXX XX XX
  if (cleanDigits.length === 0) return '+998 ';
  if (cleanDigits.length <= 2) return `+998 ${cleanDigits}`;
  if (cleanDigits.length <= 5) return `+998 ${cleanDigits.slice(0, 2)} ${cleanDigits.slice(2)}`;
  if (cleanDigits.length <= 7) return `+998 ${cleanDigits.slice(0, 2)} ${cleanDigits.slice(2, 5)} ${cleanDigits.slice(5)}`;
  return `+998 ${cleanDigits.slice(0, 2)} ${cleanDigits.slice(2, 5)} ${cleanDigits.slice(5, 7)} ${cleanDigits.slice(7)}`;
};

const getPhoneDigits = (formatted: string): string => {
  return formatted.replace(/\D/g, '');
};

export default function AppointmentForm({ locale, doctorId }: AppointmentFormProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);

  // Fetch branches on mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const fetchedBranches = await getBranches(locale);
        setBranches(fetchedBranches);
        if (fetchedBranches.length > 0) {
          setSelectedBranch(fetchedBranches[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch branches:', error);
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, [locale]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
      // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true) ||
      // Allow home, end, left, right
      (e.keyCode >= 35 && e.keyCode <= 39)) {
      return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const phoneDigits = getPhoneDigits(phone);
    const isValidPhone = phoneDigits.length >= 12; // +998 + 9 digits = 12 total
    
    // Check if at least first name is filled (we split fullName)
    const nameParts = fullName.trim().split(' ').filter(Boolean);
    if (nameParts.length === 0 || !isValidPhone || !selectedBranch || !consent) {
      alert(locale === 'ru' ? 'Пожалуйста, заполните все обязательные поля' : 'Iltimos, barcha majburiy maydonlarni to\'ldiring');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedBranchData = branches.find(b => b.id === selectedBranch);
      const branchName = selectedBranchData 
        ? getBilingualText(selectedBranchData.name_uz, selectedBranchData.name_ru, locale)
        : '';

      await createLead({
        name: fullName.trim(),
        phone: phoneDigits,
        source: `appointment_form${doctorId ? `_doctor_${doctorId}` : ''}_branch_${selectedBranch}`,
        message: branchName ? `${locale === 'ru' ? 'Филиал' : 'Filial'}: ${branchName}` : undefined,
      }, locale);

      setIsSubmitted(true);
      setFullName('');
      setPhone('+998 ');
      setConsent(false);
      
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error('Failed to submit appointment:', error);
      alert(locale === 'ru' ? 'Ошибка при отправке. Попробуйте позже.' : 'Xatolik yuz berdi. Keyinroq urinib ko\'ring.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <CheckCircle className="mx-auto mb-3 h-12 w-12 text-green-600" />
        <h3 className="mb-2 text-lg font-semibold text-green-900">
          {locale === 'ru' ? 'Заявка отправлена!' : 'Ariza yuborildi!'}
        </h3>
        <p className="text-sm text-green-700">
          {locale === 'ru' 
            ? 'Наш специалист свяжется с вами в ближайшее время.'
            : 'Bizning mutaxassisimiz tez orada siz bilan bog\'lanadi.'}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* First Row: Ism va Familya */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              {locale === 'ru' ? 'Имя' : 'Ism'}
            </label>
            <div className="relative">
              <User className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={fullName.split(' ')[0] || ''}
                onChange={(e) => {
                  const parts = fullName.split(' ');
                  parts[0] = e.target.value;
                  setFullName(parts.join(' ').trim());
                }}
                placeholder={locale === 'ru' ? 'Имя' : 'Ism'}
                className="w-full rounded-md border border-border pl-9 pr-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/20"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              {locale === 'ru' ? 'Фамилия' : 'Familya'}
            </label>
            <div className="relative">
              <User className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={fullName.split(' ').slice(1).join(' ') || ''}
                onChange={(e) => {
                  const parts = fullName.split(' ');
                  const firstName = parts[0] || '';
                  setFullName([firstName, e.target.value].filter(Boolean).join(' '));
                }}
                placeholder={locale === 'ru' ? 'Фамилия' : 'Familya'}
                className="w-full rounded-md border border-border pl-9 pr-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Second Row: Telefon va Filialni tanlang */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              {locale === 'ru' ? 'Телефон' : 'Telefon'} *
            </label>
            <div className="relative">
              <Phone className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                onKeyDown={handlePhoneKeyDown}
                placeholder="+998 90 123 45 67"
                className="w-full rounded-md border border-border pl-9 pr-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/20"
                required
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              {locale === 'ru' ? 'Выберите адрес' : 'Filialni tanlang'} *
            </label>
            {loadingBranches ? (
              <div className="flex items-center justify-center rounded-md border border-border bg-muted px-3 py-2">
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-brand-primary"></div>
              </div>
            ) : (
              <div className="relative">
                <MapPin className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full appearance-none rounded-md border border-border pl-9 pr-8 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/20"
                  required
                >
                <option value="">{locale === 'ru' ? 'Выберите адрес' : 'Filialni tanlang'}</option>
                {branches.map((branch) => {
                  const branchName = getBilingualText(branch.name_uz, branch.name_ru, locale);
                  // Remove "Acoustic" prefix if it exists, then add it back
                  const cleanName = branchName.replace(/^Acoustic\s*-\s*/i, '').trim();
                  return (
                    <option key={branch.id} value={branch.id}>
                      Acoustic - {cleanName} filiali
                    </option>
                  );
                })}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
                  <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Consent Checkbox */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="consent"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 rounded border-border text-brand-primary focus:ring-brand-primary"
            required
          />
          <label htmlFor="consent" className="text-xs leading-relaxed text-muted-foreground">
            {locale === 'ru' 
              ? (
                <>
                  Я даю согласие на обработку{' '}
                  <a href="/privacy" className="text-brand-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    персональных данных
                  </a>
                </>
              )
              : (
                <>
                  Men{' '}
                  <a href="/privacy" className="text-brand-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    shaxsiy ma&apos;lumotlarni qayta ishlashga
                  </a>{' '}
                  rozilik beraman
                </>
              )}
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !fullName.trim().split(' ').filter(Boolean).length || getPhoneDigits(phone).length < 12 || !selectedBranch || !consent}
          className="w-full rounded-md bg-gradient-to-r from-brand-primary to-brand-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-sm"
        >
          {isSubmitting 
            ? (locale === 'ru' ? 'Отправка...' : 'Yuborilmoqda...')
            : (locale === 'ru' ? 'Отправить' : 'Yuborish')
          }
        </button>
      </form>
    </div>
  );
}

