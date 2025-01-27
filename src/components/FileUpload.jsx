import React, { useState } from "react";
import * as XLSX from "xlsx";
import ObjectCard from "./ObjectCard";

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
    return data.map((row) => row[columnName]); // Do not filter out any values here
  };

  const groupFieldsByObject = (fields, objects) => {
    const groupedData = {};
    let activeObject = null;

    // Group fields by their corresponding objects
    fields.forEach((field, index) => {
      const currentObject = objects[index];
      if (objects[index] === null) {
        return;
      }
      // Initialise array for new objects
      if (!groupedData[currentObject]) {
        groupedData[currentObject] = [];
      }

      // Add field to the corresponding object group
      groupedData[currentObject].push(field);

      // Update active object for reference
      activeObject = currentObject;
    });

    // Remove unwanted values (null, undefined, "Custom Fields") after grouping
    Object.keys(groupedData).forEach((objectName) => {
      groupedData[objectName] = groupedData[objectName].filter(
        (field) => field && field !== "Custom Fields"
      );
    });

    return groupedData;
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
      <div>
          <h2>Inbound Fields:</h2>
        <div className="obj-container">
          {Object.keys(groupedInboundData).length > 0 ? (
            Object.keys(groupedInboundData).map((obj) => (
              <ObjectCard object={obj} fields={groupedInboundData[obj]} />
            ))
          ) : (
            <p>No inbound data</p>
          )}
        </div>
          <h2>Outbound Fields:</h2>
        <div className="obj-container">
          {Object.keys(groupedOutboundData).length > 0 ? (
            Object.keys(groupedOutboundData).map((obj) => (
              <ObjectCard object={obj} fields={groupedOutboundData[obj]} />
            ))
          ) : (
            <p>No outbound data</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExcelReader;
