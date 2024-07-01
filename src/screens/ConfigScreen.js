import React from "react";
import { FlatList, Text, StyleSheet, View } from "react-native";
import lang from "../langs/lang";

const ConfigScreen = () => {

    const selected = "en";
    return(
        <View>
            <Text>
                {lang["languages"][selected].greeting}
            </Text>            
        </View>

    )

}
export default ConfigScreen;