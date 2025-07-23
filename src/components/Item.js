import { currencyToCents } from '../utils/currency';

export default class Item
{
    constructor(name, price, quantity)
    {
        this.name = name || '';
        // Store price in cents to avoid floating point errors
        this.priceCents = currencyToCents(price);
        // Keep original price string for display/editing
        this.price = price || '0';
        this.quantity = parseFloat(quantity?.toString().replace(',', '.')) || 1;
        this.checked = false;
    }
}