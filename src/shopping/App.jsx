import React, { useEffect, useMemo, useState } from "react";
import "../styles.css";

const STORAGE_KEY = "shopping-items-v2";

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    // Migration from v1: ensure stock fields exist
    return Array.isArray(parsed)
      ? parsed.map((i) => ({
          targetStock: 1,
          stockOnHand: 0,
          ...i,
          // guard against NaN
          targetStock:
            Number.isFinite(Number(i.targetStock)) && Number(i.targetStock) > 0
              ? Number(i.targetStock)
              : 1,
          stockOnHand:
            Number.isFinite(Number(i.stockOnHand)) && Number(i.stockOnHand) >= 0
              ? Number(i.stockOnHand)
              : 0,
        }))
      : [];
  } catch {
    return [];
  }
}

function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function App() {
  const [items, setItems] = useState(() => loadItems());
  const [name, setName] = useState("");
  const [targetStock, setTargetStock] = useState(1);
  const [stockOnHand, setStockOnHand] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [activeTag, setActiveTag] = useState("ALL");

  useEffect(() => {
    saveItems(items);
  }, [items]);

  const needsRestock = (item) => (item.stockOnHand ?? 1) < (item.targetStock ?? 1);

  const remaining = useMemo(() => items.filter(needsRestock).length, [items]);

  function addItem(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const next = {
      id: crypto.randomUUID(),
      name: trimmed,
      quantity: 1,
      purchased: false,
      targetStock: Number(targetStock) > 0 ? Number(targetStock) : 1,
      stockOnHand: Number(stockOnHand) >= 0 ? Number(stockOnHand) : 1,
      tags,
      createdAt: Date.now(),
    };
    setItems((prev) => [next, ...prev]);
    setName("");
    setTargetStock(1);
    setStockOnHand(1);
    setTagInput("");
  }

  function togglePurchased(id) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, purchased: !i.purchased } : i))
    );
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function adjustStock(id, delta) {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              stockOnHand: Math.max(0, Number(i.stockOnHand ?? 1) + delta),
            }
          : i
      )
    );
  }

  function setZero(id) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, stockOnHand: 0 } : i)));
  }

  function fillToTarget(id) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, stockOnHand: Number(i.targetStock || 1) } : i))
    );
  }

  return (
    <div className="container">
      <div className="panel">
        <div className="header">
          <h1 className="title">買い物リスト</h1>
          <span className="muted">要補充: {remaining}</span>
        </div>

        <form className="form" onSubmit={addItem}>
          <input
            aria-label="item name"
            placeholder="品名を入力"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            aria-label="target stock"
            type="number"
            min={1}
            value={targetStock}
            inputMode="numeric"
            pattern="[0-9]*"
            onChange={(e) => setTargetStock(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="目標在庫"
          />
          <input
            aria-label="stock on hand"
            type="number"
            min={0}
            value={stockOnHand}
            inputMode="numeric"
            pattern="[0-9]*"
            onChange={(e) => setStockOnHand(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="手持ち在庫"
          />
          <input
            aria-label="tags"
            placeholder="タグ（カンマ区切り）"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
          />
          <button className="btn" type="submit">追加</button>
        </form>

        <div className="toolbar">
          <button className="btn secondary" onClick={() => setShowAll((v) => !v)}>
            {showAll ? "不足のみ表示" : "すべて表示"}
          </button>
          <button
            className="btn danger danger-small"
            onClick={() => {
              if (!confirm("全アイテムを削除します。よろしいですか？")) return;
              const second = prompt("続行するには CLEAR と入力してください");
              if (second === "CLEAR") setItems([]);
            }}
          >
            すべて削除
          </button>
        </div>

        <div className="toolbar">
          <span className="muted">タグで絞り込み:</span>
          <button className="btn secondary" onClick={() => setActiveTag("ALL")}>
            {activeTag === "ALL" ? "✓ " : ""}すべて
          </button>
          {Array.from(new Set(items.flatMap((i) => i.tags || []))).map((t) => (
            <button key={t} className="btn secondary" onClick={() => setActiveTag(t)}>
              {activeTag === t ? "✓ " : ""}{t}
            </button>
          ))}
        </div>

        <div className="toolbar">
          <span className="muted">既存タグから追加:</span>
          <div className="chips">
            {Array.from(new Set(items.flatMap((i) => i.tags || []))).map((t) => {
              const selected = ("," + tagInput + ",").includes("," + t + ",");
              return (
                <button
                  key={t}
                  type="button"
                  className="btn secondary"
                  onClick={() => {
                    const set = new Set(
                      tagInput
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    );
                    if (selected) set.delete(t); else set.add(t);
                    setTagInput(Array.from(set).join(", "));
                  }}
                >
                  {selected ? "✓ " : ""}{t}
                </button>
              );
            })}
          </div>
        </div>

        <ul className="list"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const fromId = e.dataTransfer.getData("text/plain");
              const toId = e.target.closest("li[data-id]")?.dataset.id;
              if (!fromId || !toId || fromId === toId) return;
              setItems((prev) => {
                const list = [...prev];
                const fromIdx = list.findIndex((i) => i.id === fromId);
                const toIdx = list.findIndex((i) => i.id === toId);
                if (fromIdx === -1 || toIdx === -1) return prev;
                const [moved] = list.splice(fromIdx, 1);
                list.splice(toIdx, 0, moved);
                return list;
              });
            }}>
          {(showAll ? items : items.filter(needsRestock))
            .filter((i) => activeTag === "ALL" || (i.tags || []).includes(activeTag))
            .map((item) => (
            <li className="item" key={item.id} data-id={item.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", item.id)}>
              <input
                type="checkbox"
                checked={item.purchased}
                onChange={() => togglePurchased(item.id)}
              />
              <span className={"item-name" + (item.purchased ? " purchased" : "")}>
                {item.name}
                <span className="muted"> &nbsp;({item.stockOnHand}/{item.targetStock})</span>
              </span>
              <div className="actions">
                <button type="button" className="btn secondary" onClick={() => adjustStock(item.id, -1)}>-1</button>
                <button type="button" className="btn secondary" onClick={() => adjustStock(item.id, 1)}>+1</button>
                <button type="button" className="btn secondary btn-xs" onClick={() => setZero(item.id)}>0</button>
                <button type="button" className="btn secondary btn-xs" onClick={() => fillToTarget(item.id)}>満タン</button>
                <button className="btn secondary btn-xs" onClick={() => removeItem(item.id)}>削除</button>
              </div>
              {(item.tags && item.tags.length > 0) && (
                <div className="muted" style={{ marginLeft: 34, fontSize: 12 }}>
                  {item.tags.join(" ")}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


