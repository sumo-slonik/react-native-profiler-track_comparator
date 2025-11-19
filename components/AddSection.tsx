import {Pressable, StyleSheet, Text} from "react-native";
import React, {useState} from "react";
import colors from "../Styles/Colors";

const appStyles = StyleSheet.create({
    button: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 999,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    buttonAdd: {
        backgroundColor: colors.success_green,
    },
    buttonAddHover: {
        backgroundColor: colors.success_green_hover,
    },

});

const AddSection = ({handleAddSection}:{handleAddSection:()=>void})=>{
    const [addHover, setAddHover] = useState(false);

    return (
        <Pressable
            style={[
                appStyles.button,
                appStyles.buttonAdd,
                addHover && appStyles.buttonAddHover,
            ]}
            onPress={handleAddSection}
            onHoverIn={() => setAddHover(true)}
            onHoverOut={() => setAddHover(false)}
        >
            <Text style={appStyles.buttonText}>+ Dodaj Sekcję</Text>
        </Pressable>
    )
}

export default AddSection;
