var SYSTEM_USER_ID = "admin";
var PORTAL_PASSCODE = "admin"; 
// TARGET SYSTEM INVOICE ARCHIVE STORAGE DIRECTORY IDENTIFIER
var TARGET_FOLDER_ID = "1FZfs5FPpC5p9u0AhnUCo55PqiWDib-Pq";

function doGet(e) {
  var action = e.parameter.action;
  var clientPasscode = e.parameter.passcode;
  var result;
  
  if (clientPasscode !== PORTAL_PASSCODE) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Invalid Password Access Denied." })).setMimeType(ContentService.MimeType.JSON);
  }
  
  try {
    if (action == "getDatabaseData") { result = { status: "success", data: getDatabaseData() }; } 
    else if (action == "getStockData") { result = { status: "success", data: getStockData() }; }
    else if (action == "getNextInvoiceNumber") { result = { status: "success", data: getNextInvoiceNumber() }; } 
    else if (action == "getAggregateDashboardMetrics") {
      result = { status: "success", data: { invoices: getDatabaseData(), stock: getStockData() } };
    }
    else { result = { status: "error", message: "Invalid GET action" }; }
  } catch (err) { result = { status: "error", message: err.toString() }; }
  
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var postData = JSON.parse(e.postData.contents);
  var action = postData.action;
  var clientPasscode = postData.passcode;
  var result;
  
  if (clientPasscode !== PORTAL_PASSCODE) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Invalid Password Access Denied." })).setMimeType(ContentService.MimeType.JSON);
  }
  
  try {
    if (action == "saveOrUpdateInvoice") { result = { status: "success", message: saveOrUpdateInvoice(postData.data) }; } 
    else if (action == "saveStock") { result = { status: "success", message: saveStock(postData.data) }; }
    else if (action == "deleteInvoice") { result = { status: "success", message: deleteInvoice(postData.invoiceNo) }; } 
    else if (action == "deleteStock") { result = { status: "success", message: deleteStock(postData.stockId) }; }
    else if (action == "generateInvoicePDF") { result = { status: "success", url: generateInvoicePDF(postData.invoiceNo) }; } 
    else { result = { status: "error", message: "Invalid POST action" }; }
  } catch (err) { result = { status: "error", message: err.toString() }; }
  
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function getDatabaseData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dbSheet = ss.getSheetByName("Database");
  if (!dbSheet) return [];
  var data = dbSheet.getDataRange().getValues();
  var invoices = [];
  var timeZone = Session.getScriptTimeZone();
  for (var i = 2; i < data.length; i++) {
    var row = data[i];
    if (row[0]) {
      var formattedDate = "";
      if (row[4]) { try { formattedDate = Utilities.formatDate(new Date(row[4]), timeZone, "yyyy-MM-dd"); } catch(e) { formattedDate = row[4].toString(); } }
      invoices.push({
        invoiceNo: row[0].toString(), name: row[1].toString(), mobile: row[2].toString(),
        address: row[3].toString(), date: formattedDate, gstin: row[5] ? row[5].toString() : "",
        brand: row[6].toString().toUpperCase(), model: row[7].toString().toUpperCase(), variant: row[8].toString(),
        quantity: row[9].toString(), imei: row[10].toString().toUpperCase(), hsn: row[11].toString(),
        color: row[12].toString().toUpperCase(), amount: row[13].toString(), cgst: row[14].toString(),
        sgst: row[15].toString(), total: row[16].toString(), financeCompany: row[17].toString(),
        loanNo: row[18].toString(), downPayment: row[19].toString(), emiAmount: row[20].toString(),
        emiTenure: row[21].toString(), tvsLoan: row[22] ? row[22].toString() : ""
      });
    }
  }
  return invoices.reverse(); 
}

function getStockData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var stockSheet = ss.getSheetByName("Stock");
  if (!stockSheet) return [];
  var data = stockSheet.getDataRange().getValues();
  var items = [];
  var timeZone = Session.getScriptTimeZone();
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[1] || row[2] || row[5]) { 
      var formattedDate = "";
      if (row[0]) { try { formattedDate = Utilities.formatDate(new Date(row[0]), timeZone, "yyyy-MM-dd"); } catch(e) { formattedDate = row[0].toString(); } }
      items.push({
        stockId: i + 1, date: formattedDate, brand: row[1].toString().toUpperCase(), model: row[2].toString().toUpperCase(),
        variant: row[3].toString(), quantity: row[4].toString(), imei: row[5].toString().toUpperCase(), hsn: row[6].toString().toUpperCase(),
        color: row[7].toString().toUpperCase(), amount: row[8].toString(), cgst: row[9].toString(), sgst: row[10].toString(),
        total: row[11].toString(), status: row[12] ? row[12].toString().toUpperCase() : "AVAILABLE"
      });
    }
  }
  return items.reverse();
}

function getNextInvoiceNumber() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dbSheet = ss.getSheetByName("Database");
  var data = dbSheet.getDataRange().getValues();
  var maxId = 0;
  for (var i = 2; i < data.length; i++) {
    var id = parseInt(data[i][0], 10);
    if (!isNaN(id) && id > maxId) { maxId = id; }
  }
  return maxId === 0 ? 1041 : maxId + 1;
}

function saveOrUpdateInvoice(inv) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dbSheet = ss.getSheetByName("Database");
  var data = dbSheet.getDataRange().getValues();
  var rowIndex = -1;
  for (var i = 2; i < data.length; i++) { if (data[i][0] == inv.invoiceNo) { rowIndex = i + 1; break; } }
  var rowValues = [
    inv.invoiceNo, inv.name, inv.mobile, inv.address, inv.date, inv.gstin,
    inv.brand.toUpperCase(), inv.model.toUpperCase(), inv.variant, inv.quantity, inv.imei.toUpperCase(), inv.hsn, inv.color.toUpperCase(),
    parseFloat(inv.amount || 0), parseFloat(inv.cgst || 0), parseFloat(inv.sgst || 0), parseFloat(inv.total || 0),
    inv.financeCompany, inv.loanNo, inv.downPayment, inv.emiAmount, inv.emiTenure, inv.tvsLoan 
  ];
  if (rowIndex !== -1) { dbSheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]); } 
  else { dbSheet.appendRow(rowValues); }
  reconcileStockItemStatuses();
  return "Invoice processed successfully.";
}

function saveStock(stk) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var stockSheet = ss.getSheetByName("Stock");
  var rowValues = [
    stk.date, stk.brand.toUpperCase(), stk.model.toUpperCase(), stk.variant, parseInt(stk.quantity || 1, 10),
    stk.imei.toUpperCase(), stk.hsn.toUpperCase(), stk.color.toUpperCase(), parseFloat(stk.amount || 0),
    parseFloat(stk.cgst || 0), parseFloat(stk.sgst || 0), parseFloat(stk.total || 0), stk.status ? stk.status.toUpperCase() : "AVAILABLE"
  ];
  if (stk.stockId && parseInt(stk.stockId, 10) > 1) { stockSheet.getRange(parseInt(stk.stockId, 10), 1, 1, rowValues.length).setValues([rowValues]); } 
  else { stockSheet.appendRow(rowValues); }
  reconcileStockItemStatuses();
  return "Stock profile configuration processed.";
}

function reconcileStockItemStatuses() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dbSheet = ss.getSheetByName("Database");
  var stockSheet = ss.getSheetByName("Stock");
  if (!dbSheet || !stockSheet) return;
  var salesData = dbSheet.getDataRange().getValues();
  var stockData = stockSheet.getDataRange().getValues();
  var soldImeis = {};
  for (var i = 2; i < salesData.length; i++) { if (salesData[i][10]) { soldImeis[salesData[i][10].toString().trim().toUpperCase()] = true; } }
  for (var j = 1; j < stockData.length; j++) {
    var stockImei = stockData[j][5] ? stockData[j][5].toString().trim().toUpperCase() : "";
    if (stockImei) {
      var currentStatus = soldImeis[stockImei] ? "SOLD" : "AVAILABLE";
      stockSheet.getRange(j + 1, 13).setValue(currentStatus);
    }
  }
}

function deleteInvoice(invoiceNo) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dbSheet = ss.getSheetByName("Database");
  var data = dbSheet.getDataRange().getValues();
  for (var i = 2; i < data.length; i++) {
    if (data[i][0] == invoiceNo) {
      dbSheet.deleteRow(i + 1);
      reconcileStockItemStatuses();
      return "Invoice #" + invoiceNo + " purged.";
    }
  }
  return "Invoice target missing.";
}

function deleteStock(rowId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var stockSheet = ss.getSheetByName("Stock");
  stockSheet.deleteRow(parseInt(rowId, 10));
  return "Item removed from inventory.";
}

function numberToWordsIndian(amount) {
  amount = Math.round(Number(amount));
  if (isNaN(amount) || amount === 0) return "Rupees Zero Only";
  var ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  var tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  function convert(num) {
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
    if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + convert(num % 100) : "");
    if (num < 100000) return convert(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + convert(num % 1000) : "");
    if (num < 10000000) return convert(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + convert(num % 100000) : "");
    return convert(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 ? " " + convert(num % 10000000) : "");
  }
  return "Rupees " + convert(amount) + " Only";
}

function generateInvoicePDF(invoiceNo) {
  // EXECUTE PROACTIVE CLEANUP: Purges document tracking files older than 24 hours
  purgeOldInvoicePDFs();
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dbSheet = ss.getSheetByName("Database");
  var data = dbSheet.getDataRange().getValues();
  var invRow = null;
  
  for (var i = 2; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString() == invoiceNo.toString()) { invRow = data[i]; break; }
  }
  if (!invRow) throw new Error("Invoice record not found.");
  
  var invSheet = ss.getSheetByName("Invoice");
  var timeZone = Session.getScriptTimeZone();
  var printDate = "";
  if (invRow[4]) { try { printDate = Utilities.formatDate(new Date(invRow[4]), timeZone, "dd-MM-yyyy"); } catch(e) { printDate = invRow[4].toString(); } }

  invSheet.getRange("G7").setValue("'" + printDate);
  invSheet.getRange("G8").setValue(invRow[0]);
  invSheet.getRange("G9").setValue(invRow[5]);
  
  invSheet.getRange("B7:B9").setValues([[invRow[1]], [invRow[2]], [invRow[3]]]);
  invSheet.getRange("A16:H16").setValues([[invRow[6], invRow[7], invRow[8], invRow[9], invRow[10], invRow[11], invRow[12], invRow[13]]]);
  invSheet.getRange("H18:H21").setValues([[invRow[13]], [invRow[14]], [invRow[15]], [invRow[16]]]);
  
  var numericGrandTotal = parseFloat(invRow[16] || 0);
  invSheet.getRange("C18").setValue(numberToWordsIndian(numericGrandTotal));
  invSheet.getRange("C26:C30").setValues([[invRow[17]], [invRow[18]], [invRow[19]], [invRow[20]], [invRow[21]]]);
  
  var tvsLoanVal = (invRow[22] || "").toString().trim().toLowerCase();
  invSheet.getRange("A31").setValue(tvsLoanVal === "yes" ? "Hypothecated to TVS CREDIT SERVICES LIMITED" : "");
  
  SpreadsheetApp.flush();
  
  var exportUrl = ss.getUrl().replace(/edit$/, '') + 'export?exportFormat=pdf&format=pdf&size=letter&portrait=true&fitw=true&gridlines=false&top_margin=0.25&bottom_margin=0.25&left_margin=0.25&right_margin=0.25&gid=' + invSheet.getSheetId();
  var response = UrlFetchApp.fetch(exportUrl, { headers: { 'Authorization': 'Bearer ' + ScriptApp.getOAuthToken(), 'MuteHttpExceptions': true } });
  
  // SAVES INVOICE IN CHOSEN DESTINATION FOLDER
  var targetFolder = DriveApp.getFolderById(TARGET_FOLDER_ID);
  var file = targetFolder.createFile(response.getBlob().setName("Invoice_" + invoiceNo + ".pdf"));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

// AUTOMATIC DELETION MODULE: Clears all documents with creation timestamps older than 24 hours
function purgeOldInvoicePDFs() {
  try {
    var targetFolder = DriveApp.getFolderById(TARGET_FOLDER_ID);
    var files = targetFolder.getFiles();
    var cutOffTime = new Date(Date.now() - (24 * 60 * 60 * 1000)); // Current time minus 24 hours
    
    while (files.hasNext()) {
      var file = files.next();
      if (file.getDateCreated() < cutOffTime) {
        file.setTrashed(true);
      }
    }
  } catch (e) {
    Logger.log("Cleanup Engine Error: " + e.toString());
  }
}
