import { useState } from "react";

const ACTIONS = {
  FOLD:     { label: "FOLD",    color: "#c0392b", glow: "rgba(192,57,43,0.7)" },
  CHECK:    { label: "CHECK",   color: "#27ae60", glow: "rgba(39,174,96,0.7)" },
  CALL:     { label: "CALL",    color: "#2980b9", glow: "rgba(41,128,185,0.7)" },
  RAISE:    { label: "RAISE",   color: "#d4a017", glow: "rgba(212,160,23,0.7)" },
  "ALL-IN": { label: "ALL-IN",  color: "#8e44ad", glow: "rgba(142,68,173,0.7)" },
  null:     null,
};

const DEMO_PLAYERS = [
  { id: 1, name: "Marshian",    chips: 29686,  avatar: "🐉", action: "FOLD",   isActive: false },
  { id: 2, name: "DragonKing",  chips: 54200,  avatar: "🦁", action: "RAISE",  isActive: true  },
  { id: 3, name: "AceHunter",   chips: 12450,  avatar: "🦊", action: "CALL",   isActive: false },
  { id: 4, name: "BluffMaster", chips: 88000,  avatar: "🐺", action: null,     isActive: false },
  { id: 5, name: "RoyalFlush",  chips: 3100,   avatar: "🦅", action: "CHECK",  isActive: false },
];

function formatChips(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  return n.toLocaleString();
}

function CardBack({ rotate = 0, extraStyle = {} }) {
  return (
    <div style={{
      width: "56px",
      height: "78px",
      borderRadius: "8px",
      background: "linear-gradient(160deg, #4a0060 0%, #200030 100%)", // Dark violet
      border: "2px solid rgba(255,255,255,0.4)", // Adjusted border for contrast
      boxShadow: "0 8px 20px rgba(0,0,0,0.8), inset 0 0 0 4px rgba(50,0,80,0.15)", // Adjusted shadow for violet
      transform: `rotate(${rotate}deg)`,
      position: "absolute",
      overflow: "hidden",
      ...extraStyle,
    }}>
      {/* Dos violet foncé avec motif losange et symbole ♠ */}
      <div style={{ // Simplified pattern div
        position: "absolute", inset: "5px",
        // Removed complex gradient pattern, relying on background color and center symbol
        borderRadius: "4px",
        border: "1.5px solid rgba(255,255,255,0.3)", // Subtle white border for inner element
      }} />
      {/* Symbole centre */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "22px", opacity: 0.55, color: "#fff", // White symbol
        textShadow: "0 0 8px rgba(255,255,255,0.6)", // White shadow for symbol
      }}>♠</div> {/* Spade symbol */}
      {/* Coins ornementaux */}
      {["topleft","topright","bottomleft","bottomright"].map((pos, i) => (
        <div key={pos} style={{
          position: "absolute",
          top: i < 2 ? "5px" : "auto",
          bottom: i >= 2 ? "5px" : "auto",
          left: i % 2 === 0 ? "5px" : "auto",
          right: i % 2 === 1 ? "5px" : "auto",
          fontSize: "9px", color: "rgba(255,255,255,0.5)", // White ornamentals
          lineHeight: 1,
        }}>♠</div> // Using spade symbol for ornamentals
      ))}
    </div>
  );
}

function PlayerSeat({ player }) {
  const action = ACTIONS[player.action];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>


      {/* Badge action */}
      <div style={{
        height: "28px", minWidth: "80px",
        opacity: action ? 1 : 0,
        transition: "opacity 0.3s",
        background: action
          ? `linear-gradient(135deg, ${action.color}, ${action.color}cc)`
          : "transparent",
        borderRadius: "8px",
        border: action ? "1px solid rgba(255,255,255,0.2)" : "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "0 14px",
        boxShadow: action ? `0 0 14px ${action.glow}, 0 3px 8px rgba(0,0,0,0.5)` : "none",
        marginBottom: "8px",
        zIndex: 10, position: "relative",
      }}>
        <span style={{
          color: "#fff", fontSize: "12px", fontWeight: "900",
          letterSpacing: "2px", fontFamily: "'Playfair Display', serif",
          textShadow: "0 1px 3px rgba(0,0,0,0.5)",
        }}>{action?.label}</span>
      </div>

        {/* Bloc superposé */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* ── Avatar (z=2, caché derrière les cartes en bas) ── */}
        <div style={{
          width: "90px", height: "90px", borderRadius: "50%",
          background: "radial-gradient(circle at 35% 30%, #3a2a0a, #1a0f00)",
          border: player.isActive
            ? "3px solid #d4a017"
            : "3px solid rgba(180,140,60,0.4)",
          boxShadow: player.isActive
            ? "0 0 28px rgba(212,160,23,0.8), 0 0 8px rgba(212,160,23,0.4), 0 8px 20px rgba(0,0,0,0.7)"
            : "0 8px 20px rgba(0,0,0,0.7), inset 0 2px 4px rgba(255,200,80,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "42px",
          position: "relative", zIndex: 2,
          marginBottom: "-32px",
          transition: "box-shadow 0.3s, border-color 0.3s",
        }}>
          {player.avatar}
          {/* Anneau or décoratif */}
          <div style={{
            position: "absolute", inset: "-6px", borderRadius: "50%",
            border: "1px solid rgba(212,160,23,0.2)",
          }} />
          {player.isActive && (
            <div style={{
              position: "absolute", inset: "-8px", borderRadius: "50%",
              border: "2px solid rgba(212,160,23,0.35)",
              animation: "pulse-ring 1.6s ease-out infinite",
            }} />
          )}
        </div>

        {/* ── Cartes (z=3, au-dessus de l'avatar) ── */}
        <div style={{
          position: "relative",
          width: "106px", height: "84px",
          zIndex: 3,
          marginBottom: "-22px",
        }}>
          <CardBack rotate={-13} extraStyle={{
            left: "0px", top: "6px", zIndex: 1,
            boxShadow: "-4px 8px 20px rgba(0,0,0,0.9)",
          }} />
          <CardBack rotate={13} extraStyle={{
            right: "0px", top: "6px", zIndex: 2,
            boxShadow: "4px 8px 20px rgba(0,0,0,0.9)",
          }} />
        </div>

        {/* ── Capsule nom/solde (z=1) ── */}
        <div style={{
          background: "rgba(0, 0, 0, 0.7)", // Semi-transparent black
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "8px 8px 30px 30px", // Slightly rounded top, very rounded bottom
          padding: "16px 20px",
          minWidth: "140px",
          textAlign: "center",
          position: "relative", zIndex: 1,
        }}>
          {/* Nom joueur */}
          <div style={{
            color: "#fff", // White name
            fontSize: "14px", fontWeight: "700",
            fontFamily: "sans-serif",
            letterSpacing: "0.5px",
            marginBottom: "8px",
          }}>{player.name}</div>

          {/* Séparateur fin */}
          <div style={{
            height: "1px",
            background: "rgba(255, 255, 255, 0.2)",
            marginBottom: "8px",
          }} />

          {/* Solde en jetons en blanc gras */}
          <div style={{
            color: "#fff", // White balance
            fontSize: "16px", fontWeight: "800",
            fontFamily: "sans-serif",
          }}>
            {formatChips(player.chips)}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function PokerTable() {
  const [players, setPlayers] = useState(DEMO_PLAYERS);

  const setAction = (id, action) =>
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, action } : p));
  const toggleActive = (id) =>
    setPlayers(prev => prev.map(p => ({ ...p, isActive: p.id === id ? !p.isActive : false })));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800;900&family=Rajdhani:wght@500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse-ring {
          0%   { transform: scale(1);    opacity: 0.9; }
          100% { transform: scale(1.45); opacity: 0;   }
        }
        body { background: #0d1f0d; }
        .seat-row { display: flex; gap: 40px; flex-wrap: wrap; justify-content: center; }
        .controls { display: flex; gap: 5px; flex-wrap: wrap; justify-content: center; margin-top: 16px; }
        .ctrl-btn {
          padding: 4px 10px; border-radius: 6px;
          border: 1px solid rgba(212,160,23,0.25);
          background: rgba(212,160,23,0.07);
          color: rgba(212,160,23,0.7); font-size: 11px;
          font-family: 'Rajdhani', sans-serif; font-weight: 600;
          letter-spacing: 1px; cursor: pointer; transition: all 0.2s;
        }
        .ctrl-btn:hover { background: rgba(212,160,23,0.16); color: #d4a017; }
        .ctrl-btn.on { border-color: #d4a017; color: #d4a017; background: rgba(212,160,23,0.15); }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: `
          radial-gradient(ellipse at 50% 50%, #1a3a1a 0%, #0d220d 45%, #060e06 100%)
        `,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "50px 24px", gap: "52px",
      }}>

        {/* Table felt texture */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none",
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(30,80,30,0.3) 0%, transparent 70%),
            repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.03) 3px, rgba(0,0,0,0.03) 4px),
            repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.03) 3px, rgba(0,0,0,0.03) 4px)
          `,
        }} />

        {/* Titre */}
        <div style={{ textAlign: "center", position: "relative" }}>
          <div style={{
            fontSize: "11px", letterSpacing: "6px", color: "rgba(212,160,23,0.6)",
            fontFamily: "'Rajdhani', sans-serif", fontWeight: "600",
            marginBottom: "6px",
          }}>✦ GRAND CASINO ✦</div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "32px", fontWeight: "900",
            color: "#d4a017", letterSpacing: "5px",
            textShadow: "0 0 30px rgba(212,160,23,0.5), 0 2px 8px rgba(0,0,0,0.8)",
          }}>POKER TABLE</h1>
          <div style={{
            marginTop: "6px", height: "1px", width: "200px", margin: "8px auto 0",
            background: "linear-gradient(90deg, transparent, rgba(212,160,23,0.5), transparent)",
          }} />
        </div>

        {/* Joueurs */}
        <div className="seat-row">
          {players.map(player => (
            <div key={player.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <PlayerSeat player={player} />
              <div className="controls">
                {["FOLD","CHECK","CALL","RAISE","ALL-IN", null].map(act => (
                  <button key={String(act)}
                    className={`ctrl-btn ${player.action === act ? "on" : ""}`}
                    onClick={() => setAction(player.id, act)}
                  >{act ?? "–"}</button>
                ))}
              </div>
              <button
                className={`ctrl-btn ${player.isActive ? "on" : ""}`}
                style={{ marginTop: "6px" }}
                onClick={() => toggleActive(player.id)}
              >{player.isActive ? "★ ACTIF" : "Set Actif"}</button>
            </div>
          ))}
        </div>

        <p style={{ color: "rgba(212,160,23,0.25)", fontSize: "11px", letterSpacing: "2px", fontFamily: "'Rajdhani', sans-serif" }}>
          ✦ CLIQUEZ LES BOUTONS POUR TESTER LES ACTIONS ✦
        </p>
      </div>
    </>
  );
}
