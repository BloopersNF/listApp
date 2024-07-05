
export default class List
{
    constructor(name, items, totalPrice, deleted = false, id, date)
    {
        this.Name = name;
        this.Items = items;
        this.TotalPrice = totalPrice;
        this.TotalCheckedPrice = totalPrice;
        this.TotalUncheckedPrice = totalPrice;
        this.Deleted = deleted;
        this.Id = id;
        this.Date = date
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
