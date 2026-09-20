## 1. Install required software


Install these applications on the new laptop:



1. **Node.js LTS**

Download: [https://nodejs.org](https://nodejs.org)

Verify:


PowerShell






```
node --version
npm --version

```

2. **PostgreSQL**

Download: [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)

During installation, remember:



- PostgreSQL username, usually `postgres`

- Password you choose

- Port, usually `5432`

3. Optional: **VS Code**

Useful for editing `.env` and running commands.



## 2. Copy the project to your Desktop


Copy the complete `SocietyHub` folder from the pendrive to your Desktop.


Example final location:


Plain text






```
C:\Users\YourName\Desktop\SocietyHub

```





Make sure the folder contains files such as:


Plain text






```
package.json
prisma
server
src
vite.config.ts

```





Open PowerShell and enter:


PowerShell






```
cd "$HOME\Desktop\SocietyHub"

```





Confirm you are in the correct folder:


PowerShell






```
Get-ChildItem

```





## 3. Install project dependencies


Inside the SocietyHub folder, run:


PowerShell






```
npm.cmd install

```





This installs the frontend, Express API, Prisma, authentication, and testing dependencies.


## 4. Create the PostgreSQL database


Open **pgAdmin** or use PostgreSQL’s SQL tool.


Create a database named:


Plain text






```
societyhub

```





In pgAdmin:



1. Right-click **Databases**

2. Select **Create > Database**

3. Enter `societyhub`

4. Save



Your PostgreSQL connection will usually look like this:


Plain text






```
postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/societyhub?schema=public

```





Replace `YOUR_POSTGRES_PASSWORD` with the password you chose during PostgreSQL installation.


## 5. Create the `.env` file


Inside the SocietyHub project folder, create a file named exactly:


Plain text






```
.env

```





Do not name it `.env.txt`.


Add this content:


ENV






```
PORT=4000
NODE_ENV=development

VITE_API_URL=http://localhost:4000/api/v1

DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/societyhub?schema=public

JWT_SECRET=local-development-secret-change-this
CORS_ORIGIN=http://localhost:5173

PAYMENT_PROVIDER=development
EMAIL_PROVIDER=development
SMS_PROVIDER=development

```





Replace:


Plain text






```
YOUR_POSTGRES_PASSWORD

```





with your actual PostgreSQL password.


For example:


ENV






```
DATABASE_URL=postgresql://postgres:MyPassword123@localhost:5432/societyhub?schema=public

```





Do not use quotes unless your password contains special characters.


## 6. Check that PostgreSQL works


Run:


PowerShell






```
npx.cmd prisma validate --schema prisma/schema.prisma

```





Then check the database connection:


PowerShell






```
npx.cmd prisma migrate status --schema prisma/schema.prisma

```





If the connection is correct, Prisma should detect the PostgreSQL database.


## 7. Apply the database tables


Run:


PowerShell






```
npx.cmd prisma migrate deploy --schema prisma/schema.prisma

```





This creates all required tables for:



- Users

- Properties

- Members

- Leases

- Payments

- Maintenance

- Applications

- Verification records

- Conversations

- Messages

- Notifications



Then generate the Prisma client:


PowerShell






```
npm.cmd run prisma:generate

```





## 8. Create the development admin account


Run:


PowerShell






```
npm.cmd run db:seed:dev

```





The default local admin account is:


Plain text






```
Email: admin@local.societyhub.test
Password: SocietyHub-dev-2026!

```





Use these credentials to sign into the website.


You can customize the seed account before running the command:


PowerShell






```
$env:DEV_ADMIN_EMAIL="admin@yourcompany.local"
$env:DEV_ADMIN_PASSWORD="YourLocalPassword123!"
npm.cmd run db:seed:dev

```





The seed command is for development only and refuses to run when `NODE_ENV=production`.


## 9. Start the backend API


Open the first PowerShell window:


PowerShell






```
cd "$HOME\Desktop\SocietyHub"
npm.cmd run api:dev

```





You should see a message similar to:


Plain text






```
SocietyHub API listening on http://localhost:4000

```





Leave this terminal open.


Test the API in your browser:


Plain text






```
http://localhost:4000/api/v1/health

```





You should see a health response containing:


JSON






```
{
  "status": "ok",
  "service": "societyhub-api",
  "persistence": "postgres"
}

```





## 10. Start the frontend


Open a **second** PowerShell window:


PowerShell






```
cd "$HOME\Desktop\SocietyHub"
npm.cmd run dev

```





Vite will display a URL similar to:


Plain text






```
http://localhost:5173/

```





Open that URL in your browser.


Sign in with:


Plain text






```
admin@local.societyhub.test

```





Plain text






```
SocietyHub-dev-2026!

```





## 11. Normal startup process after everything is installed


Every time you want to run the application later:


### Terminal 1 — API


PowerShell






```
cd "$HOME\Desktop\SocietyHub"
npm.cmd run api:dev

```





### Terminal 2 — frontend


PowerShell






```
cd "$HOME\Desktop\SocietyHub"
npm.cmd run dev

```





Then open:


Plain text






```
http://localhost:5173

```





PostgreSQL must also be running in the background.


## 12. If PostgreSQL is not running


Open Windows Services:



1. Press `Win + R`

2. Enter:
Plain text






```
services.msc

```

3. Find a service named similar to:
Plain text






```
postgresql-x64-18

```

4. Right-click it

5. Select **Start**



The version number may be different, such as PostgreSQL 16 or 17.


## 13. Common errors


### Error: `P1000 Authentication failed`


Your PostgreSQL username or password in `.env` is incorrect.


Check:


ENV






```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/societyhub?schema=public

```





### Error: `database "societyhub" does not exist`


Create the database in pgAdmin, or run:


SQL






```
CREATE DATABASE societyhub;

```





### Error: `ECONNREFUSED localhost:5432`


PostgreSQL is not running, or it is using another port.


Check the PostgreSQL service and confirm the port is `5432`.


### Error: `Route not found`


Make sure the API is running in the first terminal and the frontend `.env` contains:


ENV






```
VITE_API_URL=http://localhost:4000/api/v1

```





Restart Vite after changing `.env`:


PowerShell






```
npm.cmd run dev

```





### Error: `npm is not recognized`


Reinstall Node.js LTS and restart PowerShell.


### Error: Prisma tables already exist or migration error


Run:


PowerShell






```
npx.cmd prisma migrate status --schema prisma/schema.prisma

```





Do not delete the database unless you intentionally want to erase all local data.


## 14. Optional production build check


To verify the project builds correctly:


PowerShell






```
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run api:build
npm.cmd run prisma:validate

```





For a local production-style frontend preview:


PowerShell






```
npm.cmd run build
npm.cmd run preview

```





The preview command will show a local URL, usually:


Plain text






```
http://localhost:4173

```





Keep the API running separately on port `4000`.


## Important provider note


Payments, email, SMS, and realtime chat currently use explicit development adapters. They do not send real emails, SMS messages, or payment transactions without configuring real provider credentials and production adapters.
