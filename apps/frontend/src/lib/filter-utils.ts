// Utility functions for dynamic filter generation from product data

export interface FilterOption {
  value: string;
  label_uz: string;
  label_ru: string;
}

// Mapping functions for filter values to labels
const AUDIENCE_LABELS: Record<string, { uz: string; ru: string }> = {
  children: { uz: 'Bolalar', ru: 'Детям' },
  adults: { uz: 'Kattalar', ru: 'Взрослым' },
  elderly: { uz: 'Keksalar', ru: 'Пожилым' },
};

const FORM_FACTOR_LABELS: Record<string, { uz: string; ru: string }> = {
  'bte': { uz: 'BTE', ru: 'BTE' },
  'mini-bte': { uz: 'Mini BTE', ru: 'Mini BTE' },
  'ric': { uz: 'RIC', ru: 'RIC' },
  'rite': { uz: 'RITE', ru: 'RITE' },
  'ite': { uz: 'ITE', ru: 'ITE' },
  'cic': { uz: 'CIC', ru: 'CIC' },
  'cic-iic': { uz: 'CIC/IIC', ru: 'CIC/IIC' },
  'iic': { uz: 'IIC', ru: 'IIC' },
  'power-bte': { uz: 'Power BTE', ru: 'Power BTE' },
};

const HEARING_LOSS_LABELS: Record<string, { uz: string; ru: string }> = {
  mild: { uz: 'I daraja', ru: 'I степень' },
  moderate: { uz: 'II daraja', ru: 'II степень' },
  severe: { uz: 'III daraja', ru: 'III степень' },
  profound: { uz: 'IV daraja', ru: 'IV степень' },
};

const POWER_LEVEL_LABELS: Record<string, { uz: string; ru: string }> = {
  'Standard': { uz: 'Standart', ru: 'Стандартная' },
  'Power': { uz: 'Kuchli', ru: 'Мощная' },
  'Super Power': { uz: 'Super kuchli', ru: 'Супермощная' },
};

// Generate filter options from available values
export function generateAudienceOptions(
  availableValues: string[],
  locale: 'uz' | 'ru'
): FilterOption[] {
  return availableValues
    .filter((value) => AUDIENCE_LABELS[value])
    .map((value) => ({
      value,
      label_uz: AUDIENCE_LABELS[value].uz,
      label_ru: AUDIENCE_LABELS[value].ru,
    }))
    .sort((a, b) => {
      // Sort: children, adults, elderly
      const order = ['children', 'adults', 'elderly'];
      return order.indexOf(a.value) - order.indexOf(b.value);
    });
}

export function generateFormFactorOptions(
  availableValues: string[],
  locale: 'uz' | 'ru'
): FilterOption[] {
  return availableValues
    .filter((value) => FORM_FACTOR_LABELS[value])
    .map((value) => ({
      value,
      label_uz: FORM_FACTOR_LABELS[value].uz,
      label_ru: FORM_FACTOR_LABELS[value].ru,
    }))
    .sort((a, b) => {
      // Sort by predefined order
      const order = ['bte', 'mini-bte', 'ric', 'rite', 'ite', 'cic', 'cic-iic', 'iic', 'power-bte'];
      const aIndex = order.indexOf(a.value);
      const bIndex = order.indexOf(b.value);
      if (aIndex === -1 && bIndex === -1) return a.value.localeCompare(b.value);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
}

export function generateHearingLossOptions(
  availableValues: string[],
  locale: 'uz' | 'ru'
): FilterOption[] {
  return availableValues
    .filter((value) => HEARING_LOSS_LABELS[value])
    .map((value) => ({
      value,
      label_uz: HEARING_LOSS_LABELS[value].uz,
      label_ru: HEARING_LOSS_LABELS[value].ru,
    }))
    .sort((a, b) => {
      // Sort: mild, moderate, severe, profound
      const order = ['mild', 'moderate', 'severe', 'profound'];
      return order.indexOf(a.value) - order.indexOf(b.value);
    });
}

export function generatePowerLevelOptions(
  availableValues: string[],
  locale: 'uz' | 'ru'
): FilterOption[] {
  return availableValues
    .filter((value) => POWER_LEVEL_LABELS[value])
    .map((value) => ({
      value,
      label_uz: POWER_LEVEL_LABELS[value].uz,
      label_ru: POWER_LEVEL_LABELS[value].ru,
    }))
    .sort((a, b) => {
      // Sort: Standard, Power, Super Power
      const order = ['Standard', 'Power', 'Super Power'];
      return order.indexOf(a.value) - order.indexOf(b.value);
    });
}
