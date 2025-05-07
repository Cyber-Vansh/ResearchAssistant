import React, { useState } from "react";
import "./DataPage.css";
import { GoogleGenAI } from "@google/genai";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DataPage = ({ data, load, show_data }) => {
  const [input, setInput] = useState(data[1]);

  function handleSearch() {
    if (input.trim()) {
      fetchData(input.trim());
    }
  }

  async function fetchData(x) {
    load(true);

    const prompt = `
      create a data of the startup (name : ${x}) and its 3 competitors, the value should not include units, and all values must be filled,
      Return ONLY valid JSON (no markdown, no explanations), and if any data is missing like funding, number_of_employees, revenue, growth_rate, etc., fill expected values, using this format exactly:
  
      {
      "startup_name": "...",
      "operating_status": "...",
      "description": "...",
      "founded": "...",
      "founders": [
          {
          "name": "...",
          "role": "...",
          "linkedin": "..."
          }
      ],
      "location": {
          "city": "...",
          "state": "...",
          "country": "..."
      },
      "website": "...",
      "industry": "...",
      "funding": [
          {
          "round": "...",
          "amount": "...",
          "investors": ["...", "..."],
          "date": "YYYY-MM-DD"
          }
      ],
      "number_of_employees": ...,
      "social_media": {
          "linkedin": "...",
          "twitter": "..."
      },
      "acquisitions": [
          {
          "company": "...",
          "date": "YYYY-MM-DD"
          }
      ],
      "revenue": "...",
      "growth_rate": "...",
      "contact_info": {
          "email": "...",
          "phone": "..."
      },
      "office_locations": [
          {
          "city": "...",
          "country": "..."
          }
      ],
      "competitors": [
          { ... }, { ... }, { ... }
      ]
      }`;

    const ai = new GoogleGenAI({
      apiKey: "AIzaSyD5gbMhb7AR5XQ-C2vPOWI7O_qUBPpXjbU",
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const raw_data = response.text;
    const cleanedJsonString = raw_data
      .replace(/```json\s*/, "")
      .replace(/```/, "")
      .trim();
    console.log(JSON.parse(cleanedJsonString));
    load(false);
    show_data([JSON.parse(cleanedJsonString), x]);
  }

  const data1 = [
    { name: data[1], Revenue: data[0].revenue / 1000000 },
    {
      name: data[0].competitors[0].startup_name,
      Revenue: data[0].competitors[0].revenue / 1000000,
    },
    {
      name: data[0].competitors[1].startup_name,
      Revenue: data[0].competitors[1].revenue / 1000000,
    },
    {
      name: data[0].competitors[2].startup_name,
      Revenue: data[0].competitors[2].revenue / 1000000,
    },
  ];

  const data2 = [
    { name: data[1], Employees: data[0].number_of_employees },
    {
      name: data[0].competitors[0].startup_name,
      Employees: data[0].competitors[0].number_of_employees,
    },
    {
      name: data[0].competitors[1].startup_name,
      Employees: data[0].competitors[1].number_of_employees,
    },
    {
      name: data[0].competitors[2].startup_name,
      Employees: data[0].competitors[2].number_of_employees,
    },
  ];

  const data3 = [
    {
      name: data[1],
      Funding: data[0].funding.reduce(
        (acc, curr) => acc + curr.amount / 1000000,
        0
      ),
    },
    {
      name: data[0].competitors[0].startup_name,
      Funding:
        data[0].competitors[0].funding.reduce(
          (acc, curr) => acc + curr.amount,
          0
        ) / 1000000,
    },
    {
      name: data[0].competitors[1].startup_name,
      Funding:
        data[0].competitors[1].funding.reduce(
          (acc, curr) => acc + curr.amount,
          0
        ) / 1000000,
    },
    {
      name: data[0].competitors[2].startup_name,
      Funding:
        data[0].competitors[2].funding.reduce(
          (acc, curr) => acc + curr.amount,
          0
        ) / 1000000,
    },
  ];
  const data4 = [
    { name: data[1], GrowthRate: data[0].growth_rate },
    {
      name: data[0].competitors[0].startup_name,
      GrowthRate: data[0].competitors[0].growth_rate,
    },
    {
      name: data[0].competitors[1].startup_name,
      GrowthRate: data[0].competitors[1].growth_rate,
    },
    {
      name: data[0].competitors[2].startup_name,
      GrowthRate: data[0].competitors[2].growth_rate,
    },
  ];

  const getInsights = () => {
    const maxRevenue = data1.reduce((a, b) =>
      (Number(a.Revenue) || 0) >= (Number(b.Revenue) || 0) ? a : b
    );

    const maxUsers = data2.reduce((a, b) =>
      (Number(a.Employees) || 0) >= (Number(b.Employees) || 0) ? a : b
    );

    const maxFunding = data3.reduce((a, b) =>
      (Number(a.Funding) || 0) >= (Number(b.Funding) || 0) ? a : b
    );

    const maxGrowth = data4.reduce((a, b) =>
      (Number(a.GrowthRate) || 0) >= (Number(b.GrowthRate) || 0) ? a : b
    );

    return [
      `Highest revenue of $${maxRevenue.Revenue}M was in ${maxRevenue.name}.`,
      `User growth peaked in ${maxUsers.name} with ${maxUsers.Employees} users.`,
      `Most funding raised in ${maxFunding.name} quarter: $${maxFunding.Funding}M.`,
      `${maxGrowth.name} has the highest growth rate of ${maxGrowth.GrowthRate}%.`,
    ];
  };
  const insights = getInsights();

  const downloadPDF = () => {
    const input = document.querySelector(".report-container");

    html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = ((canvas.height - 200) * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save("competitor_report.pdf");
    });
  };

  return (
    <>
      <div className="top-bar">
        <div className="logo">AI Competitor Research Assistant</div>
        <div className="search-box-2">
          <input
            type="text"
            placeholder="Enter a startup name"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="search-button-2" onClick={handleSearch}>
            ↑
          </button>
        </div>
      </div>
      <button className="pdf-button" onClick={downloadPDF}>
        Click to download report
      </button>
      <div className="report-container">
        <h1 className="report-title">Competitor Report</h1>

        <div className="overview-box">
          <p>
            <strong>Company:</strong> {data[1]}
          </p>
          <p>
            <strong>Founded:</strong> {data[0].founded}
          </p>
          <p>
            <strong>Industry:</strong> {data[0].industry}
          </p>
          <p>
            <strong>Status:</strong> {data[0].operating_status}
          </p>
        </div>

        <h2 className="section-title">Comparison Charts</h2>

        <div className="charts-wrapper">
          <div className="chart-box">
            <h3>Revenue (in $M)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data1}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-box">
            <h3>Number Of Employees</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data2}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Employees" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-box">
            <h3>Funding (in $M)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data3}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Funding" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-box">
            <h3>Growth Rate (in %)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data4}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="GrowthRate" fill="#bb3f3f" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <h2 className="section-title">Quick Insights</h2>
        <ul className="insights-list">
          {insights.map((insight, index) => (
            <li key={index}>{insight}</li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default DataPage;
