import Items from "./Items";

export default class List
{
    Name;
    Price;
    Quantity;

    //constructor
    List(name, price, quantity)
    {
        this.Name = name;
        this.Price = price;
        this.Quantity = quantity;
    }
}
