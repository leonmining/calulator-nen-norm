/* NEN 1010 heuristische scanner — volledig client-side.
   Leest PDF-tekst met pdf.js en zoekt naar de belangrijkste NEN 1010-onderwerpen.
   Let op: dit is een VOORLOPIGE indicatie op basis van trefwoorden, geen formele toetsing. */

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const NEN_REGELS = [
  {
    onderdeel: "Expliciete verwijzing NEN 1010",
    bepaling: "Algemeen / scope",
    eis: "Document verwijst expliciet naar NEN 1010 als toe te passen norm.",
    patterns: [/nen\s?-?\s?1010/i],
    adviesGevonden: "Verwijzing aanwezig. Controleer of de juiste versie (bv. NEN 1010:2020 incl. correctieblad) is benoemd.",
    adviesOntbreekt: "Geen expliciete NEN 1010-verwijzing aangetroffen. Voeg toe: 'conform NEN 1010:2020'.",
    gevondenStatus: "voldoet"
  },
  {
    onderdeel: "Bescherming tegen elektrische schok",
    bepaling: "Deel 4-41",
    eis: "Automatische uitschakeling / aanvullende bescherming (o.a. 30 mA aardlekbeveiliging waar vereist).",
    patterns: [/aardlek/i, /\b30\s?mA\b/i, /\bRCD\b/i, /aardlekschakelaar/i, /automatische uitschakeling/i, /elektrische schok/i],
    adviesGevonden: "Onderwerp benoemd. Verifieer of 30 mA aardlekbeveiliging voor de juiste eindgroepen is geëist.",
    adviesOntbreekt: "Geen bepaling over bescherming tegen elektrische schok / aardlekbeveiliging. Aanvullen conform deel 4-41."
  },
  {
    onderdeel: "Aarding en vereffening",
    bepaling: "Deel 5-54",
    eis: "Aarding, beschermingsleidingen en (hoofd)vereffening conform NEN 1010 deel 5-54.",
    patterns: [/aarding/i, /vereffening/i, /beschermingsleiding/i, /\bPE-?leiding\b/i, /\bPEN\b/i],
    adviesGevonden: "Onderwerp benoemd. Borg meetrapport aardingsweerstand bij oplevering.",
    adviesOntbreekt: "Geen bepaling over aarding/vereffening. Aanvullen conform deel 5-54."
  },
  {
    onderdeel: "Overstroombeveiliging",
    bepaling: "Deel 4-43 / 5-53",
    eis: "Beveiliging tegen overbelasting en kortsluiting (installatieautomaten / smeltveiligheden).",
    patterns: [/overstroom/i, /overbelasting/i, /kortsluiting/i, /installatieautomaat/i, /smeltveiligheid/i, /\bMCB\b/i, /selectiviteit/i],
    adviesGevonden: "Onderwerp benoemd. Verifieer selectiviteit en uitschakelvermogen (kA).",
    adviesOntbreekt: "Geen bepaling over overstroombeveiliging. Aanvullen conform deel 4-43."
  },
  {
    onderdeel: "Kabels en leidingen",
    bepaling: "Deel 5-52",
    eis: "Keuze, belastbaarheid en installatie van kabels/leidingen conform deel 5-52.",
    patterns: [/kabel/i, /leiding(en)?/i, /belastbaarheid/i, /aderdoorsnede/i, /\bmm2\b/i, /spanningsval/i],
    adviesGevonden: "Onderwerp benoemd. Verifieer dimensionering en toelaatbare spanningsval.",
    adviesOntbreekt: "Geen bepaling over kabels/leidingen en belastbaarheid. Aanvullen conform deel 5-52."
  },
  {
    onderdeel: "Schakel- en verdeelinrichtingen",
    bepaling: "Deel 5-53 / NEN-EN-IEC 61439",
    eis: "Verdeelinrichtingen conform NEN 1010 deel 5-53 (en 61439-serie).",
    patterns: [/verdeelinrichting/i, /verdeelkast/i, /verdeler/i, /schakelmateriaal/i, /61439/i, /hoofdverdeel/i],
    adviesGevonden: "Onderwerp benoemd. Controleer verwijzing naar NEN-EN-IEC 61439.",
    adviesOntbreekt: "Geen bepaling over verdeelinrichtingen. Aanvullen conform deel 5-53."
  },
  {
    onderdeel: "Bijzondere ruimten / installaties",
    bepaling: "Deel 7",
    eis: "Aanvullende eisen voor bijzondere ruimten (badruimte, medisch, buiten, laadpunten, e.d.).",
    patterns: [/badruimte/i, /badkamer/i, /zwembad/i, /medische?\s/i, /laadpunt/i, /laadpaal/i, /zone\s?[0-3]\b/i, /bijzondere ruimte/i],
    adviesGevonden: "Onderwerp benoemd. Verifieer of de juiste zone-eisen uit deel 7 zijn opgenomen.",
    adviesOntbreekt: "Geen bepaling over bijzondere ruimten. Beoordeel of deel 7 van toepassing is.",
    gevondenStatus: "aandachtspunt",
    ontbreektStatus: "nvt"
  },
  {
    onderdeel: "Inspectie en oplevering",
    bepaling: "Deel 6",
    eis: "Eerste inspectie en meetrapport conform NEN 1010 deel 6 bij oplevering.",
    patterns: [/inspectie/i, /meetrapport/i, /oplevering/i, /opleverdossier/i, /eerste inspectie/i, /keuring/i],
    adviesGevonden: "Onderwerp benoemd. Borg dat meetrapport conform deel 6 wordt geëist.",
    adviesOntbreekt: "Geen bepaling over inspectie/oplevering. Aanvullen conform deel 6."
  }
];

async function extractPdfText(file) {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(it => it.str).join(" ") + "\n";
  }
  return text;
}

function scanText(text) {
  return NEN_REGELS.map(regel => {
    let match = null;
    for (const p of regel.patterns) {
      const m = text.match(p);
      if (m) { match = m[0].trim(); break; }
    }
    const gevonden = Boolean(match);
    const status = gevonden
      ? (regel.gevondenStatus || "aandachtspunt")
      : (regel.ontbreektStatus || "voldoet_niet");
    return {
      onderdeel: regel.onderdeel,
      nen1010_bepaling: regel.bepaling,
      eis: regel.eis,
      bevinding: gevonden
        ? `Onderwerp aangetroffen in document (trefwoord: "${match}").`
        : "Onderwerp niet aangetroffen in de tekst.",
      status,
      advies: gevonden ? regel.adviesGevonden : regel.adviesOntbreekt
    };
  });
}

function bepaalEindoordeel(regels) {
  if (regels.some(r => r.status === "voldoet_niet")) return "voldoet_niet";
  if (regels.some(r => r.status === "aandachtspunt")) return "aandachtspunt";
  return "voldoet";
}

function renderScanResult(file, regels) {
  const eind = bepaalEindoordeel(regels);
  const check = {
    id: "scan",
    document: file.name,
    leverancier: "—",
    documentversie: "—",
    datum_gecontroleerd: new Date().toISOString().slice(0, 10),
    samenvatting: "Voorlopige heuristische scan op basis van trefwoorden — bevindingen inhoudelijk laten verifiëren door een NEN 1010-deskundige. Er is niets geüpload naar een server; de analyse vond plaats in je browser.",
    eindoordeel: eind,
    regels
  };
  // hergebruik renderCheck uit app.js
  document.getElementById("scan-result").innerHTML = renderCheck(check);
}

async function handleFile(file) {
  const statusEl = document.getElementById("scan-status");
  const resultEl = document.getElementById("scan-result");
  resultEl.innerHTML = "";
  if (!file || file.type !== "application/pdf") {
    statusEl.textContent = "Kies een PDF-bestand.";
    return;
  }
  statusEl.textContent = `Bezig met lezen van "${file.name}"…`;
  try {
    const text = await extractPdfText(file);
    if (text.replace(/\s/g, "").length < 30) {
      statusEl.innerHTML = "Weinig of geen tekst gevonden. Is dit een gescande PDF (afbeelding)? Dan kan de scanner de inhoud niet lezen.";
      return;
    }
    const regels = scanText(text);
    statusEl.textContent = `Scan gereed voor "${file.name}". Resultaat hieronder.`;
    renderScanResult(file, regels);
  } catch (e) {
    statusEl.textContent = "Kon de PDF niet verwerken: " + e.message;
  }
}

function initScanner() {
  const drop = document.getElementById("dropzone");
  const input = document.getElementById("pdf-input");
  if (!drop || !input) return;

  drop.addEventListener("click", () => input.click());
  input.addEventListener("change", e => { if (e.target.files[0]) handleFile(e.target.files[0]); });

  ["dragover", "dragenter"].forEach(ev =>
    drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("drag"); }));
  ["dragleave", "drop"].forEach(ev =>
    drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("drag"); }));
  drop.addEventListener("drop", e => {
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });
}

document.addEventListener("DOMContentLoaded", initScanner);
