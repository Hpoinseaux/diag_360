# Caddy – publication diag360

Le serveur VPS dispose déjà d’un conteneur `caddy` exposant 80/443.  
Pour publier les nouveaux services (front + NocoDB), édite le fichier `/srv/docker/shared/caddy/Caddyfile`
depuis la machine distante (`ssh diag360`) puis ajoute les blocs suivants :

```caddyfile
serv1.diag360.org {
    reverse_proxy diag360-frontend:80
    log {
        output file /var/log/caddy/serv1.access.log
    }
}

nocodb.diag360.org {
    reverse_proxy diag360-nocodb:8080
    log {
        output file /var/log/caddy/nocodb.access.log
    }
}
```

Points d’attention :

1. Les conteneurs `diag360-frontend` et `diag360-nocodb` sont déjà connectés au réseau Docker externe `diag360-ntw`.  
   Vérifier que le conteneur `caddy` utilise le même réseau (`docker network connect diag360-ntw caddy` si nécessaire).
2. Après modification du `Caddyfile`, recharger la config sans redémarrer le conteneur :
   ```bash
   docker exec caddy caddy reload --config /etc/caddy/Caddyfile
   ```
3. Les certificats Let’s Encrypt seront provisionnés automatiquement par Caddy si les DNS pointent vers le VPS.
4. Pour déboguer :
   - `docker logs -f caddy`
   - `docker exec -it caddy caddy validate --config /etc/caddy/Caddyfile`

Ces blocs permettent d’exposer le front sur `serv1.diag360.org` et ta NocoDB sur `nocodb.diag360.org`
sans ouvrir de ports supplémentaires. Ajuste ou ajoute d’autres sous-domaines si tu déploies de nouveaux services.
