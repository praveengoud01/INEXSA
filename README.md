# INEXSA

INEXSA is a responsive personal finance dashboard built with React. It helps users track income, expenses, budgets and spending categories.

## Features
- Income and expense transaction management
- Search and filter transactions
- Monthly budget tracking
- Cash-flow and category charts
- CSV transaction export
- Local browser storage (data stays in the current browser)
- Dark mode and responsive layout

## Run locally
1. Install Node.js (LTS).
2. Open this folder in VS Code.
3. Open the integrated terminal.
4. Run `npm install`.
5. Run `npm run dev`.
6. Open the local URL printed by Vite (usually http://localhost:5173).

## Production build
Run `npm run build`. The deployable files are created in the `dist` folder.

## Important note
This is a frontend academic project. It stores data in the browser's localStorage and does not include real authentication, cloud sync, banking connections or payment processing. Do not enter real sensitive financial information.


## Login and registration
The project includes login and registration screens with basic client-side validation. Authentication is demo-only and stores a display profile in browser localStorage; it does not verify credentials, create secure accounts, or send password-reset emails. Connect a secure backend before using real accounts or sensitive financial information.
