"use strict";
const money = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = (s) => { const n = Number(String(s).replace(/[\s,]/g, "")); return Number.isFinite(n) && n >= 0 ? n : 0; };

const $ = (id) => document.getElementById(id);

function schedule(P, r, n, extra) {
  const pay = r ? (P * r) / (1 - (1 + r) ** -n) : P / n;
  let bal = P, month = 0, totalInt = 0;
  const years = [];
  while (bal > 0.005 && month < 1200) {
    const int = bal * r;
    const prin = Math.min(bal, pay - int + extra);
    bal -= prin;
    totalInt += int;
    month++;
    const y = Math.ceil(month / 12);
    years[y - 1] ??= { p: 0, i: 0, bal: 0 };
    years[y - 1].p += prin;
    years[y - 1].i += int;
    years[y - 1].bal = Math.max(0, bal);
  }
  return { pay, months: month, totalInt, years };
}

function run() {
  const P = num($("amount").value), rate = num($("rate").value) / 100 / 12, n = Math.round(num($("years").value) * 12), extra = num($("extra").value);
  if (!P || !n) return;
  const plan = schedule(P, rate, n, extra);
  const base = extra ? schedule(P, rate, n, 0) : plan;
  $("monthly").textContent = money.format(plan.pay + extra);
  $("interest").textContent = money.format(plan.totalInt);
  $("total").textContent = money.format(P + plan.totalInt);
  const y = Math.floor(plan.months / 12), m = plan.months % 12;
  $("payoff").textContent = `${y ? `${y} yr` : ""}${y && m ? " " : ""}${m ? `${m} mo` : ""}`;
  $("saved").textContent = extra ? `Paying ${money.format(extra)} extra saves ${money.format(base.totalInt - plan.totalInt)} in interest and ${base.months - plan.months} months.` : "";
  $("rows").innerHTML = plan.years.map((r, i) => `<tr><td>${i + 1}</td><td>${money.format(r.p)}</td><td>${money.format(r.i)}</td><td>${money.format(r.bal)}</td></tr>`).join("");
}
$("form").addEventListener("input", run);
$("form").addEventListener("submit", (e) => e.preventDefault());
run();
