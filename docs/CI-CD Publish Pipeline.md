# Automatisiertes Publishing fuer omni-cad via GitHub Actions

Diese Version ist auf euren aktuellen Monorepo-Stand angepasst.
Wichtig: Ihr nutzt bereits semantic-release. GitVersion ist dafuer nicht mehr notwendig.

## 1. Voraussetzungen in GitHub

1. Erstelle einen Azure DevOps PAT mit Marketplace-Rechten (Manage / Acquire & Manage).
2. Lege in GitHub unter Settings > Secrets and variables > Actions folgende Secrets an:

- VSCE_PAT
- OVSX_PAT (optional, fuer Open VSX)

Hinweis zur Azure-DevOps-Testphase:

- Fuer den CI-Lauf ist keine aktive Azure-Websession notwendig.
- Entscheidend ist ein gueltiger PAT im GitHub Secret.
- Nach Ablauf der Testphase funktionieren Releases weiter, solange PAT und Publisher korrekt bleiben.

## 2. Aktueller Pipeline-Ansatz fuer dieses Repo

Im Repo existiert bereits eine Release-Pipeline in .github/workflows/release.yml mit:

- semantic-release Versionierung
- Build + VSIX Packaging
- Upload zur GitHub Release
- Versioned docs publishing

Ergaenzung fuer Marketplace Publishing:

```yaml
publish-marketplace:
  name: Publish Extension Marketplaces
  runs-on: ubuntu-latest
  needs: release
  if: needs.release.outputs.new_release_published == 'true' && github.ref_name == 'main'

  steps:
    - uses: actions/checkout@v4
      with:
        ref: ${{ needs.release.outputs.new_release_git_tag }}

    - uses: pnpm/action-setup@v4

    - uses: actions/setup-node@v4
      with:
        node-version: 22
        cache: pnpm

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Build and package VSIX
      run: |
        pnpm --filter omni-cad run compile
        pnpm --filter omni-cad run package

    - name: Resolve VSIX path
      id: vsix
      run: |
        file=$(ls packages/extension/*.vsix | head -n 1)
        echo "path=$file" >> "$GITHUB_OUTPUT"

    - name: Publish to VS Code Marketplace
      if: secrets.VSCE_PAT != ''
      run: pnpm exec vsce publish --packagePath "${{ steps.vsix.outputs.path }}" -p "${{ secrets.VSCE_PAT }}"

    - name: Publish to Open VSX
      if: secrets.OVSX_PAT != ''
      run: pnpm dlx ovsx publish "${{ steps.vsix.outputs.path }}" -p "${{ secrets.OVSX_PAT }}"
```

## 3. Was diese Strategie sicherstellt

1. GitHub ist Source of Truth fuer Version und Release-Inhalt.
2. Marketplace-Publish ist voll automatisiert und tokenbasiert.
3. Lokales vsce login ist fuer Releases nicht noetig.
4. Open VSX kann parallel bedient werden.

## 4. Wichtige Checks vor dem ersten produktiven Lauf

1. package.json in packages/extension pruefen:

- publisher ist korrekt registriert
- repository URL stimmt
- engines.vscode ist gesetzt

2. Packaging pruefen:

- .vscodeignore schliesst unnoetige Dateien aus
- dist/ Artefakte sind enthalten

3. Token-Hygiene:

- PAT Ablaufdatum beobachten
- Rotation vor Ablauf planen

## 5. Empfehlung fuer euer Release-Modell

1. Nur main auf echten VS Code Marketplace veroeffentlichen.
2. beta/alpha fuer interne oder Open-VSX-Previews nutzen.
3. GitHub Release als zentrales Artefakt-Archiv beibehalten.
