
export default class List
{
    constructor(name, items, totalPrice, checked = false)
    {
        this.Name = name;
        this.Items = items;
        this.TotalPrice = totalPrice;
        this.TotalCheckedPrice = totalPrice;
        this.TotalUncheckedPrice = totalPrice;
        this.Checked = checked;
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
