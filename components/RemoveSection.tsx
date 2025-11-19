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
    buttonRemove: {
        backgroundColor: '#ef4444',
    },
    buttonRemoveHover: {
        backgroundColor: '#dc2626',
    },
    buttonExport: {
        backgroundColor: '#4f46e5',
    },
    buttonExportHover: {
        backgroundColor: '#4338ca',
    },
    buttonDisabled: {
        backgroundColor: '#9ca3af',
        opacity: 0.7,
    },

});

const RemoveSection = ({isDisabled,handleRemoveSection}:{isDisabled:boolean,handleRemoveSection:()=>void})=>{
    const [addHover, setAddHover] = useState(false);
    const [removeHover, setRemoveHover] = useState(false);

    return (
        <Pressable
            style={[
                appStyles.button,
                appStyles.buttonRemove,
                isDisabled && appStyles.buttonDisabled,
                removeHover && !isDisabled && appStyles.buttonRemoveHover,
            ]}
            onPress={handleRemoveSection}
            disabled={isDisabled}
            onHoverIn={() => setRemoveHover(true)}
            onHoverOut={() => setRemoveHover(false)}
        >
            <Text style={appStyles.buttonText}>- Usuń Ostatnią</Text>
        </Pressable>
    )
}

export default RemoveSection;
