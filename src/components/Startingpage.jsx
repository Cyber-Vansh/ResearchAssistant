import React, { useState } from "react";
import "./Startingpage.css";
import { GoogleGenAI } from "@google/genai";

const Start = ({ load, show_data }) => {
  const [input, setInput] = useState("");

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

  return (
    <div className="hero-container">
      <h1 className="hero-title">AI Competitor Research Assistant</h1>
      <p className="hero-subtitle">
        Get a brief report of where a company stands compared to its
        competitors.
      </p>

      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Enter a startup name"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="search-button" onClick={handleSearch}>
          ↑
        </button>
      </div>

      <div className="tags-container">
        <button onClick={() => setInput("OpenAI")}>Try OpenAI</button>
        <button onClick={() => setInput("Stripe")}>Try Stripe</button>
        <button onClick={() => setInput("Zepto")}>Try Zepto</button>
        <button onClick={() => setInput("Groww")}>Try Groww</button>
      </div>
    </div>
  );
};

const Tag = ({ label }) => <span className="tag">{label}</span>;

export default Start;
