import React, { useState, useCallback, useEffect, useRef }
  from 'react';
// [!code focus: 15]
// ZMIANA: Importujemy komponenty z 'react-native', a nie 'react-dom'
import {
  View,
  Text,
  StyleSheet,
  Pressable, // Zamiast <button>
  TextInput, // Zamiast <input type="text">
  ScrollView, // Dla przewijania
  FlatList, // Dla responsywnej siatki
  Alert,
  useWindowDimensions, // Dla responsywności
} from 'react-native';

// [!code focus: 4]
// ZMIANA: Importujemy nowe API natywne
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';

// --- TYPY DANYCH (Bez zmian) ---
type AggregatedTimes = {
  totalDuration?: number;
  totalEffectDuration?: number;
  totalPassiveEffectDuration?: number;
};
type CommitDataEntry = {
  duration: number;
  effectDuration: number;
  passiveEffectDuration: number;
};
type RootData = {
  commitData: CommitDataEntry[];
};
type ProfilerFile = {
  version: number;
  dataForRoots: RootData[];
};
type FileStats = {
  fileName: string;
  totalDuration: number;
  commitCount: number;
};
type FileCommitData = {
  id: number;
  groupName: string;
  fileNames: string[];
  profilerDataArray: ProfilerFile[];
  averageSummary: AggregatedTimes | null;
  loadingError: string | null;
  fileStats: FileStats[];
};

// --- FUNKCJE POMOCNICZE (Bez zmian) ---
const aggregateCommitTimes = (
    profilerData: ProfilerFile
): AggregatedTimes & { commitCount: number } => {
  let totalDuration = 0;
  let totalEffectDuration = 0;
  let totalPassiveEffectDuration = 0;
  let commitCount = 0;

  for (const root of profilerData.dataForRoots) {
    commitCount += root.commitData.length;
    for (const commit of root.commitData) {
      totalDuration += commit.duration || 0;
      totalEffectDuration += commit.effectDuration || 0;
      totalPassiveEffectDuration += commit.passiveEffectDuration || 0;
    }
  }
  return {
    totalDuration,
    totalEffectDuration,
    totalPassiveEffectDuration,
    commitCount,
  };
};

const calculateAverageTimes = (
    profilerDataArray: ProfilerFile[]
): AggregatedTimes => {
  if (profilerDataArray.length === 0) {
    return {
      totalDuration: 0,
      totalEffectDuration: 0,
      totalPassiveEffectDuration: 0,
    };
  }
  let totalDurationSum = 0;
  let totalEffectDurationSum = 0;
  let totalPassiveEffectDurationSum = 0;

  for (const profilerData of profilerDataArray) {
    const totals = aggregateCommitTimes(profilerData);
    totalDurationSum += totals.totalDuration || 0;
    totalEffectDurationSum += totals.totalEffectDuration || 0;
    totalPassiveEffectDurationSum += totals.totalPassiveEffectDuration || 0;
  }
  const count = profilerDataArray.length;
  return {
    totalDuration: totalDurationSum / count,
    totalEffectDuration: totalEffectDurationSum / count,
    totalPassiveEffectDuration: totalPassiveEffectDurationSum / count,
  };
};

// --- KOMPONENTY WIZUALIZACJI ---

// 1. CHART KOMPONENT (POJEDYNCZY SŁUPEK) - PRZEPISANY
interface CommitTimeChartProps {
  data: AggregatedTimes;
  title: string;
}

const CommitTimeChart: React.FC<CommitTimeChartProps> = ({ data, title }) => {
  const {
    totalDuration = 0,
    totalEffectDuration = 0,
    totalPassiveEffectDuration = 0,
  } = data;

  const totalEffects = totalEffectDuration + totalPassiveEffectDuration;
  const totalRenderAndCommitDuration = Math.max(0, totalDuration - totalEffects);

  const renderHeight = `${(totalRenderAndCommitDuration / totalDuration) * 100 || 0
  }%`;
  const layoutHeight = `${(totalEffectDuration / totalDuration) * 100 || 0}%`;
  const passiveHeight = `${(totalPassiveEffectDuration / totalDuration) * 100 || 0
  }%`;

  const barWidth = 80;
  const totalHeight = 200;

  return (
      <View style={chartStyles.chartWrapper}>
        <Text style={chartStyles.chartTitle}>{title}</Text>
        <View style={chartStyles.barContainer}>
          <View
              style={[
                chartStyles.barStack,
                {
                  height: totalHeight,
                  width: barWidth,
                  backgroundColor: totalDuration === 0 ? '#f3f4f6' : '#e5e7eb',
                },
              ]}
          >
            {/* Passive Effects (useEffect) - Green */}
            <View
                style={[chartStyles.passiveSegment, { height: passiveHeight }]}
            />
            {/* Layout Effects (useLayoutEffect) - Amber */}
            <View
                style={[chartStyles.layoutSegment, { height: layoutHeight }]}
            />
            {/* Render & Commit (Active) - Blue */}
            <View
                style={[chartStyles.renderSegment, { height: renderHeight }]}
            />
          </View>
        </View>
        <Text style={chartStyles.totalText}>
          Średnia Suma: {totalDuration.toFixed(2)} ms
        </Text>
      </View>
  );
};

// Style dla CommitTimeChart
const chartStyles = StyleSheet.create({
  chartWrapper: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginTop: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 208,
    justifyContent: 'center',
  },
  barStack: {
    flexDirection: 'column-reverse',
    position: 'relative',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  baseSegment: {
    width: '100%',
    // transition: 'all 500ms' // W RN animacje robi się inaczej (Animated API)
  },
  passiveSegment: {
    width: '100%',
    backgroundColor: '#10b981',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  layoutSegment: {
    width: '100%',
    backgroundColor: '#f59e0b',
  },
  renderSegment: {
    width: '100%',
    backgroundColor: '#3b82f6',
  },
  totalText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
});

// 2. ZBIORCZY KOMPONENT PORÓWNAWCZY - PRZEPISANY
interface MultiGroupComparisonChartProps {
  files: FileCommitData[];
  showMeasurementCount: boolean;
}

const MultiGroupComparisonChart: React.FC<MultiGroupComparisonChartProps> = ({
                                                                               files,
                                                                               showMeasurementCount,
                                                                             }) => {
  const totalChartHeight = 200;

  const validFiles = files.filter(
      (f) =>
          f.averageSummary &&
          f.averageSummary.totalDuration &&
          f.averageSummary.totalDuration > 0
  );

  if (validFiles.length === 0) {
    return (
        <View style={multiGroupStyles.wrapperError}>
          <Text style={multiGroupStyles.textError}>
            Brak wczytanych danych do porównania (lub wszystkie czasy są zerowe).
          </Text>
        </View>
    );
  }

  const maxDuration = validFiles.reduce((max, f) => {
    const duration = f.averageSummary?.totalDuration || 0;
    return Math.max(max, duration);
  }, 0);

  let scaleMax = 100;
  if (maxDuration > 0) {
    if (maxDuration > 1000)
      scaleMax = Math.ceil(maxDuration / 500) * 500;
    else if (maxDuration > 200)
      scaleMax = Math.ceil(maxDuration / 100) * 100;
    else if (maxDuration > 50)
      scaleMax = Math.ceil(maxDuration / 50) * 50;
    else scaleMax = Math.ceil(maxDuration / 10) * 10;
  }

  const yAxisMarkers = [0.75, 0.5, 0.25, 0].map((multiplier) => ({
    value: scaleMax * multiplier,
    bottom: multiplier * totalChartHeight,
  }));
  yAxisMarkers.push({ value: scaleMax, bottom: totalChartHeight });

  return (
      <View style={multiGroupStyles.wrapper}>
        <Text style={multiGroupStyles.title}>
          Zbiorcze Porównanie Średnich Czasów Commitów
        </Text>

        {/* Global Legend */}
        <View style={multiGroupStyles.legend}>
          <View style={multiGroupStyles.legendItem}>
            <View style={[multiGroupStyles.legendDot, { backgroundColor: '#3b82f6' }]} />
            <Text>Render + Commit</Text>
          </View>
          <View style={multiGroupStyles.legendItem}>
            <View style={[multiGroupStyles.legendDot, { backgroundColor: '#f59e0b' }]} />
            <Text>Layout Effects</Text>
          </View>
          <View style={multiGroupStyles.legendItem}>
            <View style={[multiGroupStyles.legendDot, { backgroundColor: '#10b981' }]} />
            <Text>Passive Effects</Text>
          </View>
        </View>

        {/* Comparison chart container */}
        <View style={multiGroupStyles.chartContainer}>
          {/* Oś Y (Skala czasu) */}
          <View style={multiGroupStyles.yAxis}>
            {yAxisMarkers.map((marker, index) => (
                <View
                    key={index}
                    style={[
                      multiGroupStyles.yAxisMarker,
                      {
                        bottom: marker.bottom,
                        borderBottomWidth: index < yAxisMarkers.length - 1 && index > 0 ? 1 : 0,
                      },
                    ]}
                >
                  <Text style={multiGroupStyles.yAxisText}>
                    {marker.value.toFixed(0)} ms
                  </Text>
                </View>
            ))}
          </View>

          {/* ZMIANA: Używamy ScrollView dla overflow-x */}
          <ScrollView
              horizontal={true}
              style={multiGroupStyles.barListWrapper}
              contentContainerStyle={multiGroupStyles.barListContent}
          >
            {validFiles.map((fileEntry) => {
              const data = fileEntry.averageSummary!;
              const totalDuration = data.totalDuration || 0;

              const totalEffects =
                  (data.totalEffectDuration || 0) +
                  (data.totalPassiveEffectDuration || 0);
              const totalRenderAndCommitDuration = Math.max(
                  0,
                  totalDuration - totalEffects
              );

              const barHeight = (totalDuration / scaleMax) * totalChartHeight;
              const renderHeightPx =
                  (totalRenderAndCommitDuration / scaleMax) * totalChartHeight || 0;
              const layoutHeightPx =
                  (data.totalEffectDuration! / scaleMax) * totalChartHeight || 0;
              const passiveHeightPx =
                  (data.totalPassiveEffectDuration! / scaleMax) * totalChartHeight || 0;

              const barWidth = 80;

              return (
                  <View key={fileEntry.id} style={multiGroupStyles.barWrapper}>
                    <Text style={multiGroupStyles.barLabelTop}>
                      Średnia: {totalDuration.toFixed(2)} ms
                    </Text>

                    {/* Single Bar */}
                    <View
                        style={[
                          chartStyles.barStack, // Używamy stylów z pojedynczego wykresu
                          {
                            height: barHeight,
                            width: barWidth,
                            backgroundColor: '#e5e7eb',
                          },
                        ]}
                    >
                      <View
                          style={[
                            chartStyles.passiveSegment,
                            { height: passiveHeightPx },
                          ]}
                      />
                      <View
                          style={[
                            chartStyles.layoutSegment,
                            { height: layoutHeightPx },
                          ]}
                      />
                      <View
                          style={[
                            chartStyles.renderSegment,
                            { height: renderHeightPx },
                          ]}
                      />
                    </View>

                    {/* Group Label */}
                    <Text style={multiGroupStyles.barLabelBottom} numberOfLines={1}>
                      {fileEntry.groupName}
                    </Text>
                    {/* WARUNKOWE WYŚWIETLANIE LICZBY POMIARÓW */}
                    {showMeasurementCount && (
                        <Text style={multiGroupStyles.barLabelTop}>
                          ({fileEntry.fileNames.length} pom.)
                        </Text>
                    )}
                  </View>
              );
            })}
          </ScrollView>
        </View>

        <Text style={multiGroupStyles.footerText}>
          Wysokość słupka jest skalowana względem{' '}
          <Text style={{ fontWeight: 'bold' }}>
            Maksymalnej Skali Czasu ({scaleMax.toFixed(0)} ms)
          </Text>
          .
        </Text>
      </View>
  );
};

// Style dla MultiGroupComparisonChart
const multiGroupStyles = StyleSheet.create({
  wrapper: {
    marginTop: 32,
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderTopWidth: 8,
    borderTopColor: '#4f46e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  wrapperError: {
    marginTop: 32,
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderTopWidth: 4,
    borderTopColor: '#4f46e5',
  },
  textError: {
    textAlign: 'center',
    color: '#6b7280',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 200,
  },
  yAxis: {
    height: 200,
    width: 48,
    marginRight: 8,
    borderRightWidth: 1,
    borderRightColor: '#d1d5db',
  },
  yAxisMarker: {
    position: 'absolute',
    right: 0,
    width: '100%',
    paddingRight: 8,
    borderColor: '#e5e7eb',
    paddingBottom: 3,
  },
  yAxisText: {
    textAlign: 'right',
    fontSize: 12,
    color: '#6b7280',
  },
  barListWrapper: {
    flex: 1,
    height: 200,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  barListContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  barWrapper: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    marginHorizontal: 16, // Zwiększony odstęp
  },
  barLabelTop: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  barLabelBottom: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    maxWidth: 80,
  },
  footerText: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 14,
    color: '#4b5563',
  },
});

// 3. KOMPONENT INPUTU NAZWY GRUPY - PRZEPISANY
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
      <View style={groupNameInputStyles.wrapper}>
        <Text style={groupNameInputStyles.label}>Nazwa Grupy (wykres)</Text>
        {/* ZMIANA: Używamy TextInput */}
        <TextInput
            style={groupNameInputStyles.input}
            value={name}
            onChangeText={handleChange}
            placeholder={`Grupa ${index + 1}`}
        />
      </View>
  );
};

// Style dla GroupNameInput
const groupNameInputStyles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  input: {
    marginTop: 4,
    display: 'block',
    width: '100%',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 8,
    fontSize: 14,
    // Odpowiednik 'focus:' wymagałby dodatkowego stanu
  },
});

// 4. JSON FILE INPUT KOMPONENT - PRZEPISANY (KRYTYCZNA ZMIANA LOGIKI)
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
      const readSingleFile = async (
          asset: DocumentPicker.DocumentPickerAsset
      ): Promise<ProfilerFile> => {
        // ZMIANA: Używamy FileSystem.readAsStringAsync
        const content = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        try {
          const parsedData: any = JSON.parse(content);
          if (
              parsedData.version === undefined ||
              parsedData.dataForRoots === undefined
          ) {
            throw new Error(
                `Brak kluczowych pól 'version' lub 'dataForRoots' w pliku ${asset.name}.`
            );
          }
          return parsedData as ProfilerFile;
        } catch (err) {
          throw new Error(`Błąd parsowania JSON w pliku ${asset.name}.`);
        }
      };

      // ZMIANA: Cała logika `handleFileChange` zastąpiona przez `handlePickDocument`
      const handlePickDocument = useCallback(async () => {
        try {
          const pickerResult = await DocumentPicker.getDocumentAsync({
            type: 'application/json',
            multiple: true,
          });

          if (pickerResult.type === 'success' && pickerResult.assets) {
            const assets = pickerResult.assets;
            const readPromises = assets.map(readSingleFile);
            const fileNames = assets.map((f) => f.name);

            const dataArray = await Promise.all(readPromises);
            onFilesLoaded(dataArray, fileNames, index);
          } else {
            onError('Nie wybrano żadnego pliku.', index);
          }
        } catch (error) {
          onError((error as Error).message, index);
        }
      }, [index, onFilesLoaded, onError]);

      // ZMIANA: JSX jest teraz przyciskiem, a nie inputem
      return (
          <View style={fileInputStyles.wrapper}>
            <Text style={fileInputStyles.label}>Wczytaj Plik(i)</Text>
            <Pressable style={fileInputStyles.button} onPress={handlePickDocument}>
              <Text style={fileInputStyles.buttonText}>Wybierz pliki .json</Text>
            </Pressable>
          </View>
      );
    }
);

// Style dla JsonFileInput
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

// --- GŁÓWNY KOMPONENT APLIKACJI - PRZEPISANY ---

const createNewFileEntry = (id: number, index: number): FileCommitData => ({
  id,
  groupName: `Grupa ${index + 1}`,
  fileNames: [],
  profilerDataArray: [],
  averageSummary: null,
  loadingError: null,
  fileStats: [],
});

const App: React.FC = () => {
  const [files, setFiles] = useState<FileCommitData[]>([]);
  const [showMeasurementCount, setShowMeasurementCount] = useState(true);

  // [!code focus: 3]
  // ZMIANA: Stany do obsługi hover na przyciskach
  const [addHover, setAddHover] = useState(false);
  const [removeHover, setRemoveHover] = useState(false);
  const [exportHover, setExportHover] = useState(false);

  // [!code focus: 2]
  // ZMIANA: Hook do responsywności
  const { width } = useWindowDimensions();

  // ZMIANA: Obliczenie liczby kolumn dla siatki
  const numColumns = width < 768 ? 1 : width < 1024 ? 2 : 3;

  // ZMIANA: Usunięto exportContentRef, jest już niepotrzebny

  // --- LOGIKA OBSŁUGI SEKCJI (Bez zmian) ---
  const handleAddSection = () => {
    setFiles((prevFiles) => {
      const newId =
          prevFiles.length > 0 ? Math.max(...prevFiles.map((f) => f.id)) + 1 : 0;
      const newIndex = prevFiles.length;
      return [...prevFiles, createNewFileEntry(newId, newIndex)];
    });
  };

  const handleRemoveSection = () => {
    setFiles((prevFiles) => {
      if (prevFiles.length > 0) {
        const updatedFiles = prevFiles.slice(0, -1).map((f, index) => ({
          ...f,
          groupName: f.groupName.startsWith('Grupa ')
              ? `Grupa ${index + 1}`
              : f.groupName,
        }));
        return updatedFiles;
      }
      return prevFiles;
    });
  };

  const handleGroupNameChange = useCallback((newName: string, index: number) => {
    setFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      newFiles[index] = {
        ...newFiles[index],
        groupName: newName,
      };
      return newFiles;
    });
  }, []);

  // --- LOGIKA OBSŁUGI DANYCH (Bez zmian) ---
  const handleFilesLoaded = useCallback(
      (dataArray: ProfilerFile[], fileNames: string[], index: number) => {
        setFiles((prevFiles) => {
          const newFiles = [...prevFiles];
          const fileStats: FileStats[] = dataArray.map((data, i) => {
            const totals = aggregateCommitTimes(data);
            return {
              fileName: fileNames[i],
              totalDuration: totals.totalDuration || 0,
              commitCount: totals.commitCount,
            };
          });
          const averageSummary = calculateAverageTimes(dataArray);
          newFiles[index] = {
            ...newFiles[index],
            fileNames: fileNames,
            profilerDataArray: dataArray,
            averageSummary: averageSummary,
            loadingError: null,
            fileStats: fileStats,
          };
          return newFiles;
        });
      },
      []
  );

  const handleError = useCallback((message: string, index: number) => {
    setFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      newFiles[index] = {
        ...newFiles[index],
        loadingError: message,
        fileNames: [],
        profilerDataArray: [],
        averageSummary: null,
        fileStats: [],
      };
      return newFiles;
    });
  }, []);

  useEffect(() => {
    if (files.length === 0) {
      handleAddSection();
    }
  }, [files.length]);

  // [!code focus: 60]
  // --- KRYTYCZNA ZMIANA: Logika Eksportu PDF ---
  const handleExportPdf = async () => {
    const validFiles = files.filter(
        (f) =>
            f.averageSummary &&
            f.averageSummary.totalDuration &&
            f.averageSummary.totalDuration > 0
    );

    if (validFiles.length === 0) {
      Alert.alert('Brak danych', 'Brak danych do eksportu.');
      return;
    }

    // ZMIANA: Generujemy string HTML, a nie screenshot
    let summaryHtml = `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            h1 { color: #1f2937; }
            h2 { color: #4f46e5; border-bottom: 2px solid #ddd; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f9fafb; }
            .total { font-weight: bold; color: #3b82f6; }
            .layout { color: #f59e0b; }
            .passive { color: #10b981; }
          </style>
        </head>
        <body>
          <h1>Podsumowanie Analizy Czasów Commitów</h1>
    `;

    validFiles.forEach((file, index) => {
      const avg = file.averageSummary!;
      summaryHtml += `
        <h2>Sekcja ${index + 1}: ${file.groupName} (${file.fileNames.length
      } pomiarów)</h2>
        <table>
          <thead>
            <tr><th>Metryka</th><th>Średni Czas</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Średnia Total Duration</td>
              <td class="total">${avg.totalDuration?.toFixed(2) || '0.00'} ms</td>
            </tr>
            <tr>
              <td>Średnia Layout Effects</td>
              <td class="layout">${avg.totalEffectDuration?.toFixed(2) || '0.00'
      } ms</td>
            </tr>
            <tr>
              <td>Średnia Passive Effects</td>
              <td class="passive">${avg.totalPassiveEffectDuration?.toFixed(2) || '0.00'
      } ms</td>
            </tr>
          </tbody>
        </table>
      `;
    });

    summaryHtml += '</body></html>';

    try {
      // Używamy Expo Print do wygenerowania PDF z HTML
      await Print.printAsync({
        html: summaryHtml,
      });
    } catch (error) {
      console.error('Błąd generowania PDF:', error);
      Alert.alert(
          'Błąd PDF',
          'Wystąpił błąd podczas generowania pliku PDF.'
      );
    }
  };

  // ZMIANA: To jest funkcja, która będzie renderować każdą sekcję w FlatList
  const renderSection = ({
                           item: fileEntry,
                           index,
                         }: {
    item: FileCommitData;
    index: number;
  }) => {
    // [!code focus: 100]
    // ZMIANA: Style dla siatki muszą być tu, aby 'numColumns' działało poprawnie
    // Musimy dynamicznie ustawić szerokość, aby pasowała do liczby kolumn
    const itemWidth =
        numColumns > 1
            ? `${(100 / numColumns).toFixed(2)}%`
            : '100%';
    const itemPadding = numColumns > 1 ? 12 : 0; // Dodaj odstęp (gap)

    return (
        <View
            style={[
              appStyles.sectionWrapper,
              { width: itemWidth, paddingHorizontal: itemPadding },
            ]}
        >
          <View style={appStyles.sectionContent}>
            {/* Input Nazwy Grupy */}
            <GroupNameInput
                index={index}
                initialName={fileEntry.groupName}
                onNameChange={handleGroupNameChange}
            />

            {/* Input pliku */}
            <JsonFileInput
                index={index}
                onFilesLoaded={handleFilesLoaded}
                onError={handleError}
            />

            {/* Wyświetlanie stanu i wyników */}
            <View style={appStyles.summaryWrapper}>
              <Text style={appStyles.summaryTitle}>Podsumowanie</Text>

              {fileEntry.loadingError && (
                  <Text style={appStyles.errorText}>
                    ❌ Błąd wczytywania: {fileEntry.loadingError}
                  </Text>
              )}

              {fileEntry.fileNames.length > 0 && !fileEntry.loadingError && (
                  <View style={appStyles.loadedInfo}>
                    <Text style={{ fontWeight: 'bold' }}>
                      ✅ Wczytano: {fileEntry.fileNames.length} pomiar(y).
                    </Text>
                    {/* ZMIANA: <details> nie istnieje, używamy prostego tekstu */}
                    {fileEntry.fileStats.map((stats, i) => (
                        <View key={i} style={appStyles.fileStatRow}>
                          <Text style={appStyles.fileStatName} numberOfLines={1}>
                            {stats.fileName}:
                          </Text>
                          <View style={appStyles.fileStatMetrics}>
                            <Text style={appStyles.fileStatCommits}>
                              {stats.commitCount} commity
                            </Text>
                            <Text style={appStyles.fileStatSeparator}> / </Text>
                            <Text style={appStyles.fileStatDuration}>
                              {stats.totalDuration.toFixed(2)} ms (Total)
                            </Text>
                          </View>
                        </View>
                    ))}
                  </View>
              )}

              {fileEntry.averageSummary && (
                  <>
                    <View style={appStyles.avgTable}>
                      <Text>
                        <Text style={appStyles.avgLabelTotal}>
                          Średnia Total Duration:{' '}
                        </Text>
                        <Text style={{ fontWeight: 'bold' }}>
                          {fileEntry.averageSummary.totalDuration?.toFixed(2) ||
                              '0.00'}{' '}
                          ms
                        </Text>
                      </Text>
                      <Text>
                        <Text style={appStyles.avgLabelLayout}>
                          Średnia Layout Effects:{' '}
                        </Text>
                        <Text style={{ fontWeight: 'bold' }}>
                          {fileEntry.averageSummary.totalEffectDuration?.toFixed(2) ||
                              '0.00'}{' '}
                          ms
                        </Text>
                      </Text>
                      <Text>
                        <Text style={appStyles.avgLabelPassive}>
                          Średnia Passive Effects:{' '}
                        </Text>
                        <Text style={{ fontWeight: 'bold' }}>
                          {fileEntry.averageSummary.totalPassiveEffectDuration?.toFixed(
                              2
                          ) || '0.00'}{' '}
                          ms
                        </Text>
                      </Text>
                    </View>

                    <CommitTimeChart
                        data={fileEntry.averageSummary}
                        title={`Wykres dla: ${fileEntry.groupName}`}
                    />
                  </>
              )}
            </View>
          </View>
        </View>
    );
  };

  const isDisabled = files.length <= 1;
  const isExportDisabled =
      files.filter(
          (f) =>
              f.averageSummary &&
              f.averageSummary.totalDuration &&
              f.averageSummary.totalDuration > 0
      ).length === 0;

  // ZMIANA: Cały JSX przepisany na View/Text/Pressable
  return (
      <ScrollView style={appStyles.container}>
        <View style={appStyles.header}>
          <Text style={appStyles.headerTitle}>React Profiler Data Analyzer</Text>
          <Text style={appStyles.headerSubtitle}>
            Porównanie <Text style={{ fontWeight: 'bold' }}>średnich</Text> całkowitych
            czasów commitów z wielu grup plików JSON.
          </Text>
        </View>

        <View style={appStyles.mainContent}>
          {/* Kontrolki */}
          <View style={[
            appStyles.controlsWrapper,
            width < 640 && appStyles.controlsWrapperMobile // ZMIANA: Styl responsywny
          ]}>
            <View style={[
              appStyles.controlsGroup,
              width < 640 && appStyles.controlsGroupMobile
            ]}>
              <Text style={appStyles.controlsTitle}>
                Liczba grup: {files.length}
              </Text>
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
            </View>

            {/* Przycisk Eksportu */}
            <Pressable
                style={[
                  appStyles.button,
                  appStyles.buttonExport,
                  isExportDisabled && appStyles.buttonDisabled,
                  exportHover && !isExportDisabled && appStyles.buttonExportHover,
                ]}
                onPress={handleExportPdf}
                disabled={isExportDisabled}
                onHoverIn={() => setExportHover(true)}
                onHoverOut={() => setExportHover(false)}
            >
              {/* SVG nie jest wspierane natywnie, trzeba użyć react-native-svg lub tekstu */}
              <Text style={appStyles.buttonText}>📤 Eksportuj do PDF</Text>
            </Pressable>
          </View>

          {/* [!code focus: 8] */}
          {/* ZMIANA: Siatka (Grid) zastąpiona przez FlatList */}
          <FlatList
              data={files}
              renderItem={renderSection}
              keyExtractor={(item) => item.id.toString()}
              key={numColumns} // Klucz musi się zmienić, aby FlatList przerysował się ze zmianą liczby kolumn
              numColumns={numColumns}
          />

          {/* KONTROLKA WIDOCZNOŚCI */}
          <View style={appStyles.toggleWrapper}>
            <Pressable
                style={appStyles.toggleButton}
                onPress={() => setShowMeasurementCount(!showMeasurementCount)}
            >
              {/* ZMIANA: Checkbox zastąpiony tekstem/ikoną */}
              <View style={[
                appStyles.checkbox,
                showMeasurementCount && appStyles.checkboxChecked
              ]}>
                {showMeasurementCount && <Text style={appStyles.checkboxCheck}>✓</Text>}
              </View>
              <Text style={appStyles.toggleText}>
                Pokaż/Ukryj liczbę pomiarów na wykresie
              </Text>
            </Pressable>
          </View>

          {/* ZBIORCZY WYKRES PORÓWNAWCZY */}
          <MultiGroupComparisonChart
              files={files}
              showMeasurementCount={showMeasurementCount}
          />
        </View>

        <View style={appStyles.footer}>
          <Text style={appStyles.footerText}>
            MVP: Analiza danych profilera React DevTools. Wszystkie obliczenia po
            stronie klienta.
          </Text>
        </View>
      </ScrollView>
  );
};

// [!code focus]
// ZMIANA: Główny StyleSheet dla komponentu App
const appStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6', // bg-gray-100
    padding: 16,
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    color: '#4b5563',
    marginTop: 4,
  },
  mainContent: {
    // ref={exportContentRef} // Usunięte
  },
  controlsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  controlsWrapperMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  controlsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlsGroupMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    marginBottom: 16,
  },
  controlsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginRight: 16,
  },
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
    backgroundColor: '#22c55e', // bg-green-500
  },
  buttonAddHover: {
    backgroundColor: '#16a34a', // hover:bg-green-600
  },
  buttonRemove: {
    backgroundColor: '#ef4444', // bg-red-500
  },
  buttonRemoveHover: {
    backgroundColor: '#dc2626', // hover:bg-red-600
  },
  buttonExport: {
    backgroundColor: '#4f46e5', // bg-indigo-600
  },
  buttonExportHover: {
    backgroundColor: '#4338ca', // hover:bg-indigo-700
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af', // bg-gray-400
    opacity: 0.7,
  },
  // Style dla siatki (FlatList)
  sectionWrapper: {
    marginBottom: 24, // Odstęp (gap)
    minHeight: 1, // Potrzebne dla FlatList na webie
  },
  sectionContent: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 4,
    borderTopWidth: 4,
    borderTopColor: '#a855f7', // border-violet-500
  },
  summaryWrapper: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginBottom: 8,
  },
  errorText: {
    color: '#dc2626',
    fontWeight: '500',
  },
  loadedInfo: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  fileStatRow: {
    fontFamily: 'monospace', // font-mono
    color: '#374151',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  fileStatName: {
    fontWeight: 'bold',
    flex: 1,
  },
  fileStatMetrics: {
    flexDirection: 'row',
    flexShrink: 0,
  },
  fileStatCommits: {
    fontSize: 12,
    color: '#1d4ed8',
  },
  fileStatSeparator: {
    fontSize: 12,
    color: '#6b7280',
    marginHorizontal: 4,
  },
  fileStatDuration: {
    fontSize: 12,
    color: '#8b5cf6',
  },
  avgTable: {
    fontSize: 14,
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
  },
  avgLabelTotal: {
    fontWeight: '600',
    color: '#1d4ed8',
  },
  avgLabelLayout: {
    fontWeight: '600',
    color: '#d97706',
  },
  avgLabelPassive: {
    fontWeight: '600',
    color: '#059669',
  },
  toggleWrapper: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  checkboxCheck: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  toggleText: {
    color: '#374151',
    fontWeight: '500',
  },
  footer: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#d1d5db',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default App;
