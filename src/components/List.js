
export default class List
{
    constructor(name, items, totalPrice, key = null)
    {
        this.Name = name;
        this.Items = items;
        this.TotalPrice = totalPrice;
        this.Key = key;
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
