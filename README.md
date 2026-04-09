## ⚙️ DEV Environment
```shell
## spin up development postgres container
cp .env.example .env
npm run db:dev:create
npm run db:push
npm run db:seed:truncate
```

any changes made to `schema.ts` or `seed-data.ts` need to rerun
```shell
npm run db:push
npm run db:seed:truncate
```

Drizzle will warn you of any changes with an interactive cli. For example if a column name is new or a rename
```shell
npm run db:push

> my-app@0.0.1 db:push
> npx drizzle-kit push

No config path provided, using default 'drizzle.config.ts'
Reading config file '/Volumes/edata/vscode/moeits_staff-astro-htmx/drizzle.config.ts'
Using 'pg' driver for database querying
[✓] Pulling schema from database...

~ date › timestamp column will be renamed
--- all columns conflicts in courses table resolved ---


~ date › timestamp column will be renamed
--- all columns conflicts in credits table resolved ---

[✓] Changes applied
```

### Drizzle Studio
```shell
mkdir -p "$HOME/Library/Application Support/drizzle-studio"
touch "$HOME/Library/Application Support/drizzle-studio/localhost.pem"
touch "$HOME/Library/Application Support/drizzle-studio/localhost-key.pem"

npm run db:studio
```

https://local.drizzle.studio/

---

HOW to generate sql files and migrations with 
```shell
npx drizzle-kit generate   # generates SQL migration files
npx drizzle-kit migrate    # runs them against your DB
```

## 🏭 Production
```shell
cp .env.example .env
## NODE_ENV="production"
cp compose.yml.example compose.yml
docker compose build
docker compose up --remove-orphans

## from dev (set env to point to prod database host:port)
npm run db:seed:truncate
```

#todo
- [ ] restructure top level errors to include `fieldName` so it can target and style the problem field if it exists
- [ ] show "no changes" and disable `update` button on page-single forms. also set button to disabled upon first press
- [ ] how to seed fresh database automatically (with docker container like `migrate`)
- [ ] TRANSFER what learned from partials/course-credits/... to partials/users/...
- [ ] use css grid to keep all field-errors in same height (and keep input fields from getting pushed up)
- [ ] fix all db `config.ts` fields to use snakecase
- [ ] how to handle `createMany` `createOne` `readMany` `readOne`?
- [ ] for RowEdit instead of replacing the targeted RowView, how about just hide it and insert the RowEdit. the cancel button should just remove the RowEdit re-reveal the hidden row. No need to pass old values back and forth
- [ ] delete button (with are you sure) for editable table
- [ ] For production with auth enabled, generate a token and configure sqld with --auth-jwt-key-file or the SQLD_AUTH_JWT_KEY env var.
- [ ] crudRegistry.courseCredits.create if member exists with (id, phone, email), then check all input fields to see if they match. if yes, then add existing member with new Credit
- [ ] create mini member search form in tfooter of courseCredits table. 
- [ ] ask how to bypass Cloudflare blocking. WP import is getting 403
- [ ] css style construction theme (road signs, asphalt, road paint, concrete, gerders, tire tracks, scafolding)
- [ ] composable and editable table Component!!!!
- [ ] admin table for `courses` and a "fetch events" button that get Wordpress data
- [x] `/attendance/admin/courses/id/[id].astro/admin` make an editable table for admin use
- [ ] pull from db all `Course` and display them on page
    - [ ] label with subject and date of class (with clickble link)
    - [ ] `/courses/[id].astro` reveals attendence form.
    - [ ] user submits member data (creates their member profile and checks them as attended) 
- [ ] how do i save db data into an csv and save it to sharepoint?
- [ ] look into using the MS SDK 
- [ ] `member-search-form.astro` (should I limit search to courseId? As to only allow users who have registered to complete their credit?)
```js
import { Client } from "@microsoft/microsoft-graph-client";
```
- [ ] genrate persistant MS token
Bottom Line
Graph Explorer tokens are for testing only. For production or persistent use:
- [ ] move `timestamp` files to real database like sqlite

Register your own app in Azure AD.
Implement OAuth flow with refresh tokens or client credentials.
Use MSAL or similar libraries to handle token lifecycle automatically.

## Wordpress api/courses/import endpoint
use with `custom-events-api.php` plugin

endpoint example `${WORDPRESS_ENDPOINT}/wp-json/wchorski/v1/events?after=2024-01-01T00:00:00`

## Docker's Named volumes
because I'm not used to using named volumes (but i must use it to deploy on synology nas)
```shell
docker volume inspect libsql-data


{
  "Name": "libsql-data",
  "Mountpoint": "/var/lib/docker/volumes/libsql-data/_data"
}
```

## Zod Validation
https://www.codegenes.net/blog/zod-validation-based-on-another-field/#prerequisites