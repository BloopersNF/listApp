
export default class List
{
    constructor(name, items, totalPrice)
    {
        this.Name = name;
        this.Items = items;
        this.TotalPrice = totalPrice;
    }
    addItem(item)
    {
        this.Items.push(item);
    }
}
