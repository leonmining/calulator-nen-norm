const STATUS_LABEL = {
  voldoet: "Voldoet",
  voldoet_niet: "Voldoet niet",
  aandachtspunt: "Aandachtspunt",
  nvt: "N.v.t."
};

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function statusTag(status) {
  const label = STATUS_LABEL[status] || status || "—";
  return `<span class="tag status-${esc(status)}">${esc(label)}</span>`;
}

function renderCheck(check) {
  const rows = (check.regels || []).map(r => `
    <tr>
      <td class="onderdeel" data-label="Onderdeel">${esc(r.onderdeel)}</td>
      <td class="bepaling" data-label="NEN 1010-bepaling">${esc(r.nen1010_bepaling)}</td>
      <td data-label="Eis volgens NEN 1010">${esc(r.eis)}</td>
      <td data-label="Bevinding in document">${esc(r.bevinding)}</td>
      <td data-label="Status">${statusTag(r.status)}</td>
      <td data-label="Advies / actie">${esc(r.advies)}</td>
    </tr>`).join("");

  const pdfLink = check.pdf
    ? ` &middot; <a href="${esc(check.pdf)}" target="_blank" rel="noopener">bron-PDF</a>`
    : "";
  const voorbeeldTag = check.voorbeeld ? ` <span class="tag voorbeeld">Voorbeeld</span>` : "";

  return `
  <section class="card" id="${esc(check.id)}">
    <div class="card-head">
      <h3>${esc(check.document)}${voorbeeldTag}</h3>
      <div class="meta"><strong>Leverancier:</strong> ${esc(check.leverancier || "—")}</div>
      <div class="meta"><strong>Versie:</strong> ${esc(check.documentversie || "—")}</div>
      <div class="meta"><strong>Gecontroleerd:</strong> ${esc(check.datum_gecontroleerd || "—")}${pdfLink}</div>
      <div class="meta"><strong>Eindoordeel:</strong> ${statusTag(check.eindoordeel)}</div>
    </div>
    <div class="card-body">
      ${check.samenvatting ? `<p class="summary">${esc(check.samenvatting)}</p>` : ""}
      <table>
        <thead>
          <tr>
            <th>Onderdeel</th><th>NEN 1010-bepaling</th><th>Eis volgens NEN 1010</th>
            <th>Bevinding in document</th><th>Status</th><th>Advies / actie</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </section>`;
}

async function init() {
  const root = document.getElementById("checks");
  try {
    const res = await fetch("data/checks.json", { cache: "no-store" });
    const data = await res.json();
    document.getElementById("norm-name").textContent = data.norm || "NEN 1010";
    const checks = data.checks || [];
    if (!checks.length) {
      root.innerHTML = `<div class="card"><p class="summary">Nog geen controles toegevoegd.</p></div>`;
      return;
    }
    root.innerHTML = checks.map(renderCheck).join("");
  } catch (e) {
    root.innerHTML = `<div class="card"><p class="summary">Kon controles niet laden: ${esc(e.message)}</p></div>`;
  }
}

document.addEventListener("DOMContentLoaded", init);
