# Service de Notification – RepAIr -IBRAHIMI Yasmine

Ce service est chargé d’envoyer des **emails de confirmation** aux utilisateurs de la plateforme **RepAIr**. Il fonctionne via une route HTTP et utilise **Nodemailer** pour l’envoi des mails via un compte Gmail.

---

## Fonctionnalité principale

-  Envoie d’un **email de confirmation d’inscription** contenant un lien personnalisé.
- Paramètres d’envoi sécurisés via des variables d’environnement.
- Exposition de **métriques Prometheus** pour le monitoring du service.

---

## Comment ça marche ?

Une requête `POST` est envoyée à :  
`/api/email/confirmation`

Avec dans le body :
```json
{
  "email": "utilisateur@example.com",
  "confirmationLink": "http://site.com/confirm/abc123"
}
