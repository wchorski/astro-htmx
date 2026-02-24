#todo
- [ ] crudRegistry.memberCredits.create if member exists with (id, phone, email), then check all input fields to see if they match. if yes, then add existing member with new Credit
- [ ] create mini member search form in tfooter of memberCredits table. 
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
- [ ] `member-search-form.astro` (should I limit search to courseId? As to only allow members who have registered to complete their credit?)
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

# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).


## Zod Validation
https://www.codegenes.net/blog/zod-validation-based-on-another-field/#prerequisites