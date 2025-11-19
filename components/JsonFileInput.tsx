import React, { useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ProfilerFile } from "../types/FileEntry";

interface JsonFileInputProps {
    index: number;
    onFilesLoaded: (
        dataArray: ProfilerFile[],
        fileNames: string[],
        index: number
    ) => void;
    onError: (message: string, index: number) => void;
}

const JsonFileInput: React.FC<JsonFileInputProps> = React.memo(
    ({ index, onFilesLoaded, onError }) => {

        const fileInputRef = useRef<HTMLInputElement>(null);

        const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files;

            if (!files || files.length === 0) {
                onError('No file selected.', index);
                return;
            }

            const fileNames: string[] = [];

            try {
                const readPromises = Array.from(files).map((file) => {
                    fileNames.push(file.name);
                    return new Promise<ProfilerFile>((resolve, reject) => {
                        const reader = new FileReader();

                        reader.onload = async (e) => {
                            try {
                                const content = e.target?.result as string;

                                const parsedData: any = JSON.parse(content);
                                if (parsedData.version === undefined || parsedData.dataForRoots === undefined) {
                                    throw new Error(`Missing key fields 'version' or 'dataForRoots' in file ${file.name}.`);
                                }
                                resolve(parsedData as ProfilerFile);
                            } catch (err) {
                                reject(`JSON parsing error in file ${file.name}.`);
                            }
                        };

                        reader.onerror = () => reject(`Error reading file ${file.name}.`);
                        reader.readAsText(file);
                    });
                });

                const dataArray = await Promise.all(readPromises);
                onFilesLoaded(dataArray, fileNames, index);

            } catch (error) {
                onError(error as string, index);
            }

        }, [index, onFilesLoaded, onError]);

        const handlePress = () => {
            fileInputRef.current?.click();
        };

        return (
            <View style={fileInputStyles.wrapper}>
                <Text style={fileInputStyles.label}>Load File(s)</Text>

                <input
                    ref={fileInputRef}
                    id={`json-file-input-${index}`}
                    type="file"
                    accept=".json"
                    multiple
                    onChange={handleFileChange}
                    style={{ position: 'absolute', opacity: 0, height: 0, width: 0 }}
                />

                <Pressable style={fileInputStyles.button} onPress={handlePress}>
                    <Text style={fileInputStyles.buttonText}>Select .json files</Text>
                </Pressable>
            </View>
        );
    }
);

const fileInputStyles = StyleSheet.create({
    wrapper: {
        padding: 16,
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        alignItems: 'center',
    },
    label: {
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 999,
        backgroundColor: '#f3e8ff',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8b5cf6',
    },
});

export default JsonFileInput;
