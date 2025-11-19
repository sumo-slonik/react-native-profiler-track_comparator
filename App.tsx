import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { useProfilerFiles } from './hooks/useProfilerFiles';
import MultiGroupComparisonChart from './components/MultiGroupComparisonChart';
import MeasurementSection from './components/MeasurementSection';
import DashboardControls from './components/DashboardControls';
import ComparisonTable from './components/ComparisonTable';
import AnalysisModeMenu, { AnalysisMode, MetricType } from './components/AnalysisModeMenu';
import ComponentAnalysisTable from './components/ComponentAnalysisTable';

const App: React.FC = () => {
  const {
    files,
    addSection,
    removeSection,
    updateGroupName,
    processLoadedFiles,
    reportError,
    clearFiles
  } = useProfilerFiles();

  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('total');
  const [metricType, setMetricType] = useState<MetricType>('actual');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [mainSectionId, setMainSectionId] = useState<number | null>(null);

  const { width } = useWindowDimensions();
  const numColumns = width < 768 ? 1 : width < 1024 ? 2 : 3;
  const isDisabled = files.length <= 1;

  useEffect(() => {
    if (files.length > 0) {
      const currentMainExists = files.some(f => f.id === mainSectionId);
      if (!currentMainExists || mainSectionId === null) {
        setMainSectionId(files[0].id);
      }
    }
  }, [files, mainSectionId]);

  const filteredComponentNames = useMemo(() => {
    const nameSet = new Set<string>();

    files.forEach(file => {
      const mapToCheck = metricType === 'actual'
          ? file.fiberActualDurationsTotal
          : file.fiberSelfDurationsTotal;

      for (const name of mapToCheck.keys()) {
        nameSet.add(name);
      }
    });

    return Array.from(nameSet).sort();
  }, [files, metricType]);

  const handleRemoveLastSection = () => {
    if (files.length > 0) {
      const lastId = files[files.length - 1].id;
      removeSection(lastId);
    }
  };

  return (
      <ScrollView style={appStyles.container}>
        <View style={appStyles.header}>
          <Text style={appStyles.headerTitle}>React Profiler Trace Analyzer</Text>
          <Text style={appStyles.headerSubtitle}>
            Tool for analyzing and comparing render performance
          </Text>
        </View>

        <View style={appStyles.mainContent}>

          <AnalysisModeMenu
              mode={analysisMode}
              onModeChange={setAnalysisMode}
              metricType={metricType}
              onMetricChange={setMetricType}
              selectedComponent={selectedComponent}
              componentList={filteredComponentNames}
              onComponentChange={setSelectedComponent}
          />

          <DashboardControls
              count={files.length}
              onAdd={addSection}
              onRemove={handleRemoveLastSection}
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
                      analysisMode={analysisMode}
                      onRemoveSection={removeSection}
                      onClearFiles={clearFiles}
                      metricType={metricType}
                      isRemovable={files.length > 1}
                  />
              )}
              keyExtractor={(item) => item.id.toString()}
              key={numColumns}
              numColumns={numColumns}
              scrollEnabled={false}
          />

          {analysisMode === 'total' ? (
              <>
                <ComparisonTable
                    files={files}
                    mainSectionId={mainSectionId}
                    onSetMain={setMainSectionId}
                />

                <MultiGroupComparisonChart
                    files={files}
                />
              </>
          ) : (

              <ComponentAnalysisTable
                  files={files}
                  selectedComponent={selectedComponent}
                  metricType={metricType}
                  mainSectionId={mainSectionId}
                  onSetMain={setMainSectionId}
              />
          )}

        </View>

        <View style={appStyles.footer}>
          <Text style={appStyles.footerText}>
            Implemented as part of RnD time at Software Mansion
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
