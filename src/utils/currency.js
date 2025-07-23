/**
 * Utility functions for handling currency calculations
 * Prevents floating point precision errors by working with integers (cents)
 */

// Convert currency string to cents (integer)
export const currencyToCents = (value) => {
    if (!value || value === '' || value === '0') return 0;
    
    // Remove any non-numeric characters except dots and commas
    let cleanValue = value.toString().replace(/[^\d.,]/g, '');
    
    // Replace comma with dot for consistent decimal handling
    cleanValue = cleanValue.replace(',', '.');
    
    // Parse as float and convert to cents
    const floatValue = parseFloat(cleanValue) || 0;
    return Math.round(floatValue * 100);
};

// Convert cents (integer) back to currency string
export const centsToCurrency = (cents) => {
    if (!cents || cents === 0) return '0.00';
    return (cents / 100).toFixed(2);
};

// Add two currency values (returns cents)
export const addCurrency = (value1, value2) => {
    const cents1 = typeof value1 === 'number' ? value1 : currencyToCents(value1);
    const cents2 = typeof value2 === 'number' ? value2 : currencyToCents(value2);
    return cents1 + cents2;
};

// Subtract two currency values (returns cents)
export const subtractCurrency = (value1, value2) => {
    const cents1 = typeof value1 === 'number' ? value1 : currencyToCents(value1);
    const cents2 = typeof value2 === 'number' ? value2 : currencyToCents(value2);
    return cents1 - cents2;
};

// Multiply currency by quantity (returns cents)
export const multiplyCurrency = (price, quantity) => {
    const priceCents = typeof price === 'number' ? price : currencyToCents(price);
    const qty = typeof quantity === 'number' ? quantity : parseFloat(quantity.toString().replace(',', '.')) || 1;
    return Math.round(priceCents * qty);
};

// Format currency for display
export const formatCurrency = (value, prefix = '$') => {
    const cents = typeof value === 'number' ? value : currencyToCents(value);
    return `${prefix}${centsToCurrency(cents)}`;
};

// Validate currency input
export const isValidCurrency = (value) => {
    if (!value || value === '') return true; // Allow empty values
    const cleanValue = value.toString().replace(/[^\d.,]/g, '');
    const floatValue = parseFloat(cleanValue.replace(',', '.'));
    return !isNaN(floatValue) && floatValue >= 0;
};

// Validate quantity input
export const isValidQuantity = (value) => {
    if (!value || value === '') return true; // Allow empty values
    const cleanValue = value.toString().replace(/[^\d.,]/g, '');
    const floatValue = parseFloat(cleanValue.replace(',', '.'));
    return !isNaN(floatValue) && floatValue > 0;
};
