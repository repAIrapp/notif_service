# CHANGELOG — Notif Service

## [1.0.0] - 2025-08-19

### Nouveautés
- Ajout du service de notifications par email via Nodemailer
- Intégration avec le service DB pour récupérer l'utilisateur cible
- Mise en place d'un contrôleur pour envoyer une notification depuis une requête API

###  Sécurité
- Validation des entrées (email, sujet, contenu)
- Protection contre l’injection et les abus via Express best practices
- Ajout de `helmet` et `express-rate-limit`

###  CI/CD
- Mise en place de GitHub Actions pour automatiser le linting (`eslint`) et le test
- Ajout d’un fichier `.eslintrc` et d’un pipeline CI simple

###  Observabilité
- Exposition des métriques Prometheus sur `/metrics` (requests, erreurs, etc.)

---

