# NEN 1010-checker · SPIE

Statische website die controles van **inkoopvoorwaarden op naleving van NEN 1010** publiceert.

Live: https://leonmining.github.io/calulator-nen-norm/

## Werkwijze

1. Een PDF met inkoopvoorwaarden wordt aangeleverd.
2. De PDF wordt getoetst aan NEN 1010 (laagspanningsinstallaties).
3. De controle wordt als tabel toegevoegd aan `data/checks.json` en verschijnt automatisch op de site.

## Structuur

```
index.html        – overzichtspagina (rendert data/checks.json)
assets/style.css  – styling (SPIE-huisstijl)
assets/app.js     – rendert de controles
data/checks.json  – alle uitgevoerde controles (de databron)
pdf/              – optioneel: bron-PDF's
```

## Een nieuwe controle toevoegen

Voeg een object toe aan de array `checks` in `data/checks.json`:

```jsonc
{
  "id": "leverancier-2026-002",
  "document": "Inkoopvoorwaarden ...",
  "leverancier": "Naam B.V.",
  "documentversie": "v1.0",
  "datum_gecontroleerd": "2026-05-26",
  "gecontroleerd_door": "SPIE NEN1010-checker",
  "samenvatting": "Korte conclusie.",
  "eindoordeel": "voldoet | aandachtspunt | voldoet_niet | nvt",
  "pdf": "pdf/bestandsnaam.pdf",          // optioneel
  "regels": [
    {
      "onderdeel": "...",
      "nen1010_bepaling": "Deel 4-41",
      "eis": "Eis volgens NEN 1010.",
      "bevinding": "Wat staat er in het document.",
      "status": "voldoet | aandachtspunt | voldoet_niet | nvt",
      "advies": "Advies / actie."
    }
  ]
}
```

Statuswaarden: `voldoet`, `aandachtspunt`, `voldoet_niet`, `nvt`.
