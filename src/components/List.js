import Item from "./Item";

export default class List
{
    item = new Item;

    set item(item) {
        if (item.price == null) throw new Error();

        this.item = item;
    }
}

List.item = obj