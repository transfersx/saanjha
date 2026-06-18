import React, { useMemo, useState } from "react";
import {
  Search, Plus, Minus, ShoppingCart, ChefHat, Activity, Wallet, Package,
  Check, Camera, Flame, X, Leaf, Drumstick, Clock, Sparkles, Trash2,
  Pencil, ArrowRight, Info, CircleDollarSign, Boxes, TriangleAlert,
} from "lucide-react";

/* ============================================================================
   Saanjha — a shared-household grocery & life-management app for housemates.
   Single default-exported React component. State only, no persistence.

   The SHARED INVENTORY (`items`) is the spine: receipts/manual entry feed it,
   cooking depletes it, low stock drives the shopping list, recipes match it.
   ========================================================================== */

/* ---- design tokens -------------------------------------------------------- */
const T = {
  bg: "#EAF0E1",        // pale sage background
  bgSoft: "#F2F6EC",
  card: "#FFFFFF",
  brand: "#2E5D3B",     // deep herb green
  brandSoft: "#E4EEDD",
  ink: "#1C3527",       // deep evergreen ink
  muted: "#7B8A77",     // sage-grey muted text
  line: "#DCE4D0",
  amber: "#D8962A",     // turmeric amber (low stock / alerts)
  amberSoft: "#FBEFD7",
  green: "#5DAA4F",     // fresh green (healthy levels)
  greenSoft: "#E2F1DD",
  white: "#FFFFFF",
};

const MEMBER_COLORS = {
  Aarav: "#2E5D3B",
  Priya: "#C4622D",
  Rohan: "#3A6E8F",
  Meera: "#9A4A8C",
};

/* ---- staples: always-on-hand, never depleted, never on the list ----------- */
const STAPLES = new Set([
  "Salt", "Cumin seeds", "Black pepper", "Ghee (clarified butter)",
  "Mustard oil", "Sugar",
]);
const isStaple = (name) => STAPLES.has(name);

/* ---- id counters (declared before the seed arrays that use them: `let`
   bindings are not hoisted the way function declarations are) -------------- */
let _id = 0, _rid = 0, _eid = 0;

/* ---- seed: members -------------------------------------------------------- */
const MEMBERS = [
  { id: "m1", name: "Aarav", color: MEMBER_COLORS.Aarav },
  { id: "m2", name: "Priya", color: MEMBER_COLORS.Priya },
  { id: "m3", name: "Rohan", color: MEMBER_COLORS.Rohan },
  { id: "m4", name: "Meera", color: MEMBER_COLORS.Meera },
];

/* ---- seed: inventory ------------------------------------------------------
   qty<=threshold (and not a staple) => "running low" => shopping list.
   ~10 items are deliberately low.                                            */
const SEED_ITEMS = [
  // Produce
  i("Banana", "🍌", "Produce", 6, "pcs", 12, 3, "Aarav"),
  i("Avocado", "🥑", "Produce", 4, "pcs", 6, 2, "Priya"),
  i("Apple", "🍎", "Produce", 5, "pcs", 10, 3, "Rohan"),
  i("Beetroot", "🟣", "Produce", 3, "pcs", 6, 2, "Meera"),
  i("Coriander", "🌿", "Produce", 1, "bunch", 3, 1, "Priya"),       // low
  i("Broccoli", "🥦", "Produce", 2, "pcs", 4, 1, "Aarav"),
  i("Carrots", "🥕", "Produce", 0.5, "kg", 1, 0.3, "Meera"),
  i("Cucumber", "🥒", "Produce", 3, "pcs", 6, 2, "Rohan"),
  i("Cherry tomato", "🍅", "Produce", 0.4, "kg", 0.5, 0.2, "Priya"),
  i("Tomato", "🍅", "Produce", 0.3, "kg", 1.5, 0.4, "Aarav"),        // low
  i("Potato", "🥔", "Produce", 1.2, "kg", 3, 0.5, "Rohan"),
  i("Onion", "🧅", "Produce", 0.4, "kg", 2, 0.5, "Meera"),          // low
  i("Lemon", "🍋", "Produce", 4, "pcs", 8, 2, "Priya"),
  i("Bhindi (okra)", "🫛", "Produce", 0.6, "kg", 0.8, 0.3, "Aarav"),
  i("Grapes", "🍇", "Produce", 0.5, "kg", 1, 0.3, "Rohan"),
  i("Garlic", "🧄", "Produce", 0.15, "kg", 0.4, 0.1, "Meera"),
  i("Ginger", "🫚", "Produce", 0.1, "kg", 0.3, 0.07, "Priya"),
  i("Spinach", "🥬", "Produce", 1, "bunch", 3, 1, "Aarav"),         // low
  i("Rockmelon", "🍈", "Produce", 2, "pcs", 3, 1, "Rohan"),
  i("Mango", "🥭", "Produce", 4, "pcs", 8, 2, "Meera"),
  i("Papaya", "🫐", "Produce", 2, "pcs", 3, 1, "Priya"),
  i("Watermelon", "🍉", "Produce", 2, "pcs", 3, 1, "Aarav"),
  // Frozen
  i("Frozen vegetables", "🧊", "Frozen", 0.6, "kg", 1.5, 0.4, "Rohan"),
  i("Acai", "🟣", "Frozen", 3, "packs", 4, 2, "Meera"),
  i("Frozen blueberries", "🫐", "Frozen", 0.6, "kg", 1, 0.3, "Priya"),
  i("Frozen green chilli", "🌶️", "Frozen", 0.2, "kg", 0.5, 0.15, "Aarav"),
  i("Frozen peas", "🟢", "Frozen", 0.5, "kg", 1, 0.3, "Rohan"),
  // Dairy & Eggs
  i("Milk", "🥛", "Dairy & Eggs", 0.5, "L", 3, 1, "Meera"),         // low
  i("Eggs", "🥚", "Dairy & Eggs", 3, "pcs", 12, 4, "Aarav"),       // low
  i("Yoghurt", "🥛", "Dairy & Eggs", 0.4, "kg", 1, 0.3, "Priya"),
  i("Cheese", "🧀", "Dairy & Eggs", 0.2, "kg", 0.5, 0.2, "Rohan"),  // low
  i("Butter", "🧈", "Dairy & Eggs", 0.1, "kg", 0.5, 0.15, "Meera"), // low
  // Grains & Staples
  i("Oats", "🥣", "Grains & Staples", 0.8, "kg", 1.5, 0.4, "Aarav"),
  i("Canned beans", "🫘", "Grains & Staples", 4, "cans", 8, 3, "Priya"),
  i("Bread", "🍞", "Grains & Staples", 0.5, "loaf", 2, 1, "Rohan"), // low
  i("Rice", "🍚", "Grains & Staples", 3, "kg", 5, 1.5, "Meera"),
  i("Daal", "🫘", "Grains & Staples", 1.5, "kg", 3, 1, "Aarav"),
  // Protein
  i("Chicken", "🍗", "Protein", 0.4, "kg", 2, 0.5, "Priya"),        // low
  // Pantry & Spices  (staples marked below)
  i("Tomato ketchup", "🥫", "Pantry & Spices", 2, "bottle", 2, 1, "Rohan"),
  i("Sugar", "🍬", "Pantry & Spices", 1.2, "kg", 2, 0.5, "Meera"),
  i("Peanut butter", "🥜", "Pantry & Spices", 2, "jar", 2, 1, "Aarav"),
  i("Ghee (clarified butter)", "🧈", "Pantry & Spices", 0.5, "kg", 1, 0.3, "Priya"),
  i("Mustard oil", "🛢️", "Pantry & Spices", 0.8, "L", 2, 0.5, "Rohan"),
  i("Black pepper", "⚫", "Pantry & Spices", 0.1, "kg", 0.2, 0.05, "Meera"),
  i("Salt", "🧂", "Pantry & Spices", 0.5, "kg", 1, 0.2, "Aarav"),
  i("Cumin seeds", "🌰", "Pantry & Spices", 0.15, "kg", 0.3, 0.05, "Priya"),
  // Snacks
  i("Doritos", "🟠", "Snacks", 2, "packs", 4, 1, "Rohan"),
  i("Biscuits", "🍪", "Snacks", 3, "packs", 5, 2, "Meera"),
];

function i(name, emoji, category, qty, unit, full, threshold, addedBy) {
  _id += 1;
  return { id: "it" + _id, name, emoji, category, qty, unit, full, threshold, addedBy };
}

const CATEGORY_ORDER = [
  "Produce", "Frozen", "Dairy & Eggs", "Grains & Staples",
  "Protein", "Pantry & Spices", "Snacks",
];

/* ---- seed: recipes --------------------------------------------------------
   ingredient strings map to inventory item names. Some ingredients are not
   stocked (Tortillas, Pasta, Cream, Basil, Garam masala, Bay leaf) so the
   "add missing to list" path is always visible. macros are per serving.     */
const RECIPES = [
  // ---- Indian ----
  r("Chicken Curry", "🍛", false, "Indian", 40, ["Chicken", "Onion", "Tomato", "Garlic", "Ginger", "Mustard oil", "Cumin seeds", "Coriander", "Salt"], 520, 38, 18, 6),
  r("Pepper Chicken", "🌶️", false, "Indian", 30, ["Chicken", "Black pepper", "Onion", "Garlic", "Ginger", "Ghee (clarified butter)", "Salt"], 460, 40, 9, 3),
  r("Palak Chicken", "🥬", false, "Indian", 45, ["Chicken", "Spinach", "Onion", "Garlic", "Ginger", "Cumin seeds", "Salt"], 480, 39, 12, 7),
  r("Butter Chicken", "🧈", false, "Indian", 50, ["Chicken", "Butter", "Tomato", "Cream", "Garlic", "Ginger", "Garam masala", "Salt"], 610, 36, 16, 4),
  r("Chicken Biryani", "🍚", false, "Indian", 60, ["Chicken", "Rice", "Onion", "Yoghurt", "Garam masala", "Ginger", "Garlic", "Ghee (clarified butter)", "Salt"], 640, 34, 70, 5),
  r("Daal Tadka", "🫘", true, "Indian", 35, ["Daal", "Onion", "Tomato", "Garlic", "Cumin seeds", "Ghee (clarified butter)", "Salt"], 320, 16, 42, 12),
  r("Daal Palak", "🥬", true, "Indian", 35, ["Daal", "Spinach", "Garlic", "Cumin seeds", "Ghee (clarified butter)", "Salt"], 300, 17, 38, 14),
  r("Aloo Bhindi", "🫛", true, "Indian", 30, ["Bhindi (okra)", "Potato", "Onion", "Mustard oil", "Cumin seeds", "Salt"], 240, 6, 34, 9),
  r("Bhindi Masala", "🫛", true, "Indian", 30, ["Bhindi (okra)", "Onion", "Tomato", "Mustard oil", "Cumin seeds", "Salt"], 210, 5, 24, 8),
  r("Jeera Rice", "🍚", true, "Indian", 20, ["Rice", "Cumin seeds", "Ghee (clarified butter)", "Salt"], 280, 5, 54, 2),
  r("Vegetable Pulao", "🍚", true, "Indian", 35, ["Rice", "Frozen vegetables", "Frozen peas", "Onion", "Ghee (clarified butter)", "Cumin seeds", "Salt"], 360, 8, 62, 6),
  r("Masala Omelette", "🍳", true, "Indian", 12, ["Eggs", "Onion", "Tomato", "Coriander", "Frozen green chilli", "Salt"], 240, 16, 6, 2),
  r("Anda Bhurji", "🍳", true, "Indian", 15, ["Eggs", "Onion", "Tomato", "Frozen green chilli", "Coriander", "Mustard oil", "Salt"], 260, 17, 7, 2),
  // ---- Mexican ----
  r("Chicken Burrito Bowl", "🌯", false, "Mexican", 30, ["Chicken", "Rice", "Canned beans", "Tomato", "Onion", "Cheese", "Salt"], 580, 41, 55, 11),
  r("Chicken Tacos", "🌮", false, "Mexican", 25, ["Chicken", "Tortillas", "Onion", "Tomato", "Cheese", "Coriander", "Salt"], 510, 33, 38, 6),
  r("Chicken Fajitas", "🌶️", false, "Mexican", 30, ["Chicken", "Tortillas", "Onion", "Garlic", "Black pepper", "Salt"], 490, 35, 34, 5),
  r("Veggie Burrito Bowl", "🥗", true, "Mexican", 25, ["Rice", "Canned beans", "Tomato", "Onion", "Cheese", "Coriander", "Salt"], 470, 18, 66, 14),
  r("Bean Quesadilla", "🫓", true, "Mexican", 20, ["Tortillas", "Canned beans", "Cheese", "Onion", "Salt"], 430, 19, 44, 10),
  // ---- Italian ----
  r("Lemon Garlic Chicken", "🍋", false, "Italian", 30, ["Chicken", "Lemon", "Garlic", "Butter", "Black pepper", "Salt"], 440, 42, 5, 1),
  r("Chicken Alfredo Pasta", "🍝", false, "Italian", 35, ["Chicken", "Pasta", "Cream", "Garlic", "Cheese", "Butter", "Salt"], 720, 38, 68, 4),
  r("Chicken Parmigiana", "🧀", false, "Italian", 45, ["Chicken", "Tomato", "Cheese", "Bread", "Garlic", "Salt"], 600, 44, 28, 5),
  r("Tuscan Garlic Chicken", "🌿", false, "Italian", 35, ["Chicken", "Spinach", "Cream", "Garlic", "Cheese", "Butter", "Salt"], 560, 40, 10, 4),
  r("Tomato Basil Pasta", "🍝", true, "Italian", 25, ["Pasta", "Tomato", "Garlic", "Basil", "Cheese", "Salt"], 520, 16, 78, 6),
  r("Cheese Omelette", "🧀", true, "Italian", 10, ["Eggs", "Cheese", "Butter", "Black pepper", "Salt"], 320, 21, 3, 1),
  // ---- quick / everyday ----
  r("Garlic Butter Rice", "🍚", true, "Italian", 18, ["Rice", "Garlic", "Butter", "Black pepper", "Salt"], 310, 6, 56, 2),
  r("Avocado Toast", "🥑", true, "Italian", 8, ["Bread", "Avocado", "Lemon", "Black pepper", "Salt"], 290, 8, 30, 9),
  r("Oats Banana Bowl", "🥣", true, "Indian", 8, ["Oats", "Banana", "Milk", "Peanut butter"], 380, 14, 52, 8),
];

function r(name, emoji, veg, cuisine, time, ingredients, cal, p, c, f) {
  _rid += 1;
  return { id: "re" + _rid, name, emoji, veg, cuisine, time, ingredients, macros: { cal, p, c, f } };
}

/* ---- seed: expenses ------------------------------------------------------- */
const ALL = MEMBERS.map((m) => m.id);
const SEED_EXPENSES = [
  ex("June rent", 2400, "m1", "Rent", ALL, "Jun 1"),
  ex("Electricity bill", 180, "m2", "Utilities", ALL, "Jun 4"),
  ex("Internet (NBN)", 89, "m3", "Utilities", ALL, "Jun 5"),
  ex("Big grocery shop", 312, "m4", "Groceries", ALL, "Jun 8"),
  ex("Cleaning supplies", 64, "m1", "Household", ALL, "Jun 11"),
  ex("Gas bottle refill", 96, "m2", "Household", ALL, "Jun 14"),
];
function ex(desc, amount, paidBy, category, participants, when) {
  _eid += 1;
  return { id: "ex" + _eid, desc, amount, paidBy, category, participants, when };
}

/* ---- helpers -------------------------------------------------------------- */
const stepFor = (unit) => (["kg", "L"].includes(unit) ? 0.5 : unit === "g" ? 100 : 1);
const fmtQty = (q) => (Number.isInteger(q) ? q : Math.round(q * 100) / 100);
const money = (n) => "$" + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const emojiFor = (name) => {
  const hit = SEED_ITEMS.find((s) => s.name.toLowerCase() === name.toLowerCase());
  if (hit) return hit.emoji;
  const map = { Tortillas: "🫓", Pasta: "🍝", Cream: "🥛", Basil: "🌿", "Garam masala": "🥄", "Bay leaf": "🍃" };
  return map[name] || "🛒";
};

export default function Saanjha() {
  const [tab, setTab] = useState("pantry");
  const [items, setItems] = useState(SEED_ITEMS);
  const [extras, setExtras] = useState([
    { id: "x1", name: "Dish soap", emoji: "🧼", buyer: "m3", done: false },
    { id: "x2", name: "Paper towels", emoji: "🧻", buyer: null, done: false },
  ]);
  const [autoBuyers, setAutoBuyers] = useState({});
  const [expenses, setExpenses] = useState(SEED_EXPENSES);
  const [nutrition, setNutrition] = useState(() => {
    const n = {};
    MEMBERS.forEach((m) => { n[m.id] = { targets: { cal: 2200, p: 130, c: 250, f: 30 }, logs: [] }; });
    n.m2.targets = { cal: 1900, p: 110, c: 210, f: 28 };
    n.m4.targets = { cal: 1800, p: 100, c: 200, f: 30 };
    return n;
  });
  const [currentUser, setCurrentUser] = useState("m1");

  const memberById = (id) => MEMBERS.find((m) => m.id === id);
  const me = memberById(currentUser);

  /* derived: low-stock items (non-staple, qty<=threshold) */
  const lowItems = useMemo(
    () => items.filter((it) => !isStaple(it.name) && it.qty <= it.threshold),
    [items]
  );

  /* derived: which recipes are fully cookable */
  const haveSet = useMemo(() => {
    const s = new Set();
    items.forEach((it) => { if (it.qty > 0) s.add(it.name.toLowerCase()); });
    return s;
  }, [items]);

  const recipeStatus = (recipe) => {
    let have = 0;
    const missing = [];
    recipe.ingredients.forEach((ing) => {
      const ok = isStaple(ing) || haveSet.has(ing.toLowerCase());
      if (ok) have += 1; else missing.push(ing);
    });
    const pct = Math.round((have / recipe.ingredients.length) * 100);
    return { have, total: recipe.ingredients.length, pct, missing, ready: missing.length === 0 };
  };

  const cookNowCount = useMemo(
    () => RECIPES.filter((rc) => recipeStatus(rc).ready).length,
    [haveSet]
  );

  const onListCount = lowItems.length + extras.filter((e) => !e.done).length;

  /* ---------- inventory mutations ---------- */
  const bump = (id, dir) =>
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const step = stepFor(it.unit);
        const next = Math.max(0, Math.round((it.qty + dir * step) * 100) / 100);
        return { ...it, qty: next };
      })
    );

  const refillToFull = (id) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, qty: it.full } : it)));

  const addItem = (form) => {
    const qty = parseFloat(form.qty) || 0;
    setItems((prev) => [
      i(form.name.trim(), emojiFor(form.name.trim()) || "🛒", form.category, qty, form.unit,
        Math.max(qty, qty * 2 || 1), Math.max(qty * 0.4, stepFor(form.unit)), me.name),
      ...prev,
    ]);
  };

  const deductForCook = (recipe) =>
    setItems((prev) =>
      prev.map((it) => {
        if (isStaple(it.name)) return it;
        if (!recipe.ingredients.some((ing) => ing.toLowerCase() === it.name.toLowerCase())) return it;
        const use = it.unit === "kg" || it.unit === "L" ? 0.25 : it.unit === "g" ? 100 : 1;
        return { ...it, qty: Math.max(0, Math.round((it.qty - use) * 100) / 100) };
      })
    );

  const pushMissingToList = (missing) =>
    setExtras((prev) => {
      const existing = new Set(prev.map((e) => e.name.toLowerCase()));
      const adds = missing
        .filter((mname) => !existing.has(mname.toLowerCase()))
        .map((mname, k) => ({ id: "x" + Date.now() + k, name: mname, emoji: emojiFor(mname), buyer: currentUser, done: false }));
      return [...adds, ...prev];
    });

  /* ---------- shared shell ---------- */
  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.ink, fontFamily: "Inter, system-ui, sans-serif" }}>
      <FontStyles />
      <Header
        me={me}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        stats={{
          tracked: items.length,
          stocked: items.filter((it) => !isStaple(it.name) && it.qty > it.threshold).length,
          low: lowItems.length,
          list: onListCount,
          cook: cookNowCount,
        }}
      />

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "0 14px 120px" }}>
        {tab === "pantry" && <Pantry items={items} bump={bump} addItem={addItem} />}
        {tab === "shopping" && (
          <Shopping
            lowItems={lowItems}
            extras={extras}
            setExtras={setExtras}
            autoBuyers={autoBuyers}
            setAutoBuyers={setAutoBuyers}
            refillToFull={refillToFull}
            currentUser={currentUser}
          />
        )}
        {tab === "cook" && (
          <Cook
            recipes={RECIPES}
            status={recipeStatus}
            onCook={deductForCook}
            onAddMissing={pushMissingToList}
            onLog={(recipe) => logFromRecipe(recipe, currentUser, setNutrition)}
            goTrack={() => setTab("track")}
          />
        )}
        {tab === "track" && (
          <Track
            members={MEMBERS}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            nutrition={nutrition}
            setNutrition={setNutrition}
            recipes={RECIPES}
          />
        )}
        {tab === "split" && (
          <Split members={MEMBERS} expenses={expenses} setExpenses={setExpenses} currentUser={currentUser} />
        )}
      </main>

      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}

/* ============================================================================
   Header + nav
   ========================================================================== */
function Avatar({ member, active, onClick, size = 36 }) {
  const initials = member.name[0];
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      title={member.name}
      style={{
        width: size, height: size, borderRadius: "50%", border: active ? `2px solid ${T.ink}` : "2px solid transparent",
        background: member.color, color: "#fff", fontWeight: 700, fontSize: size * 0.42,
        display: "grid", placeItems: "center", cursor: "pointer", flex: "0 0 auto",
        boxShadow: active ? "0 0 0 3px " + T.bg : "none", fontFamily: "Inter, sans-serif",
      }}
    >
      {initials}
    </button>
  );
}

function Header({ me, currentUser, setCurrentUser, stats }) {
  const chips = [
    { label: "tracked", value: stats.tracked, color: T.brand, Icon: Boxes },
    { label: "well stocked", value: stats.stocked, color: T.green, Icon: Check },
    { label: "running low", value: stats.low, color: T.amber, Icon: TriangleAlert },
    { label: "on the list", value: stats.list, color: T.brand, Icon: ShoppingCart },
    { label: "cook now", value: stats.cook, color: T.green, Icon: ChefHat },
  ];
  return (
    <header style={{ background: T.brand, color: "#fff", borderBottomLeftRadius: 22, borderBottomRightRadius: 22 }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "18px 16px 16px" }}>
        <div className="flex items-center justify-between" style={{ flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ fontSize: 28 }}>🪔</span>
              <h1 style={{ fontFamily: '"Bricolage Grotesque", Inter, sans-serif', fontWeight: 800, fontSize: 30, letterSpacing: "-0.02em", margin: 0 }}>
                Saanjha
              </h1>
            </div>
            <p style={{ margin: "2px 0 0 38px", color: T.brandSoft, fontSize: 13 }}>
              The Banksia St. household · shared & in sync
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: T.brandSoft }}>You are</span>
            <div style={{ display: "flex", gap: 8 }}>
              {MEMBERS.map((m) => (
                <Avatar key={m.id} member={m} active={m.id === currentUser} onClick={() => setCurrentUser(m.id)} />
              ))}
            </div>
          </div>
        </div>

        {/* pulse strip */}
        <div style={{ display: "flex", gap: 8, marginTop: 14, overflowX: "auto", paddingBottom: 2 }}>
          {chips.map((c) => (
            <div
              key={c.label}
              style={{
                display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.12)",
                borderRadius: 999, padding: "7px 12px", flex: "0 0 auto",
              }}
            >
              <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#fff", color: c.color, display: "grid", placeItems: "center" }}>
                <c.Icon size={14} />
              </span>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{c.value}</span>
              <span style={{ fontSize: 12, color: T.brandSoft }}>{c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

function BottomNav({ tab, setTab }) {
  const tabs = [
    { id: "pantry", label: "Pantry", Icon: Package },
    { id: "shopping", label: "Shopping", Icon: ShoppingCart },
    { id: "cook", label: "Cook", Icon: ChefHat },
    { id: "track", label: "Track", Icon: Activity },
    { id: "split", label: "Split", Icon: Wallet },
  ];
  return (
    <nav
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, background: T.card,
        borderTop: `1px solid ${T.line}`, boxShadow: "0 -6px 24px rgba(28,53,39,0.08)", zIndex: 20,
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex" }}>
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-current={active ? "page" : undefined}
              style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                padding: "9px 4px 11px", cursor: "pointer", border: "none",
                background: "transparent", color: active ? T.brand : T.muted, fontWeight: active ? 700 : 500,
              }}
            >
              <span style={{ position: "relative" }}>
                <t.Icon size={22} />
                {active && <span style={{ position: "absolute", inset: -8, borderRadius: 12, background: T.brandSoft, zIndex: -1 }} />}
              </span>
              <span style={{ fontSize: 11 }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ============================================================================
   Shared bits
   ========================================================================== */
function SectionTitle({ children, sub }) {
  return (
    <div style={{ margin: "22px 2px 12px" }}>
      <h2 style={{ fontFamily: '"Bricolage Grotesque", Inter, sans-serif', fontWeight: 700, fontSize: 22, margin: 0, letterSpacing: "-0.01em" }}>
        {children}
      </h2>
      {sub && <p style={{ margin: "2px 0 0", color: T.muted, fontSize: 13 }}>{sub}</p>}
    </div>
  );
}

function StockBar({ qty, full, low }) {
  const pct = Math.max(0, Math.min(1, full > 0 ? qty / full : 0)) * 100;
  return (
    <div style={{ background: T.line, borderRadius: 999, height: 8, overflow: "hidden" }}>
      <div className="sa-bar" style={{ width: pct + "%", height: "100%", borderRadius: 999, background: low ? T.amber : T.green }} />
    </div>
  );
}

function Pill({ children, bg, color, dashed, title }) {
  return (
    <span
      title={title}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600,
        padding: "3px 9px", borderRadius: 999, background: bg, color,
        border: dashed ? `1px dashed ${color}` : "none",
      }}
    >
      {children}
    </span>
  );
}

function cardStyle(extra = {}) {
  return { background: T.card, borderRadius: 16, border: `1px solid ${T.line}`, ...extra };
}

const btn = (kind) => {
  const base = { borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer", padding: "8px 12px", border: "1px solid transparent", fontFamily: "Inter, sans-serif" };
  if (kind === "primary") return { ...base, background: T.brand, color: "#fff" };
  if (kind === "amber") return { ...base, background: T.amber, color: "#fff" };
  if (kind === "ghost") return { ...base, background: T.brandSoft, color: T.brand };
  if (kind === "outline") return { ...base, background: "#fff", color: T.ink, borderColor: T.line };
  return base;
};

/* ============================================================================
   1) PANTRY
   ========================================================================== */
function Pantry({ items, bump, addItem }) {
  const [q, setQ] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", qty: "", unit: "pcs", category: "Produce" });

  const filtered = items.filter((it) => it.name.toLowerCase().includes(q.toLowerCase()));
  const grouped = CATEGORY_ORDER.map((cat) => ({ cat, list: filtered.filter((it) => it.category === cat) })).filter((g) => g.list.length);

  return (
    <>
      <div className="flex items-center" style={{ gap: 10, marginTop: 18, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={17} style={{ position: "absolute", left: 12, top: 11, color: T.muted }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the pantry…"
            style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 12, border: `1px solid ${T.line}`, background: "#fff", fontSize: 14, color: T.ink }}
          />
        </div>
        <button style={btn("primary")} onClick={() => setShowAdd((s) => !s)}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Plus size={16} /> Add item</span>
        </button>
      </div>

      {showAdd && (
        <div style={cardStyle({ padding: 14, marginTop: 12 })}>
          <div className="grid" style={{ gridTemplateColumns: "2fr 1fr 1fr 1.4fr auto", gap: 8, alignItems: "end", flexWrap: "wrap" }}>
            <Field label="Name">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Capsicum" style={inputStyle} />
            </Field>
            <Field label="Qty">
              <input value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} placeholder="0" inputMode="decimal" style={inputStyle} />
            </Field>
            <Field label="Unit">
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} style={inputStyle}>
                {["pcs", "kg", "g", "L", "bunch", "pack", "loaf", "jar", "bottle", "cans"].map((u) => <option key={u}>{u}</option>)}
              </select>
            </Field>
            <Field label="Category">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                {CATEGORY_ORDER.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <button
              style={{ ...btn("primary"), opacity: form.name.trim() ? 1 : 0.5 }}
              disabled={!form.name.trim()}
              onClick={() => { addItem(form); setForm({ name: "", qty: "", unit: "pcs", category: "Produce" }); setShowAdd(false); }}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {grouped.map(({ cat, list }) => (
        <div key={cat}>
          <SectionTitle>{cat}</SectionTitle>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {list.map((it) => {
              const low = !isStaple(it.name) && it.qty <= it.threshold;
              return (
                <div key={it.id} style={cardStyle({ padding: 14 })}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center" style={{ gap: 10 }}>
                      <span style={{ fontSize: 26 }}>{it.emoji}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{it.name}</div>
                        <div style={{ fontSize: 12, color: T.muted }}>
                          {fmtQty(it.qty)} {it.unit} · added by {it.addedBy}
                        </div>
                      </div>
                    </div>
                    {isStaple(it.name) ? (
                      <Pill bg={T.brandSoft} color={T.brand}>staple</Pill>
                    ) : low ? (
                      <Pill bg={T.amberSoft} color={T.amber}><TriangleAlert size={12} /> running low</Pill>
                    ) : null}
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <StockBar qty={it.qty} full={it.full} low={low} />
                    <div className="flex items-center justify-between" style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 11, color: T.muted }}>
                        {isStaple(it.name) ? "always on hand" : `low at ${fmtQty(it.threshold)} ${it.unit}`}
                      </div>
                      <div className="flex items-center" style={{ gap: 8 }}>
                        <Stepper onClick={() => bump(it.id, -1)} aria="decrease"><Minus size={15} /></Stepper>
                        <span style={{ minWidth: 30, textAlign: "center", fontWeight: 700, fontSize: 14 }}>{fmtQty(it.qty)}</span>
                        <Stepper onClick={() => bump(it.id, 1)} aria="increase"><Plus size={15} /></Stepper>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

function Stepper({ children, onClick, aria }) {
  return (
    <button
      onClick={onClick}
      aria-label={aria}
      style={{ width: 30, height: 30, borderRadius: 9, border: `1px solid ${T.line}`, background: "#fff", color: T.brand, cursor: "pointer", display: "grid", placeItems: "center" }}
    >
      {children}
    </button>
  );
}

const inputStyle = { width: "100%", padding: "9px 10px", borderRadius: 10, border: `1px solid ${T.line}`, background: "#fff", fontSize: 14, color: T.ink };
function Field({ label, children }) {
  return (
    <label style={{ display: "block", flex: 1, minWidth: 90 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: T.muted, display: "block", marginBottom: 4 }}>{label}</span>
      {children}
    </label>
  );
}

/* ============================================================================
   2) SHOPPING
   ========================================================================== */
function MemberChips({ members, value, onChange }) {
  return (
    <div className="flex" style={{ gap: 6, flexWrap: "wrap" }}>
      {members.map((m) => {
        const active = value === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onChange(active ? null : m.id)}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "4px 9px 4px 5px", borderRadius: 999,
              border: `1px solid ${active ? m.color : T.line}`, background: active ? m.color : "#fff",
              color: active ? "#fff" : T.muted, cursor: "pointer", fontSize: 12, fontWeight: 600,
            }}
          >
            <span style={{ width: 18, height: 18, borderRadius: "50%", background: active ? "#fff" : m.color, color: active ? m.color : "#fff", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700 }}>
              {m.name[0]}
            </span>
            {m.name}
          </button>
        );
      })}
    </div>
  );
}

function Shopping({ lowItems, extras, setExtras, autoBuyers, setAutoBuyers, refillToFull, currentUser }) {
  const [newName, setNewName] = useState("");
  const suggested = (it) => Math.max(stepFor(it.unit), Math.round((it.full - it.qty) * 100) / 100);

  const addExtra = () => {
    if (!newName.trim()) return;
    setExtras((p) => [{ id: "x" + Date.now(), name: newName.trim(), emoji: emojiFor(newName.trim()), buyer: currentUser, done: false }, ...p]);
    setNewName("");
  };

  return (
    <>
      <SectionTitle sub="Auto-built from everything at or below its low-stock mark. Marking it bought refills the pantry to full — and it leaves the list.">
        Running low · {lowItems.length}
      </SectionTitle>

      {lowItems.length === 0 && <Empty>Nothing low right now — the pantry is in great shape. 🌿</Empty>}

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {lowItems.map((it) => (
          <div key={it.id} style={cardStyle({ padding: 14 })}>
            <div className="flex items-center justify-between">
              <div className="flex items-center" style={{ gap: 10 }}>
                <span style={{ fontSize: 24 }}>{it.emoji}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{it.name}</div>
                  <div style={{ fontSize: 12, color: T.amber, fontWeight: 600 }}>
                    {fmtQty(it.qty)} {it.unit} left · buy ~{fmtQty(suggested(it))} {it.unit}
                  </div>
                </div>
              </div>
              <button style={btn("primary")} onClick={() => refillToFull(it.id)}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Check size={15} /> Bought</span>
              </button>
            </div>
            <div style={{ marginTop: 12, fontSize: 11, fontWeight: 600, color: T.muted, marginBottom: 6 }}>Who's grabbing it?</div>
            <MemberChips members={MEMBERS} value={autoBuyers[it.id] || null} onChange={(v) => setAutoBuyers((p) => ({ ...p, [it.id]: v }))} />
          </div>
        ))}
      </div>

      <SectionTitle sub="Non-pantry bits the house needs. Check them off when they're sorted.">Added by the house</SectionTitle>
      <div style={cardStyle({ padding: 14 })}>
        <div className="flex" style={{ gap: 8, marginBottom: 12 }}>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addExtra()} placeholder="Add something (toilet roll, foil…)" style={inputStyle} />
          <button style={btn("primary")} onClick={addExtra}><Plus size={16} /></button>
        </div>
        {extras.length === 0 && <div style={{ color: T.muted, fontSize: 13 }}>Nothing added yet.</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {extras.map((e) => (
            <div key={e.id} className="flex items-center justify-between" style={{ padding: "8px 4px", borderBottom: `1px solid ${T.bgSoft}` }}>
              <div className="flex items-center" style={{ gap: 10 }}>
                <button
                  onClick={() => setExtras((p) => p.map((x) => (x.id === e.id ? { ...x, done: !x.done } : x)))}
                  aria-label="toggle done"
                  style={{ width: 22, height: 22, borderRadius: 7, border: `1.5px solid ${e.done ? T.green : T.line}`, background: e.done ? T.green : "#fff", color: "#fff", cursor: "pointer", display: "grid", placeItems: "center" }}
                >
                  {e.done && <Check size={14} />}
                </button>
                <span style={{ fontSize: 18 }}>{e.emoji}</span>
                <span style={{ fontWeight: 600, fontSize: 14, textDecoration: e.done ? "line-through" : "none", color: e.done ? T.muted : T.ink }}>{e.name}</span>
              </div>
              <div className="flex items-center" style={{ gap: 8 }}>
                <MemberChips members={MEMBERS} value={e.buyer} onChange={(v) => setExtras((p) => p.map((x) => (x.id === e.id ? { ...x, buyer: v } : x)))} />
                <button onClick={() => setExtras((p) => p.filter((x) => x.id !== e.id))} aria-label="remove" style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Empty({ children }) {
  return <div style={cardStyle({ padding: 20, textAlign: "center", color: T.muted, fontSize: 14 })}>{children}</div>;
}

/* ============================================================================
   3) COOK
   ========================================================================== */
const CUISINE_TAG = { Indian: "🇮🇳", Mexican: "🇲🇽", Italian: "🇮🇹" };

function Cook({ recipes, status, onCook, onAddMissing, onLog, goTrack }) {
  const [filter, setFilter] = useState("All");
  const [cooked, setCooked] = useState(null);

  const withStatus = recipes
    .map((rc) => ({ rc, st: status(rc) }))
    .filter(({ rc }) => {
      if (filter === "All") return true;
      if (filter === "Veg") return rc.veg;
      if (filter === "Quick") return rc.time <= 20;
      return rc.cuisine === filter;
    })
    .sort((a, b) => (b.st.ready - a.st.ready) || (b.st.pct - a.st.pct));

  const filters = ["All", "Indian", "Mexican", "Italian", "Veg", "Quick"];

  return (
    <>
      <SectionTitle sub="Ranked against your live pantry. Cooking deducts ingredients (staples stay) — which can trip a low-stock flag and feed the shopping list.">
        What can we cook?
      </SectionTitle>

      <div className="flex" style={{ gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "7px 14px", borderRadius: 999, cursor: "pointer", fontSize: 13, fontWeight: 600,
              border: `1px solid ${filter === f ? T.brand : T.line}`, background: filter === f ? T.brand : "#fff", color: filter === f ? "#fff" : T.ink,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {cooked && (
        <div style={cardStyle({ padding: 12, marginTop: 12, background: T.greenSoft, borderColor: T.green })}>
          <div className="flex items-center justify-between" style={{ gap: 10, flexWrap: "wrap" }}>
            <div style={{ fontSize: 14, color: T.ink }}>
              <strong>{cooked} cooked.</strong> Pantry updated. Want to log it to your nutrition?
            </div>
            <div className="flex" style={{ gap: 8 }}>
              <button style={btn("ghost")} onClick={() => setCooked(null)}>Dismiss</button>
              <button style={btn("primary")} onClick={goTrack}>Go to Track</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12, marginTop: 12 }}>
        {withStatus.map(({ rc, st }) => (
          <div key={rc.id} style={cardStyle({ padding: 14, borderColor: st.ready ? T.green : T.line })}>
            <div className="flex items-center justify-between">
              <div className="flex items-center" style={{ gap: 10 }}>
                <span style={{ fontSize: 26 }}>{rc.emoji}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{rc.name}</div>
                  <div className="flex items-center" style={{ gap: 6, marginTop: 3, flexWrap: "wrap" }}>
                    <Pill bg={rc.veg ? T.greenSoft : "#FAE3DC"} color={rc.veg ? T.green : "#C4622D"}>
                      {rc.veg ? <Leaf size={11} /> : <Drumstick size={11} />} {rc.veg ? "Veg" : "Non-veg"}
                    </Pill>
                    <Pill bg={T.bgSoft} color={T.muted}>{CUISINE_TAG[rc.cuisine]} {rc.cuisine}</Pill>
                    <Pill bg={T.bgSoft} color={T.muted}><Clock size={11} /> {rc.time}m</Pill>
                  </div>
                </div>
              </div>
              {st.ready
                ? <Pill bg={T.green} color="#fff"><Check size={12} /> Ready</Pill>
                : <Pill bg={T.amberSoft} color={T.amber}>{st.pct}% in stock</Pill>}
            </div>

            <div className="flex" style={{ gap: 6, flexWrap: "wrap", marginTop: 12 }}>
              {rc.ingredients.map((ing) => {
                const have = isStaple(ing) || st.missing.indexOf(ing) === -1;
                return (
                  <Pill key={ing} bg={have ? T.greenSoft : "#fff"} color={have ? T.green : T.amber} dashed={!have} title={isStaple(ing) ? "pantry staple" : have ? "in stock" : "missing"}>
                    {ing}
                  </Pill>
                );
              })}
            </div>

            <div className="flex items-center" style={{ gap: 14, marginTop: 12, fontSize: 12, color: T.muted, flexWrap: "wrap" }}>
              <span><strong style={{ color: T.ink }}>{rc.macros.cal}</strong> kcal</span>
              <span><strong style={{ color: T.ink }}>{rc.macros.p}g</strong> protein</span>
              <span><strong style={{ color: T.ink }}>{rc.macros.c}g</strong> carbs</span>
              <span><strong style={{ color: T.ink }}>{rc.macros.f}g</strong> fibre</span>
              <span style={{ fontSize: 11, opacity: 0.8 }}>· per serving (est.)</span>
            </div>

            <div className="flex" style={{ gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <button
                style={{ ...btn("primary"), opacity: st.ready ? 1 : 0.55 }}
                disabled={!st.ready}
                onClick={() => { onCook(rc); onLog(rc); setCooked(rc.name); }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><ChefHat size={15} /> Cook this</span>
              </button>
              {st.missing.length > 0 && (
                <button style={btn("outline")} onClick={() => onAddMissing(st.missing)}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Plus size={15} /> Add {st.missing.length} missing</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 16, fontSize: 12, color: T.muted, display: "flex", gap: 6, alignItems: "flex-start" }}>
        <Info size={14} style={{ flex: "0 0 auto", marginTop: 1 }} />
        Macros are rough placeholder estimates. A production app should source these from a licensed nutrition database such as USDA FoodData Central, Edamam, or Spoonacular.
      </p>
    </>
  );
}

/* "From recipe" log helper */
function logFromRecipe(recipe, userId, setNutrition) {
  setNutrition((prev) => {
    const u = prev[userId];
    const log = { id: "l" + Date.now() + Math.round(recipe.macros.cal), name: recipe.name, emoji: recipe.emoji, ...recipe.macros, cheat: false };
    return { ...prev, [userId]: { ...u, logs: [log, ...u.logs] } };
  });
}

/* ============================================================================
   4) TRACK
   ========================================================================== */
function Ring({ value, target }) {
  const r = 64, c = 2 * Math.PI * r;
  const pct = target > 0 ? value / target : 0;
  const over = pct > 1;
  const shown = Math.min(pct, 1);
  const color = over ? T.amber : T.brand;
  return (
    <div style={{ position: "relative", width: 168, height: 168 }}>
      <svg width="168" height="168" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="84" cy="84" r={r} fill="none" stroke={T.line} strokeWidth="14" />
        <circle
          className="sa-ring" cx="84" cy="84" r={r} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - shown)}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
        <div>
          <div style={{ fontFamily: '"Bricolage Grotesque", Inter, sans-serif', fontWeight: 800, fontSize: 32, color }}>{Math.round(value)}</div>
          <div style={{ fontSize: 12, color: T.muted }}>of {target} kcal</div>
          {over && <div style={{ fontSize: 11, color: T.amber, fontWeight: 700, marginTop: 2 }}>over by {Math.round(value - target)}</div>}
        </div>
      </div>
    </div>
  );
}

function MacroBar({ label, value, target, color }) {
  const pct = Math.max(0, Math.min(1, target > 0 ? value / target : 0)) * 100;
  return (
    <div style={{ marginBottom: 12 }}>
      <div className="flex items-center justify-between" style={{ fontSize: 12, marginBottom: 4 }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span style={{ color: T.muted }}>{Math.round(value)} / {target} g</span>
      </div>
      <div style={{ background: T.line, borderRadius: 999, height: 8, overflow: "hidden" }}>
        <div className="sa-bar" style={{ width: pct + "%", height: "100%", background: color, borderRadius: 999 }} />
      </div>
    </div>
  );
}

function Track({ members, currentUser, setCurrentUser, nutrition, setNutrition, recipes }) {
  const me = members.find((m) => m.id === currentUser);
  const data = nutrition[currentUser];
  const totals = useMemo(() => {
    return data.logs.reduce((a, l) => ({ cal: a.cal + l.cal, p: a.p + l.p, c: a.c + l.c, f: a.f + l.f }), { cal: 0, p: 0, c: 0, f: 0 });
  }, [data.logs]);

  const [mode, setMode] = useState(null); // 'recipe' | 'quick' | 'snap' | 'goals'

  const addLog = (log) => setNutrition((prev) => ({ ...prev, [currentUser]: { ...prev[currentUser], logs: [{ id: "l" + Date.now(), ...log }, ...prev[currentUser].logs] } }));
  const removeLog = (id) => setNutrition((prev) => ({ ...prev, [currentUser]: { ...prev[currentUser], logs: prev[currentUser].logs.filter((l) => l.id !== id) } }));
  const setTargets = (t) => setNutrition((prev) => ({ ...prev, [currentUser]: { ...prev[currentUser], targets: t } }));

  return (
    <>
      <SectionTitle sub="A private portal per housemate — switch with the avatars below or in the header.">Nutrition</SectionTitle>

      <div className="flex items-center" style={{ gap: 8, marginBottom: 8 }}>
        {members.map((m) => <Avatar key={m.id} member={m} active={m.id === currentUser} onClick={() => setCurrentUser(m.id)} />)}
        <span style={{ marginLeft: 6, fontSize: 14, fontWeight: 700, color: me.color }}>{me.name}'s day</span>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "minmax(220px, 320px) 1fr", gap: 14 }}>
        <div style={cardStyle({ padding: 18, display: "grid", placeItems: "center" })}>
          <Ring value={totals.cal} target={data.targets.cal} />
          <div style={{ marginTop: 10, fontSize: 12, color: T.muted, textAlign: "center" }}>
            {data.logs.length} meal{data.logs.length === 1 ? "" : "s"} logged today
          </div>
        </div>

        <div style={cardStyle({ padding: 18 })}>
          <MacroBar label="Protein" value={totals.p} target={data.targets.p} color={me.color} />
          <MacroBar label="Carbs" value={totals.c} target={data.targets.c} color={T.brand} />
          <MacroBar label="Fibre" value={totals.f} target={data.targets.f} color={T.green} />
          <div className="flex" style={{ gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <button style={btn(mode === "recipe" ? "primary" : "ghost")} onClick={() => setMode(mode === "recipe" ? null : "recipe")}><ChefHat size={14} /> From recipe</button>
            <button style={btn(mode === "quick" ? "primary" : "ghost")} onClick={() => setMode(mode === "quick" ? null : "quick")}><Plus size={14} /> Quick add</button>
            <button style={btn(mode === "snap" ? "primary" : "ghost")} onClick={() => setMode(mode === "snap" ? null : "snap")}><Camera size={14} /> Snap a meal</button>
            <button style={btn(mode === "goals" ? "primary" : "outline")} onClick={() => setMode(mode === "goals" ? null : "goals")}><Pencil size={14} /> Goals</button>
          </div>
        </div>
      </div>

      {mode === "recipe" && <FromRecipe recipes={recipes} onAdd={(l) => { addLog(l); setMode(null); }} />}
      {mode === "quick" && <QuickAdd onAdd={(l) => { addLog(l); setMode(null); }} />}
      {mode === "snap" && <SnapMeal onAdd={(l) => { addLog(l); setMode(null); }} />}
      {mode === "goals" && <Goals targets={data.targets} onSave={(t) => { setTargets(t); setMode(null); }} />}

      <SectionTitle>Today's log</SectionTitle>
      {data.logs.length === 0 && <Empty>No meals logged yet — add one above.</Empty>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {data.logs.map((l) => (
          <div key={l.id} style={cardStyle({ padding: "10px 14px" })} className="flex items-center justify-between">
            <div className="flex items-center" style={{ gap: 10 }}>
              <span style={{ fontSize: 20 }}>{l.emoji}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {l.name} {l.cheat && <span style={{ marginLeft: 6 }}><Pill bg={T.amberSoft} color={T.amber}><Flame size={11} /> cheat</Pill></span>}
                </div>
                <div style={{ fontSize: 12, color: T.muted }}>{l.cal} kcal · {l.p}p / {l.c}c / {l.f}fibre</div>
              </div>
            </div>
            <button onClick={() => removeLog(l.id)} aria-label="remove meal" style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </>
  );
}

function CheatToggle({ on, set }) {
  return (
    <label className="flex items-center" style={{ gap: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
      <button
        type="button" onClick={() => set(!on)} aria-pressed={on}
        style={{ width: 42, height: 24, borderRadius: 999, border: "none", background: on ? T.amber : T.line, position: "relative", cursor: "pointer" }}
      >
        <span style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .15s" }} />
      </button>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Flame size={14} color={T.amber} /> Cheat meal</span>
    </label>
  );
}

function FromRecipe({ recipes, onAdd }) {
  const [cheat, setCheat] = useState(false);
  return (
    <div style={cardStyle({ padding: 14, marginTop: 12 })}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>Log a cooked dish</div>
      <p style={{ fontSize: 12, color: T.muted, margin: "0 0 10px" }}>Pulls the recipe's per-serving macros straight in.</p>
      <CheatToggle on={cheat} set={setCheat} />
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 8, marginTop: 12 }}>
        {recipes.map((rc) => (
          <button
            key={rc.id} onClick={() => onAdd({ name: rc.name, emoji: rc.emoji, ...rc.macros, cheat })}
            style={{ ...cardStyle({ padding: 10 }), textAlign: "left", cursor: "pointer", display: "flex", gap: 8, alignItems: "center" }}
          >
            <span style={{ fontSize: 20 }}>{rc.emoji}</span>
            <span>
              <span style={{ fontWeight: 600, fontSize: 13, display: "block" }}>{rc.name}</span>
              <span style={{ fontSize: 11, color: T.muted }}>{rc.macros.cal} kcal</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function QuickAdd({ onAdd }) {
  const [f, setF] = useState({ name: "", cal: "", p: "", c: "", f: "" });
  const [cheat, setCheat] = useState(false);
  return (
    <div style={cardStyle({ padding: 14, marginTop: 12 })}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>Quick add</div>
      <div className="grid" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 8, alignItems: "end", flexWrap: "wrap" }}>
        <Field label="Meal"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Protein shake" style={inputStyle} /></Field>
        <Field label="kcal"><input value={f.cal} onChange={(e) => setF({ ...f, cal: e.target.value })} inputMode="numeric" style={inputStyle} /></Field>
        <Field label="Protein"><input value={f.p} onChange={(e) => setF({ ...f, p: e.target.value })} inputMode="numeric" style={inputStyle} /></Field>
        <Field label="Carbs"><input value={f.c} onChange={(e) => setF({ ...f, c: e.target.value })} inputMode="numeric" style={inputStyle} /></Field>
        <Field label="Fibre"><input value={f.f} onChange={(e) => setF({ ...f, f: e.target.value })} inputMode="numeric" style={inputStyle} /></Field>
      </div>
      <div className="flex items-center justify-between" style={{ marginTop: 12, flexWrap: "wrap", gap: 10 }}>
        <CheatToggle on={cheat} set={setCheat} />
        <button
          style={{ ...btn("primary"), opacity: f.name.trim() ? 1 : 0.5 }} disabled={!f.name.trim()}
          onClick={() => onAdd({ name: f.name.trim(), emoji: "🍽️", cal: +f.cal || 0, p: +f.p || 0, c: +f.c || 0, f: +f.f || 0, cheat })}
        >Add to log</button>
      </div>
    </div>
  );
}

function SnapMeal({ onAdd }) {
  // estimate -> confirm flow. We DO NOT fake recognition: we pre-fill a clearly
  // labelled sample estimate that the person edits and confirms.
  const [est, setEst] = useState({ name: "Grain bowl (sample estimate)", emoji: "🥗", cal: 540, p: 24, c: 62, f: 11 });
  const [cheat, setCheat] = useState(false);
  return (
    <div style={cardStyle({ padding: 14, marginTop: 12 })}>
      <div className="flex items-center" style={{ gap: 10, marginBottom: 8 }}>
        <div style={{ width: 56, height: 56, borderRadius: 12, background: T.bgSoft, display: "grid", placeItems: "center", border: `1px dashed ${T.line}` }}>
          <Camera size={22} color={T.muted} />
        </div>
        <div>
          <div style={{ fontWeight: 700 }}>Snap a meal</div>
          <div style={{ fontSize: 12, color: T.muted }}>Estimate → confirm</div>
        </div>
      </div>

      <div style={{ background: T.amberSoft, color: "#8a5d12", borderRadius: 10, padding: "10px 12px", fontSize: 12, display: "flex", gap: 8, alignItems: "flex-start" }}>
        <Info size={15} style={{ flex: "0 0 auto", marginTop: 1 }} />
        <span>
          This demo does <strong>not</strong> run real recognition. A production version would pass the photo to a vision model, look the foods up in a licensed nutrition database, and present an estimate. The numbers below are a placeholder sample — always hand-confirm them.
        </span>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 8, alignItems: "end", marginTop: 12, flexWrap: "wrap" }}>
        <Field label="Detected (edit me)"><input value={est.name} onChange={(e) => setEst({ ...est, name: e.target.value })} style={inputStyle} /></Field>
        <Field label="kcal"><input value={est.cal} onChange={(e) => setEst({ ...est, cal: +e.target.value || 0 })} inputMode="numeric" style={inputStyle} /></Field>
        <Field label="Protein"><input value={est.p} onChange={(e) => setEst({ ...est, p: +e.target.value || 0 })} inputMode="numeric" style={inputStyle} /></Field>
        <Field label="Carbs"><input value={est.c} onChange={(e) => setEst({ ...est, c: +e.target.value || 0 })} inputMode="numeric" style={inputStyle} /></Field>
        <Field label="Fibre"><input value={est.f} onChange={(e) => setEst({ ...est, f: +e.target.value || 0 })} inputMode="numeric" style={inputStyle} /></Field>
      </div>
      <div className="flex items-center justify-between" style={{ marginTop: 12, flexWrap: "wrap", gap: 10 }}>
        <CheatToggle on={cheat} set={setCheat} />
        <button style={btn("primary")} onClick={() => onAdd({ ...est, cheat })}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Check size={15} /> Confirm estimate</span>
        </button>
      </div>
    </div>
  );
}

function Goals({ targets, onSave }) {
  const [t, setT] = useState(targets);
  return (
    <div style={cardStyle({ padding: 14, marginTop: 12 })}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>Daily goals</div>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, alignItems: "end", flexWrap: "wrap" }}>
        <Field label="Calories"><input value={t.cal} onChange={(e) => setT({ ...t, cal: +e.target.value || 0 })} inputMode="numeric" style={inputStyle} /></Field>
        <Field label="Protein (g)"><input value={t.p} onChange={(e) => setT({ ...t, p: +e.target.value || 0 })} inputMode="numeric" style={inputStyle} /></Field>
        <Field label="Carbs (g)"><input value={t.c} onChange={(e) => setT({ ...t, c: +e.target.value || 0 })} inputMode="numeric" style={inputStyle} /></Field>
        <Field label="Fibre (g)"><input value={t.f} onChange={(e) => setT({ ...t, f: +e.target.value || 0 })} inputMode="numeric" style={inputStyle} /></Field>
      </div>
      <button style={{ ...btn("primary"), marginTop: 12 }} onClick={() => onSave(t)}>Save goals</button>
    </div>
  );
}

/* ============================================================================
   5) SPLIT
   ========================================================================== */
const CATEGORIES = ["Rent", "Utilities", "Groceries", "Household", "Other"];
const CAT_EMOJI = { Rent: "🏠", Utilities: "💡", Groceries: "🛒", Household: "🧽", Other: "📦" };

function Split({ members, expenses, setExpenses, currentUser }) {
  const [showAdd, setShowAdd] = useState(false);
  const blank = { desc: "", amount: "", paidBy: currentUser, category: "Groceries", participants: members.map((m) => m.id) };
  const [f, setF] = useState(blank);
  const name = (id) => members.find((m) => m.id === id)?.name;
  const color = (id) => members.find((m) => m.id === id)?.color;

  const balances = useMemo(() => {
    const net = {};
    members.forEach((m) => (net[m.id] = 0));
    expenses.forEach((e) => {
      const share = e.amount / e.participants.length;
      net[e.paidBy] += e.amount;
      e.participants.forEach((p) => (net[p] -= share));
    });
    return members.map((m) => ({ id: m.id, name: m.name, color: m.color, net: Math.round(net[m.id] * 100) / 100 }));
  }, [expenses, members]);

  const settlements = useMemo(() => {
    const creditors = balances.filter((b) => b.net > 0.01).map((b) => ({ ...b }));
    const debtors = balances.filter((b) => b.net < -0.01).map((b) => ({ ...b, net: -b.net }));
    creditors.sort((a, b) => b.net - a.net);
    debtors.sort((a, b) => b.net - a.net);
    const tx = []; let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const amt = Math.min(debtors[i].net, creditors[j].net);
      tx.push({ from: debtors[i].id, to: creditors[j].id, amt: Math.round(amt * 100) / 100 });
      debtors[i].net -= amt; creditors[j].net -= amt;
      if (debtors[i].net < 0.01) i++;
      if (creditors[j].net < 0.01) j++;
    }
    return tx;
  }, [balances]);

  const total = expenses.reduce((a, e) => a + e.amount, 0);

  const toggleP = (id) => setF((p) => ({ ...p, participants: p.participants.includes(id) ? p.participants.filter((x) => x !== id) : [...p.participants, id] }));

  const save = () => {
    const amt = parseFloat(f.amount);
    if (!f.desc.trim() || !amt || f.participants.length === 0) return;
    setExpenses((p) => [ex(f.desc.trim(), Math.round(amt * 100) / 100, f.paidBy, f.category, f.participants, "Jun " + (15 + p.length)), ...p]);
    setF(blank); setShowAdd(false);
  };

  return (
    <>
      <SectionTitle sub={`${expenses.length} expenses · ${money(total)} through the house this month`}>Shared expenses</SectionTitle>

      {/* balances */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 10 }}>
        {balances.map((b) => {
          const owed = b.net >= 0;
          return (
            <div key={b.id} style={cardStyle({ padding: 12 })}>
              <div className="flex items-center" style={{ gap: 8, marginBottom: 8 }}>
                <span style={{ width: 26, height: 26, borderRadius: "50%", background: b.color, color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 12 }}>{b.name[0]}</span>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{b.name}</span>
              </div>
              <div style={{ fontFamily: '"Bricolage Grotesque", Inter, sans-serif', fontWeight: 800, fontSize: 20, color: Math.abs(b.net) < 0.01 ? T.muted : owed ? T.green : T.amber }}>
                {Math.abs(b.net) < 0.01 ? "settled" : money(Math.abs(b.net))}
              </div>
              <div style={{ fontSize: 11, color: T.muted }}>{Math.abs(b.net) < 0.01 ? "all square" : owed ? "is owed" : "owes"}</div>
            </div>
          );
        })}
      </div>

      {/* settle up */}
      <div style={cardStyle({ padding: 16, marginTop: 14, background: T.brandSoft, borderColor: T.brand })}>
        <div className="flex items-center" style={{ gap: 8, marginBottom: 10 }}>
          <CircleDollarSign size={18} color={T.brand} />
          <span style={{ fontWeight: 700, fontSize: 15, color: T.brand }}>Settle up — fewest payments</span>
        </div>
        {settlements.length === 0 ? (
          <div style={{ color: T.brand, fontSize: 14 }}>Everyone's square. 🎉</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {settlements.map((s, k) => (
              <div key={k} className="flex items-center" style={{ gap: 10, background: "#fff", borderRadius: 10, padding: "9px 12px", flexWrap: "wrap" }}>
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: color(s.from), color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11 }}>{name(s.from)[0]}</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{name(s.from)}</span>
                <ArrowRight size={16} color={T.muted} />
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: color(s.to), color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11 }}>{name(s.to)[0]}</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{name(s.to)}</span>
                <span style={{ marginLeft: "auto", fontWeight: 800, color: T.brand }}>{money(s.amt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* add expense */}
      <div className="flex items-center justify-between" style={{ marginTop: 20, marginBottom: 10 }}>
        <h2 style={{ fontFamily: '"Bricolage Grotesque", Inter, sans-serif', fontWeight: 700, fontSize: 20, margin: 0 }}>Ledger</h2>
        <button style={btn("primary")} onClick={() => setShowAdd((s) => !s)}><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Plus size={16} /> Add expense</span></button>
      </div>

      {showAdd && (
        <div style={cardStyle({ padding: 14, marginBottom: 12 })}>
          <div className="grid" style={{ gridTemplateColumns: "2fr 1fr", gap: 8 }}>
            <Field label="Description"><input value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} placeholder="e.g. Water bill" style={inputStyle} /></Field>
            <Field label="Amount"><input value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} inputMode="decimal" placeholder="0.00" style={inputStyle} /></Field>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
            <Field label="Paid by">
              <select value={f.paidBy} onChange={(e) => setF({ ...f, paidBy: e.target.value })} style={inputStyle}>
                {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </Field>
            <Field label="Category">
              <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} style={inputStyle}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ marginTop: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: T.muted, display: "block", marginBottom: 6 }}>Split between (equal)</span>
            <div className="flex" style={{ gap: 6, flexWrap: "wrap" }}>
              {members.map((m) => {
                const on = f.participants.includes(m.id);
                return (
                  <button key={m.id} onClick={() => toggleP(m.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 999, border: `1px solid ${on ? m.color : T.line}`, background: on ? m.color : "#fff", color: on ? "#fff" : T.muted, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                    {on && <Check size={13} />} {m.name}
                  </button>
                );
              })}
            </div>
          </div>
          <button style={{ ...btn("primary"), marginTop: 12 }} onClick={save}>Save expense</button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {expenses.map((e) => {
          const share = e.amount / e.participants.length;
          return (
            <div key={e.id} style={cardStyle({ padding: "11px 14px" })} className="flex items-center justify-between">
              <div className="flex items-center" style={{ gap: 11 }}>
                <span style={{ fontSize: 22 }}>{CAT_EMOJI[e.category]}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{e.desc}</div>
                  <div style={{ fontSize: 12, color: T.muted }}>
                    {name(e.paidBy)} paid · {e.category} · split {e.participants.length} ways ({money(share)} ea) · {e.when}
                  </div>
                </div>
              </div>
              <div className="flex items-center" style={{ gap: 10 }}>
                <span style={{ fontWeight: 800, fontSize: 15 }}>{money(e.amount)}</span>
                <button onClick={() => setExpenses((p) => p.filter((x) => x.id !== e.id))} aria-label="delete expense" style={{ background: "none", border: "none", color: T.muted, cursor: "pointer" }}><Trash2 size={16} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ============================================================================
   Fonts + motion
   ========================================================================== */
function FontStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Inter:wght@400;500;600;700&display=swap');
      * { box-sizing: border-box; }
      body { margin: 0; }
      input, select, button { font-family: Inter, system-ui, sans-serif; }
      input:focus-visible, select:focus-visible, button:focus-visible {
        outline: 3px solid ${T.green}; outline-offset: 2px;
      }
      ::placeholder { color: ${T.muted}; opacity: 0.8; }
      .sa-bar, .sa-ring { transition: width .35s ease, stroke-dashoffset .5s ease; }
      @media (prefers-reduced-motion: reduce) {
        * { transition: none !important; animation: none !important; }
      }
      *::-webkit-scrollbar { height: 6px; width: 6px; }
      *::-webkit-scrollbar-thumb { background: ${T.line}; border-radius: 999px; }
    `}</style>
  );
}
