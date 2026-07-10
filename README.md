# Stock & Invoice Management System

A high-performance, responsive, and secure Progressive Web Application (PWA) designed for retail mobile outlets to streamline tax invoicing (GST), finance configurations, and sales metrics tracking. 

Built as an asynchronous Single Page Application (SPA), it interfaces directly with Google Apps Script as a secure serverless backend API, utilizing Google Sheets as a relational datastore without synchronous runtime blockage.

### 🌐 [Live Production Dashboard](https://simsystem.netlify.app/)

#### 🔐 Demo Credentials
*   **System ID:** `admin`
*   **Passcode / Password:** `admin`

---

## 🚀 Key Features

### ⚡ Performance Optimization
*   **Asynchronous Hydration:** Serves a lightweight HTML structural skeleton immediately to bypass cloud sandbox latency bottlenecks. Hydrates application metrics asynchronously via a background task loader.
*   **API Batch Writing:** Replaced individual disjointed column cells writes (`setValue`) with aggregated two-dimensional matrix injections (`setValues`), decreasing server execution payload overhead by over 75%.
*   **Document Fragments rendering:** Reduces browser rendering reflows by compiling data arrays in memory via `DocumentFragment` before writing them to the active viewport layout table grid.

### 📊 Financial & Inventory Architecture
*   **Reverse GST Engine:** Automatically deduces item base values and dual-tier components (CGST 9% & SGST 9%) on the fly using a continuous event listener bound to the total gross pricing entry input.
*   **Dynamic Indian Currency Linguistic Converter:** Natively processes floating integers into standardized Indian Rupee textual descriptions (e.g., `Rupees Twenty-Four Thousand Five Hundred Only`) saved synchronously across print templates.
*   **Strict Structural Constraints:** Includes drop-down selectors containing specific hardware variations (e.g., `8+128 GB`, `12+256 GB`, `16+1 TB`) to maintain input data integrity.
*   **Automatic Text Normalization:** Built-in string formatting converts inputs (Customer Name, Brand Name, Finance Company) to *Title Case* prior to database row append tasks.

### 📈 Analytics & Reporting Utilities
*   **Dynamic Sales Metrics (KPIs):** Real-time tally indicators tracker calculating Gross Turnover volumes, Distributed Volume Units, and Finance-assisted transaction indexes.
*   **Time-Series Analytical Visualizations:** Generates an inline timeline performance infographic utilizing `Chart.js` matching data array sets.
*   **Expanded Date Scoping Filters:** Supports immediate dashboard sorting and infographic adjustments by Today, Month, Year, or custom Date Range picker brackets.
*   **One-Click Excel Exporter:** Leverages the `SheetJS (XLSX)` abstraction framework to extract actively filtered viewport datagrids into fully formatted `.xlsx` accounting records containing exact compliance columns (`Date`, `Customer Name`, `GSTIN`, `Amount`, `CGST`, `SGST`, `Total Amount`).

### 📲 Instant Communication & Deliverability
*   **Text-Based WhatsApp Receipt Scraping:** Automatically processes row data records to construct clean, itemized digital receipts with pre-encoded WhatsApp API messaging strings (`https://wa.me/`).
*   **On-the-Fly PDF Compilation:** Leverages Google Sheets API hooks to dynamically render cell grids inside explicit print templates, converting files to public sharing endpoints inside short background execution frames.

---

## 🛠️ System Stack

*   **Frontend User Interface:** HTML5, CSS3, Bootstrap 5.3 (Premium Inter Typography), Bootstrap Icons.
*   **Data Vis & Processing:** Chart.js, SheetJS (XLSX Engine).
*   **Application Model Context:** Progressive Web App (PWA Service Workers enabled for client-side offline cache states fallback protection).
*   **Serverless Cloud Backend:** Google Apps Script (GAS Ecosystem running standalone `doGet(e)` & `doPost(e)` handlers).
*   **Core Relational Datastore:** Google Sheets Engine (Data Matrix Structure).

---

## 📂 Project Repository Structure

```text
├── Index.html          # Responsive SPA Frontend Interface (Includes core UI logic)
├── Code.gs             # Google Apps Script Serverless Backend Engine File
└── README.md           # Repository Technical Documentation
