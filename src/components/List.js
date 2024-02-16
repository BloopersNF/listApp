
export default class List
{
    constructor(name, items, totalPrice, checked = false)
    {
        this.Name = name;
        this.Items = items;
        this.TotalPrice = totalPrice;
        this.Checked = checked;
    }
    addItem(item)
    {
        this.Items.push(item);
    }
}
