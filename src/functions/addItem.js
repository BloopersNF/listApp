import { useState } from "react";

const addItem = (item) =>
{
    const [listItems, setListItems] = useState([]);

    setListItems([...listItems, item]);
        
}