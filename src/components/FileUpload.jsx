import React, { useState } from "react";
import * as XLSX from "xlsx";

function ExcelReader() {
  const [inboundColumnValues, setInboundColumnValues] = useState([]);
  const [outboundColumnValues, setOutboundColumnValues] = useState([]);
  const [inboundObjectNames, setInboundObjectNames] = useState([]);
  const [outboundObjectNames, setOutboundObjectNames] = useState([]);
  const [groupedInboundData, setGroupedInboundData] = useState({});
  const [groupedOutboundData, setGroupedOutboundData] = useState({});

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;

        // Parse the file as an Excel workbook
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        // Check if the workbook has at least three sheets
        if (workbook.SheetNames.length >= 3) {
          // Access the second sheet (inbound)
          const inboundSheetName = workbook.SheetNames[1];
          const inboundSheet = workbook.Sheets[inboundSheetName];
          const inboundJsonData = processSheet(inboundSheet);
          const inboundValues = extractColumnValues(
            inboundJsonData,
            "Force24: Display Name"
          );
          const inboundObjects = extractColumnValues(
            inboundJsonData,
            "API Object Name"
          );
          setInboundColumnValues(inboundValues);
          setInboundObjectNames(inboundObjects);
          setGroupedInboundData(
            groupFieldsByObject(inboundValues, inboundObjects)
          );

          // Access the third sheet (outbound)
          const outboundSheetName = workbook.SheetNames[2];
          const outboundSheet = workbook.Sheets[outboundSheetName];
          const outboundJsonData = processSheet(outboundSheet);
          const outboundValues = extractColumnValues(
            outboundJsonData,
            "Display Name"
          );
          const outboundObjects = extractColumnValues(
            outboundJsonData,
            "API Object Name"
          );
          setOutboundColumnValues(outboundValues);
          setOutboundObjectNames(outboundObjects);
          setGroupedOutboundData(
            groupFieldsByObject(outboundValues, outboundObjects)
          );
        } else {
          alert("The uploaded file must contain at least three sheets.");
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
    return data
      .map((row) => row[columnName])
      .filter((value) => value !== null && value !== "Custom Fields"); // Remove null/undefined values
  };

  const groupFieldsByObject = (fields, objects) => {
    const groupedData = {};
    let activeObject = null;

    fields.forEach((field, index) => {
      const currentObject = objects[index];
      if (!groupedData[currentObject]) {
        groupedData[currentObject] = [];
      }
      groupedData[currentObject].push(field);
    });

    return groupedData;
  };

  const displayData = (data) => {
    return Object.keys(data).map((obj) => (
      <div key={obj}>
        <h3 style={{marginVertical: "20px"}}>{obj}</h3>
        {data[obj].map((field, index) => (
          <p key={index}>{field}</p>
        ))}
      </div>
    ));
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          padding: "20px",
        }}
      >
        <div>
          <h2>Inbound Fields:</h2>
          {Object.keys(groupedInboundData).length > 0 ? (
            displayData(groupedInboundData)
          ) : (
            <p>No inbound data</p>
          )}
        </div>
        <div>
          <h2>Outbound Fields:</h2>
          {Object.keys(groupedOutboundData).length > 0 ? (
            displayData(groupedOutboundData)
          ) : (
            <p>No outbound data</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExcelReader;
