export default class List
{
    constructor(name = '', items = [], totalPrice = 0, deleted = false, id, date = '')
    {
        this.Name = name;
        this.Items = Array.isArray(items) ? items : [];
        // Store prices in cents to avoid floating point errors
        this.TotalPrice = typeof totalPrice === 'number' ? totalPrice : 0;
        this.TotalCheckedPrice = 0;
        this.TotalUncheckedPrice = this.TotalPrice;
        this.Deleted = deleted;
        this.DeletedAt = null;
        this.Id = id;
        this.Date = date;
    }
    addItem(item)
    {
        this.Items.push(item);
    }
    
    removeItem(index)
    {
        if (index >= 0 && index < this.Items.length) {
            this.Items.splice(index, 1);
        }
    }
    
    // Calculate totals from items (useful for data migration or validation)
    recalculateTotals()
    {
        this.TotalPrice = 0;
        this.TotalCheckedPrice = 0;
        this.TotalUncheckedPrice = 0;
        
        this.Items.forEach(item => {
            const itemTotal = (item.priceCents || 0) * (item.quantity || 1);
            this.TotalPrice += itemTotal;
            
            if (item.checked) {
                this.TotalCheckedPrice += itemTotal;
            } else {
                this.TotalUncheckedPrice += itemTotal;
            }
        });
    }
}
