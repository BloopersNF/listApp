import React, { useState } from "react";
import {StyleSheet,TouchableOpacity, View, Dimensions} from "react-native";
import Icon from "react-native-vector-icons/AntDesign";

const { width, height } = Dimensions.get('window');

const CreateButton = ({method, accessibilityLabel}) => {
    const buttonSize = Math.min(width, height) * 0.175; // 17.5% da menor dimensão
    const iconSize = buttonSize * 0.45; // 45% do tamanho do botão
    const margin = width * 0.07; // 7% da largura da tela
    const bottomMargin = height * 0.15; // 15% da altura para ficar acima da tab bar
    
    return(
        <TouchableOpacity 
            onPress={method} 
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            style={[styles.createButton, {
                width: buttonSize,
                height: buttonSize,
                borderRadius: buttonSize / 2,
                bottom: bottomMargin,
                right: margin,
            }]}
        >
            <Icon name="plus" size={iconSize} color="#fff"/>
        </TouchableOpacity>)
}
//colocando um botão no canto infeiror direito da tela e 10x10 de vw
const styles = StyleSheet.create({
    createButton: {
        position: 'absolute',
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#4151E1',
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    }
})

export default CreateButton;
