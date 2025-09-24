import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "shopping-items-v1";

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
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
  const [qty, setQty] = useState(1);

  useEffect(() => {
    saveItems(items);
  }, [items]);

  const remaining = useMemo(
    () => items.filter((i) => !i.purchased).length,
    [items]
  );

  function addItem(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const next = {
      id: crypto.randomUUID(),
      name: trimmed,
      quantity: Number(qty) || 1,
      purchased: false,
      createdAt: Date.now(),
    };
    setItems((prev) => [next, ...prev]);
    setName("");
    setQty(1);
  }

  function togglePurchased(id) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, purchased: !i.purchased } : i))
    );
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function clearPurchased() {
    setItems((prev) => prev.filter((i) => !i.purchased));
  }

  return (
    <div style={{ maxWidth: 560, margin: "40px auto", padding: 16 }}>
      <h1>Shopping List</h1>

      <form onSubmit={addItem} style={{ display: "flex", gap: 8 }}>
        <input
          aria-label="item name"
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ flex: 1 }}
        />
        <input
          aria-label="quantity"
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          style={{ width: 100 }}
        />
        <button type="submit">Add</button>
      </form>

      <p style={{ marginTop: 12 }}>Remaining: {remaining}</p>

      <ul style={{ padding: 0, listStyle: "none" }}>
        {items.map((item) => (
          <li
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: 8,
              borderBottom: "1px solid #eee",
            }}
          >
            <input
              type="checkbox"
              checked={item.purchased}
              onChange={() => togglePurchased(item.id)}
            />
            <span style={{ flex: 1, opacity: item.purchased ? 0.6 : 1 }}>
              {item.name} × {item.quantity}
            </span>
            <button onClick={() => removeItem(item.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={clearPurchased}>Clear purchased</button>
        <button onClick={() => setItems([])}>Clear all</button>
      </div>
    </div>
  );
}


