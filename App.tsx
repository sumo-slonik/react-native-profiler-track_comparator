import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { useProfilerFiles } from './hooks/useProfilerFiles'; // Importujemy nasz nowy hook
import MultiGroupComparisonChart from './components/MultiGroupComparisonChart';
import MeasurementSection from './components/MeasurementSection';
import MeasurementToggle from './components/MeasurementToggle';
import DashboardControls from './components/DashboardControls';

const App: React.FC = () => {
  const {
    files,
    addSection,
    removeSection,
    updateGroupName,
    processLoadedFiles,
    reportError,
  } = useProfilerFiles();

  const [showMeasurementCount, setShowMeasurementCount] = useState(true);
  const { width } = useWindowDimensions();

  const numColumns = width < 768 ? 1 : width < 1024 ? 2 : 3;
  const isDisabled = files.length <= 1;

  return (
      <ScrollView style={appStyles.container}>
        <View style={appStyles.header}>
          <Text style={appStyles.headerTitle}>React Profiler Trace Analyzer</Text>
          <Text style={appStyles.headerSubtitle}>
            Narzędzie do analizy i porównywania wydajności renderowania
          </Text>
        </View>

        <View style={appStyles.mainContent}>
          <DashboardControls
              count={files.length}
              onAdd={addSection}
              onRemove={removeSection}
              isRemoveDisabled={isDisabled}
          />

          <FlatList
              data={files}
              renderItem={({ item, index }) => (
                  <MeasurementSection
                      item={item}
                      index={index}
                      numColumns={numColumns}
                      onGroupNameChange={updateGroupName}
                      onFilesLoaded={processLoadedFiles}
                      onError={reportError}
                  />
              )}
              keyExtractor={(item) => item.id.toString()}
              key={numColumns}
              numColumns={numColumns}
              scrollEnabled={false}
          />

          <MeasurementToggle
              checked={showMeasurementCount}
              onToggle={setShowMeasurementCount}
          />

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

const appStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
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
    marginBottom: 16,
  },
  footer: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#d1d5db',
    alignItems: 'center',
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default App;
