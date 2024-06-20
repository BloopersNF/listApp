import React, { useState } from "react";
import {StyleSheet,TouchableOpacity, View} from "react-native";
import Icon from "react-native-vector-icons/AntDesign";

const CreateButton = ({method}) => {
    return(
        <TouchableOpacity onPress={method} >
            <View style={styles.createButton}>
                <Icon name="plus" size={30} color="#fff"/>
            </View>
        </TouchableOpacity>)
}
//colocando um botão no canto infeiror direito da tela e 10x10 de vw
const styles = StyleSheet.create({
    createButton: {
        position: 'absolute',
        justifyContent: "center",
        alignItems: "center",
        width: 65,
        height: 65,
        borderRadius: "50%",
        backgroundColor: '#4151E1', // change this to a bright color
        bottom: 65,
        right: 10,
    }
})

export default CreateButton;