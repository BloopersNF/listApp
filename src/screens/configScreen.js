import React from "react";
import { FlatList, Text, StyleSheet, View, SafeAreaView } from "react-native";
import lang from "../langs/lang";

const ConfigScreen = () => {

    const selected = "en";
    return(
        <SafeAreaView>
            <View >
                <Text >{lang.languages[selected].greeting}</Text>
                <FlatList
                    data={[
                        {key: lang.languages[selected].language},
                        {key: lang.languages[selected].theme},
                        {key: lang.languages[selected].bePremium},
                        {key: lang.languages[selected].about}
                    ]}
                    renderItem={({item}) => 
                        
                            <View style={styles.listItem}>
                                <Text>{item.key}</Text>
                            </View>
                    }
                />
            </View>          
        </SafeAreaView>

    )

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    listItem: {
        padding: 25,
        margin: 5,
        backgroundColor: "#e0e0e0",
        borderWidth: 1,
        borderColor: "#eee",
        borderRadius: 15
    }
});
export default ConfigScreen;