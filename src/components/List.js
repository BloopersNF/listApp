import Items from "./Items";

export default class List
{
    item = new Items;

    set item(item) {
        if (item.price == null) throw new Error();

        this.item = item;
    }
}

List.item = obj