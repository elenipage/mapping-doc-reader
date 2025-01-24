import React, { useState } from "react";
import * as XLSX from "xlsx";

function ExcelReader() {
  const [inboundColumnValues, setInboundColumnValues] = useState([]);
  const [outboundColumnValues, setOutboundColumnValues] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;

        // Parse the file as an Excel workbook
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        // Check if the workbook has at least two sheets
        if (workbook.SheetNames.length >= 2) {
          // Read the second sheet (inbound)
          const inboundSheetName = workbook.SheetNames[1];
          const inboundSheet = workbook.Sheets[inboundSheetName];
          const inboundJsonData = processSheet(inboundSheet);
          const uniqueInboundValues = extractColumnValues(
            inboundJsonData,
            "Force24: Display Name"
          );
          setInboundColumnValues(uniqueInboundValues);

          // Read the third sheet (outbound)
          const outboundSheetName = workbook.SheetNames[2];
          const outboundSheet = workbook.Sheets[outboundSheetName];
          const outboundJsonData = processSheet(outboundSheet);
          const uniqueOutboundValues = extractColumnValues(
            outboundJsonData,
            "Display Name"
          );
          setOutboundColumnValues(uniqueOutboundValues);
        } else {
          alert("The uploaded file must contain at least two sheets.");
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const processSheet = (sheet) => {
    const jsonData = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
    });

    // Exclude the first row and use the second row as headers
    const headers = jsonData[1];
    const rows = jsonData.slice(2); // Skip the first and header rows
    return rows.map((row) => {
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = row[index] || null;
      });
      return rowData;
    });
  };

  const extractColumnValues = (data, columnName) => {
    return Array.from(
      new Set(
        data.map((row) => row[columnName]).filter((value) => value !== null) // Remove null/undefined values
      )
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Mapping Doc Reader</h1>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        style={{ marginBottom: "20px" }}
      />
      <h2>Field Names</h2>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div>
          <h3>Inbound:</h3>
          {inboundColumnValues
            ? inboundColumnValues.map((field, index) => {
                return <p key={index}>{field}</p>;
              })
            : null}
        </div>
        <div>
          <h3>Outbound:</h3>
          {outboundColumnValues
            ? outboundColumnValues.map((field, index) => {
                return <p key={index}>{field}</p>;
              })
            : null}
        </div>
      </div>
    </div>
  );
}

export default ExcelReader;
