// src/components/controls/JsonFileInput.tsx

import React, { useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
// ZMIANA: Używamy modułu DocumentPicker tylko, aby uniknąć błędów Type checkingu, ale de facto nie używamy API.
// Możesz to zmienić na import { ProfilerFile } from '../../types';
import * as DocumentPicker from 'expo-document-picker';

import { ProfilerFile } from '../../types';
// ZMIANA: Zakładamy, że ta funkcja jest w utils
import { readAndParseProfilerFile } from '../../utils/dataProcessing';

// --- INTERFEJSY I TYPY (Upewnij się, że są zaimportowane z 'types') ---

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

        // ZMIANA: Referencja do ukrytego inputu HTML (potrzebna tylko w Web)
        const fileInputRef = useRef<HTMLInputElement>(null);

        // --- 1. Logika obsługi zmiany plików (NATYWNY INPUT) ---

        const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files;

            if (!files || files.length === 0) {
                // Nie wybrano pliku (choć przyciski nie powinny na to pozwolić)
                onError('Nie wybrano żadnego pliku.', index);
                return;
            }

            const assets: DocumentPicker.DocumentPickerAsset[] = [];
            const fileNames: string[] = [];

            // ZMIANA: Konwersja FileList na tablicę i użycie obiektu File
            // Ponieważ FileSystem.readAsStringAsync NIE DZIAŁA z natywnym obiektem File,
            // musimy go odczytać za pomocą natywnego FileReader API.

            try {
                const readPromises = Array.from(files).map((file) => {
                    fileNames.push(file.name);
                    return new Promise<ProfilerFile>((resolve, reject) => {
                        const reader = new FileReader();

                        reader.onload = async (e) => {
                            try {
                                // Konwersja na ProfilerFile (używamy logiki parsowania)
                                const content = e.target?.result as string;

                                // Tutaj musimy parsować JSON, ponieważ nie używamy FileSystem
                                const parsedData: any = JSON.parse(content);
                                if (parsedData.version === undefined || parsedData.dataForRoots === undefined) {
                                    throw new Error(`Brak kluczowych pól 'version' lub 'dataForRoots' w pliku ${file.name}.`);
                                }
                                resolve(parsedData as ProfilerFile);
                            } catch (err) {
                                reject(`Błąd parsowania JSON w pliku ${file.name}.`);
                            }
                        };

                        reader.onerror = () => reject(`Błąd odczytu pliku ${file.name}.`);
                        reader.readAsText(file); // Odczyt pliku jako tekst
                    });
                });

                const dataArray = await Promise.all(readPromises);
                onFilesLoaded(dataArray, fileNames, index);

            } catch (error) {
                onError(error as string, index);
            }

        }, [index, onFilesLoaded, onError]);

        // --- 2. Obsługa kliknięcia przycisku (otwiera ukryty input) ---
        const handlePress = () => {
            // ZMIANA: Kliknięcie w przycisk symuluje kliknięcie w ukryty input
            fileInputRef.current?.click();
        };

        // --- 3. Funkcja zastępcza (wymagana w RN, nie używana w Web) ---
        // Ta funkcja była w Twoim pierwotnym kodzie, teraz jest zbędna.
        // Aby uniknąć błędów w natywnych środowiskach, musiałbyś użyć DocumentPicker.

        // --- JSX ---
        return (
            <View style={fileInputStyles.wrapper}>
                <Text style={fileInputStyles.label}>Wczytaj Plik(i)</Text>

                {/* 1. UKRYTY NATYWNY INPUT HTML (Widoczny tylko w Web) */}
                {/* Używamy stylów RN do kontrolowania widoczności w Web */}
                <input
                    ref={fileInputRef}
                    id={`json-file-input-${index}`}
                    type="file"
                    accept=".json"
                    multiple
                    onChange={handleFileChange}
                    // Ukrycie inputu (poza Web jest niewidoczny i tak)
                    style={{ position: 'absolute', opacity: 0, height: 0, width: 0 }}
                />

                {/* 2. Przycisk (widoczny we wszystkich środowiskach) */}
                <Pressable style={fileInputStyles.button} onPress={handlePress}>
                    <Text style={fileInputStyles.buttonText}>Wybierz pliki .json</Text>
                </Pressable>
            </View>
        );
    }
);

// PAMIĘTAJ: Musisz przenieść style 'fileInputStyles' do oddzielnego pliku
// lub zdefiniować je globalnie, aby ten komponent działał.

// Przykład definicji (jeśli nie masz ich w osobnym pliku):
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
