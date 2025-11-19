import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface GroupNameInputProps {
    index: number;
    initialName: string;
    onNameChange: (newName: string, index: number) => void;
}

const GroupNameInput: React.FC<GroupNameInputProps> = ({
                                                           index,
                                                           initialName,
                                                           onNameChange,
                                                       }) => {
    const [name, setName] = useState(initialName);

    useEffect(() => {
        setName(initialName);
    }, [initialName]);

    const handleChange = (text: string) => {
        setName(text);
        onNameChange(text, index);
    };

    return (
        <View style={styles.wrapper}>
            <Text style={styles.label}>Group Name (chart)</Text>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={handleChange}
                placeholder={`Group ${index + 1}`}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6b7280',
    },
    input: {
        marginTop: 4,
        width: '100%',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#d1d5db',
        padding: 8,
        fontSize: 14,
    },
});

export default GroupNameInput;
