import React, { useState } from "react";
import { User, DBTable } from "../types";

interface SqlAdminViewProps {
  user: User;
}

const MOCK_SCHEMAS: DBTable[] = [
  { name: "profiles", columns: ["id", "telegram_id", "username", "balance", "bonus_balance"] },
  { name: "transactions", columns: ["id", "user_id", "amount", "type", "status", "created_at"] },
  { name: "game_history", columns: ["id", "winner_id", "prize_amount", "card_id", "created_at"] },
  { name: "current_stakes", columns: ["id", "card_id", "user_id", "created_at"] },
];

const SqlAdminView: React.FC<SqlAdminViewProps> = ({ user }) => {
  const [query, setQuery] = useState("SELECT * FROM profiles LIMIT 10;");
  const [results, setResults] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"query" | "schema">("query");

  const executeQuery = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/sql/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, userId: user.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to execute query");
      
      setResults(data.result || []);
      if (data.result && data.result.length > 0) {
        setColumns(Object.keys(data.result[0]));
      } else {
        setColumns([]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setResults([]);
      setColumns([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTable = (tableName: string) => {
    setQuery(`SELECT * FROM ${tableName} LIMIT 20;`);
    setActiveTab("query");
  };

  if (!user.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-red-500">
        <i className="fas fa-lock text-4xl mb-4 opacity-50"></i>
        <h2 className="font-black uppercase tracking-widest text-lg">Access Denied</h2>
        <p className="text-sm opacity-70 mt-2">You need administrative privileges to view this section.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-hb-bg overflow-y-auto px-4 py-6 animation-fade-in pb-32">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-hb-gold/10 flex items-center justify-center border border-hb-gold/20 text-hb-gold shadow-inner">
          <i className="fas fa-database text-lg"></i>
        </div>
        <div>
          <h2 className="font-black text-xl italic tracking-tight uppercase line-clamp-1">
            Database Admin
          </h2>
          <p className="text-[10px] font-bold text-hb-muted uppercase tracking-[0.2em]">
            Raw SQL Interface
          </p>
        </div>
      </div>

      <div className="flex bg-[#121212] p-1 rounded-xl border border-hb-border mb-4">
        <button
          onClick={() => setActiveTab("query")}
          className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "query" ? "bg-hb-surface text-hb-gold shadow-sm" : "text-hb-muted hover:text-white"}`}
        >
          <i className="fas fa-terminal mr-2"></i> Query Editor
        </button>
        <button
          onClick={() => setActiveTab("schema")}
          className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "schema" ? "bg-hb-surface text-hb-gold shadow-sm" : "text-hb-muted hover:text-white"}`}
        >
          <i className="fas fa-project-diagram mr-2"></i> Schema Explorer
        </button>
      </div>

      {activeTab === "query" ? (
        <div className="flex flex-col gap-2">
          <div className="p-4 bg-[#121212] rounded-xl border border-hb-border">
            <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-32 bg-transparent text-hb-muted font-mono text-xs border-0 outline-none"
            />
            <button
                onClick={executeQuery}
                disabled={isLoading}
                className="mt-2 w-full py-2 bg-hb-gold text-black font-black uppercase text-[10px] rounded-lg tracking-widest"
            >
                {isLoading ? "Executing..." : "Execute Query"}
            </button>
          </div>
          <div className="p-4 bg-[#121212] rounded-xl border border-hb-border">
            {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
            <div className="overflow-x-auto">
                <table className="w-full text-xs text-hb-muted">
                    <thead>
                        {columns.map(col => <th key={col} className="text-left p-2 border-b border-hb-border">{col}</th>)}
                    </thead>
                    <tbody>
                        {results.map((row, i) => (
                            <tr key={i}>
                                {columns.map(col => <td key={col} className="p-2 border-b border-hb-border">{String(row[col])}</td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-[#121212] rounded-xl border border-hb-border">
          {MOCK_SCHEMAS.map(table => (
              <div key={table.name} className="py-2 cursor-pointer hover:text-white" onClick={() => handleSelectTable(table.name)}>
                  <span className="font-bold">{table.name}</span>
                  <p className="text-xs text-hb-muted">{table.columns.join(", ")}</p>
              </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SqlAdminView;
