import { runEdgeScan, runMarginScan } from "../commands/scanCommand.js";

const [cmd, arg] = process.argv.slice(2);
if (cmd === "edges") runEdgeScan(arg ? Number(arg) : undefined);
else if (cmd === "margin") runMarginScan();
else {
  console.log("WC2026 Betting Value Scanner");
  console.log("  edges [minEdge]   Scan all fixtures for +EV picks");
  console.log("  margin          Show bookmaker overround per fixture");
}
