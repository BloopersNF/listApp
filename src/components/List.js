export default class List
{
    constructor(name, items = [], totalPrice = 0, deleted = false, id, date)
    {
        this.Name = name || '';
        this.Items = Array.isArray(items) ? items : [];
        this.TotalPrice = totalPrice || 0;
        this.TotalCheckedPrice = totalPrice || 0;
        this.TotalUncheckedPrice = totalPrice || 0;
        this.Deleted = deleted;
        this.DeletedAt = null;
        this.Id = id;
        this.Date = date || '';
    }
    addItem(item)
    {
        this.Items.push(item);

        
    }
    removeItem(index)
    {
        this.Items.splice(index, 1);
    }
}
