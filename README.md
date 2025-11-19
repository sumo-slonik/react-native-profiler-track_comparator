# React Profiler Trace Analyzer

**React Profiler Trace Analyzer** is a client-side tool designed to visualize, analyze, and compare performance profiles exported from the **React Developer Tools Profiler**.

It helps developers identify performance bottlenecks by aggregating commit times, breaking down costs per component, and comparing different profiling sessions (e.g., "Before" vs. "After" optimization).

### 🔗 **Live Demo:** [https://sumo-slonik.github.io/react-native-profiler-track_comparator/](https://sumo-slonik.github.io/react-native-profiler-track_comparator/)

---

## 🚀 Key Features

* **📊 Multi-File Averaging:** You can load **multiple JSON trace files** into a single Group (Section). The tool automatically calculates the **average** duration across all loaded files, helping you smooth out noise and get statistically significant data.
* **📈 Visualizations:** Stacked bar charts showing the breakdown of **Render**, **Layout Effects**, and **Passive Effects** durations.
* **🔬 Two Analysis Modes:**
    * **Total Commit:** High-level view of how long commits took on average.
    * **Component Level:** Deep dive into specific components to see which ones are the heaviest.
* **🏆 Component Rankings:** Automatically identifies the "Top 5" slowest components in each group.
* **🆚 Baseline Comparison:** Mark one group as a "Baseline" to see calculating differences (in ms and %) for other groups. Color-coded indicators show regression (Red) or improvement (Green).
* **⚡ Client-Side Only:** All processing happens in your browser. Your profiling data is never uploaded to any server.

---

## 📖 How to Use

### 1. Exporting Trace Data
1.  Open your React application.
2.  Open **React Developer Tools** in your browser (F12) or standalone debugger.
3.  Go to the **Profiler** tab.
4.  Record a session (click the circle button, perform actions, stop recording).
5.  Click the **Save Profile** button (download icon) to save the `.json` file.
6.  *Tip: Repeat this process a few times to get multiple samples for better accuracy.*

### 2. Loading Data
1.  Open the [Live Tool](https://sumo-slonik.github.io/react-native-profiler-track_comparator/).
2.  You will see an empty **Group**. You can rename it (e.g., "Version 1.0").
3.  **Paste the content** of your JSON file into the input.
4.  **💡 Pro Tip:** You can send **multiple files** into the same input field. The tool will process all of them and display the **average metrics** for that group.
5.  Click **"Add Section"** to create a new group for comparison (e.g., "Version 1.1").

### 3. Analysis Modes

Use the menu at the top to switch between modes:

#### 🅰️ Mode: Total Commit
This mode focuses on the overall performance of the React Commit phase.
* **Stacked Chart:** Visualizes the average time spent in Render, Layout Effects, and Passive Effects.
* **Comparison Table:** Shows the average total duration per commit for each group.

#### 🅱️ Mode: Component Level
This mode focuses on individual React components (Fibers).
* **Select Component:** Use the search-enabled dropdown to pick a specific component (e.g., `View`, `Button`, `MyList`).
* **Metric Selection:**
    * **Actual Duration:** The time spent rendering the component *and* its children.
    * **Self Duration:** The time spent rendering *only* the component itself (excluding children).
* **Ranking:** Each group card displays the Top 5 slowest components according to the selected metric.
* **Comparison:** The table at the bottom compares the specific selected component across all groups.

### 4. Comparing Results (Baseline)
In the **Comparison Table** (at the bottom of the page):
1.  Click the **Radio Button** in the "Baseline" column next to the group you want to treat as the standard (e.g., "Before Fix").
2.  The other rows will now show a **Difference** column:
    * <span style="color: green">**Green:**</span> The duration decreased (Performance Improvement).
    * <span style="color: red">**Red:**</span> The duration increased (Regression).

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
