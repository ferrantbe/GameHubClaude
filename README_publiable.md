# GameHub — le fil rouge, version par version

Chaque incrément est un commit, marqué d'une étiquette. Le fichier
`ETAPE.md` vous dit, à chaque version, ce que l'incrément demandait.

```
git tag --sort=v:refname       la liste des versions, dans l'ordre
git checkout G.7              le projet tel qu'il était à G.7
git diff G.6 G.7              ce que l'incrément G.7 a ajouté
git checkout main             revenir à la version finale
```

**Si vous n'avez jamais utilisé Git**, lisez d'abord
`_documents/Git_pour_GameHub.docx`. Quatre gestes suffisent, et le
document explique quoi faire quand ça coince.

Ce dépôt est **généré** à partir du corrigé annoté. Ne le modifiez
pas : la prochaine génération écraserait vos changements.
