# Leitfaden: omni-cad im VS Code Marketplace veroeffentlichen

Dieser Leitfaden ist auf den aktuellen Monorepo-Stand angepasst.

## Vorbereitungen

1. Stelle sicher, dass Node.js und pnpm installiert sind.
2. Der Extension-Teil liegt in packages/extension.
3. Fuer lokale Tests optional:

```bash
pnpm --filter omni-cad run compile
pnpm --filter omni-cad run package
```

## Schritt 1: package.json pruefen

Datei: packages/extension/package.json

Wichtige Felder:
- name
- publisher
- version
- repository
- engines

Empfehlung fuer Marketplace-Qualitaet:
- README und ggf. Icon im Extension-Paket sauber pflegen
- .vscodeignore so halten, dass nur noetige Artefakte in der VSIX landen

## Schritt 2: Azure DevOps PAT erstellen

1. In Azure DevOps einen PAT mit Marketplace Scope erzeugen.
2. Scope: Manage oder Acquire & Manage.
3. Token sofort sichern (wird nur einmal angezeigt).

## Schritt 3: Publisher registrieren

1. Visual Studio Marketplace Management Portal oeffnen.
2. Publisher-ID erstellen.
3. Publisher-ID muss exakt zu packages/extension/package.json passen.

## Schritt 4: In GitHub als Secret hinterlegen

In GitHub Repository Settings > Secrets and variables > Actions:
- VSCE_PAT
- OVSX_PAT (optional)

## Schritt 5: Veroeffentlichen

### CI/CD (empfohlen)

Das Repo nutzt Release-Automation in .github/workflows/release.yml.
Empfehlung:
- main veroeffentlicht stabil im offiziellen Marketplace
- beta/alpha bleiben Vorabkanaele

### Lokal (nur fuer Notfall oder einmalige manuelle Publikation)

```bash
pnpm --filter omni-cad run compile
pnpm --filter omni-cad run package
pnpm exec vsce publish --packagePath packages/extension/<datei>.vsix -p <PAT>
```

## Langfristige Stabilitaet nach Azure-Testphase

Die Pipeline braucht zur Laufzeit nur den gueltigen PAT im GitHub Secret.
Damit bleibt der Publish-Prozess funktionsfaehig, auch wenn keine aktive Azure-Testsession mehr besteht.

Wichtig ist nur:
1. PAT rechtzeitig rotieren
2. Publisher-Setup nicht aendern
3. Secret in GitHub aktuell halten

## Optional: Open VSX parallel bedienen

Fuer VSCodium und Open-Source-Editoren zusaetzlich nach Open VSX veroeffentlichen:

```bash
pnpm dlx ovsx publish packages/extension/<datei>.vsix -p <OVSX_PAT>
```
