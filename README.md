# 🇹🇳 Souk AI

Souk AI est une plateforme de marketplace digitale, multi-rôles et multilingue, pensée pour connecter les boutiques, les clients, les administrateurs et les outils d'intelligence artificielle dans un écosystème commerce moderne en Tunisie.

Le projet combine une vitrine publique, un tableau de bord d'administration, une gestion de catalogue, des commandes, des profils de boutiques et des services d'IA pour améliorer la recherche, la traduction et l'expérience utilisateur.

---

## 1. Objectif du projet

Souk AI a pour objectif de moderniser le commerce en ligne local en proposant :

- une marketplace accessible au grand public ;
- des boutiques indépendantes avec gestion de produits ;
- un espace d'administration centralisé ;
- des fonctionnalités IA pour la recherche sémantique et la localisation ;
- une expérience utilisateur en français, arabe et anglais ;
- une base solide pour une évolution vers le commerce circulaire, social et intelligent.

---

## 2. Vision et positionnement

Souk AI veut offrir un environnement de commerce digital premium, simple, rapide et fiable, adapté au marché tunisien.

La plateforme permet :

- à un client de parcourir les produits et les boutiques ;
- à un magasin de gérer son catalogue et ses commandes ;
- à un administrateur de superviser les utilisateurs, les catégories et les ventes ;
- à l'application d'intégrer des fonctionnalité d'IA dans la recherche et l'expérience de découverte.

---

## 3. Fonctionnalités principales

### 3.1 Côté public

- page d'accueil dynamique ;
- pages produit et boutique ;
- pages catégorie ;
- recherche de produits ;
- favoris, panier et commande ;
- authentification client ;
- pages d'information : à propos, contact, conditions.

### 3.2 Tableau de bord

- gestion des produits ;
- gestion des catégories ;
- gestion des boutiques ;
- gestion des utilisateurs selon le rôle ;
- suivi des commandes et statuts ;
- gestion du profil du vendeur et de la boutique ;
- interface administrative dédiée.

### 3.3 IA et personnalisation

- recherche sémantique des produits ;
- génération de contenu et remplissage assisté ;
- traduction de champs multilingues ;
- préparation pour des recommandations intelligentes et des analyses avancées.

---

## 4. Architecture du projet

### 4.1 Frontend

- Laravel Blade pour la vitrine publique ;
- React pour le tableau de bord interne ;
- Vite pour le build frontend ;
- Tailwind CSS pour le design system.

### 4.2 Backend

- Laravel 12 ;
- controllers API et web ;
- middleware de sécurité par rôle ;
- Sanctum pour l'authentification API ;
- Eloquent ORM pour la gestion des données.

### 4.3 Base de données

- MySQL ;
- schéma structuré par modules : utilisateurs, boutiques, catégories, produits, commandes, factures, pages, notifications, logs.

### 4.4 Infrastructure

- Docker ;
- Nginx ;
- PHP-FPM ;
- stockage des images et fichiers dans le système de fichiers Laravel.

---

## 5. Rôles utilisateurs

Le système est conçu autour de plusieurs profils :

- Client
- Boutique / Store
- Administrateur
- Influenceur
- Shipping Company
- Shipping Employee

Chaque type d'utilisateur possède des accès et des modules qui lui sont propres.

---

## 6. Stack technique

- Backend : Laravel 12 / PHP 8.4
- Frontend : React 19
- Styles : Tailwind CSS
- Base de données : MySQL 8
- Outils : Vite, Docker, Composer
- Authentification : Sanctum + sessions
- Langues : fr, ar, en

---

## 7. Structure du projet

- app/ : logique applicative, contrôleurs, modèles, services
- bootstrap/ : démarrage Laravel
- config/ : configuration de l'application
- database/migrations/ : schémas de base de données
- database/seeders/ : données de test et d'initialisation
- public/ : fichiers publics et build frontend
- resources/js/ : composants React et logique front dashboard
- resources/views/ : vues Blade publiques
- routes/ : routes web et API
- storage/ : fichiers uploadés et caches
- tests/ : tests fonctionnels et unitaires
- docker-config/ : configuration serveur Docker

---

## 8. Schéma principal de données

Les tables principales sont :

- users
- stores
- clients
- admins
- categories
- products
- product_albums
- category_product
- orders
- order_items
- factures
- notifications
- pages
- settings
- logs

Les relations principales sont :

- un utilisateur peut être client, boutique ou admin ;
- une boutique a plusieurs produits ;
- un produit appartient à plusieurs catégories ;
- un client passe plusieurs commandes ;
- une commande contient plusieurs lignes de commande ;
- une facture est associée à une commande.

---

## 9. Flux fonctionnel principal

### 9.1 Parcours client

1. le client accède à la marketplace ;
2. il navigue dans les catégories et les produits ;
3. il consulte une boutique ou un produit ;
4. il ajoute des produits au panier ;
5. il valide la commande ;
6. le système enregistre la commande et la facture.

### 9.2 Parcours boutique

1. le vendeur se connecte au dashboard ;
2. il gère son profil boutique ;
3. il ajoute ou modifie des produits ;
4. il suit les commandes et les stocks ;
5. il consulte les performances et l'état de sa boutique.

### 9.3 Parcours admin

1. l'admin consulte le dashboard ;
2. il gère les boutiques et les utilisateurs ;
3. il contrôle les catégories et les contenus ;
4. il supervise les commandes et la plateforme.

---

## 10. Démarrage rapide

### Prérequis

- Docker
- Docker Compose

### Installation

```bash
git clone <url-du-repo>
cd souk
cp .env.example .env
docker compose up -d --build
```

### Lancer les services

```bash
docker compose exec app composer install
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate
```

### Accès local

- application principale : http://localhost:8000
- dashboard React : http://localhost:8000/dashboard

---

## 11. Points forts du projet

- architecture modulaire et scalable ;
- séparation claire entre vitrine publique et dashboard interne ;
- prise en charge de plusieurs rôles ;
- support multilingue ;
- gestion complète du catalogue et des commandes ;
- base préte pour l'intégration IA et la personnalisation.

---

## 12. Améliorations futures

- moteur de recommandation produit ;
- paiement en ligne ;
- gestion des retours et remboursements ;
- analytics avancées ;
- intégration de livraison et logistique ;
- amélioration du moteur de recherche sémantique ;
- parcours social commerce et influenceurs.

---

## 13. Conclusion

Souk AI est une solution de marketplace moderne pensée pour le commerce digital tunisien. Elle allie gestion commerciale, expérience client, espace d'administration et intelligence artificielle dans une architecture robuste et évolutive.

**© 2026 Souk AI**
