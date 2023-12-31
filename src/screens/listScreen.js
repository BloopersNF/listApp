import React from "react";
import { Text, StyleSheet, View, TouchableOpacity, TextInput } from "react-native";
import List from "../components/List";
import addItem from "../methods/addItem";

const ListScreen = () => 
{
    <View>
        <TextInput>
            <Text>teste</Text>
        </TextInput>
        <TouchableOpacity onPress={addItem}>
            <Text>adicionar</Text>
        </TouchableOpacity>
    </View>
}