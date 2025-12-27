import React, { useState } from 'react';
import AIService from '../api/AIService';

const AdminAnalytics = () => {
    const [query, setQuery] = useState("");
    const [result, setResult] = useState(null); // { summary: "", tableData: [] }
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState("INVENTORY"); // INVENTORY, FINANCIAL, CLEAN

    const handleAnalyze = async () => {
        setLoading(true);
        setResult(null);
        try {
            let data;
            if (mode === "INVENTORY") {
                data = await AIService.analyzeInventory(query);
            } else if (mode === "FINANCIAL") {
                data = await AIService.analyzeFinancials(query);
            } else if (mode === "CLEAN") {
                data = await AIService.cleanData();
            }
            setResult(data);
        } catch (error) {
            alert("Analysis Failed");
        }
        setLoading(false);
    };

    return (
        <div className="p-4">
            <h2>🧠 AI Data Analyst</h2>

            {/* Controls */}
            <div className="mb-4">
                <select value={mode} onChange={(e) => setMode(e.target.value)} className="mr-2 p-2 border">
                    <option value="INVENTORY">📦 Inventory Analysis</option>
                    <option value="FINANCIAL">💰 Financial Insights</option>
                    <option value="CLEAN">🧹 Data Cleaner</option>
                </select>

                {mode !== "CLEAN" && (
                    <input
                        type="text"
                        className="p-2 border w-1/2"
                        placeholder={mode === "INVENTORY" ? "e.g., Which books are low on stock?" : "e.g., Calculate total unpaid fines."}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                )}

                <button
                    onClick={handleAnalyze}
                    className="bg-blue-600 text-white p-2 ml-2"
                    disabled={loading}
                >
                    {loading ? "Analyzing..." : "Run Analysis"}
                </button>
            </div>

            {/* Results Display */}
            {result && (
                <div className="bg-gray-100 p-4 rounded">
                    <h3 className="font-bold text-lg mb-2">💡 AI Summary:</h3>
                    <p className="mb-4">{result.summary}</p>

                    {result.tableData && result.tableData.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border">
                                <thead>
                                    <tr>
                                        {/* Dynamically Create Headers based on first object keys */}
                                        {Object.keys(result.tableData[0]).map((key) => (
                                            <th key={key} className="border p-2 bg-gray-200">{key}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.tableData.map((row, idx) => (
                                        <tr key={idx}>
                                            {Object.values(row).map((val, i) => (
                                                <td key={i} className="border p-2">{val}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminAnalytics;