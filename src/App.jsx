// Author@VanshSinghal

import React, { useState } from "react";
import "./App.css";
import Start from "./components/Startingpage";
import DataPage from "./components/DataPage";

const App = () => {
  const [showData, setShowData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState("");

  function load(e) {
    setLoading(e);
  }
  function show_data(result) {
    setData(result);
    setShowData(true);
  }

  return (
    <>
      {loading ? (
        <div className="loading">
          <h4>Generating Report</h4>
          <p>Please wait...</p>
        </div>
      ) : showData ? (
        <DataPage data={data} load={load} show_data={show_data} />
      ) : (
        <Start load={load} show_data={show_data} />
      )}
    </>
  );
};

export default App;
