# Logistics ERP — Frontend

React frontend for the Logistics Trucking Management System.

## Stack
- React 17
- React Bootstrap (modals, forms, layout)
- Ant Design (available for additional components)
- react-hot-toast (notifications)
- Axios (API calls)
- react-router-dom v6 (routing)

## Coding Standards (mirrors existing ERP)
- **CSS class names**: kebab-case (`.nc-modal-custom-input`, `.button-primary`)
- **File names**: PascalCase (`Customers.js`, `AddModal.js`)
- **Variables / object attributes / API fields**: snake_case (`contract_id`, `monthly_rate`, `set_is_clicked`)
- **Routes**: centralized in `App.js`, format `/module-name`

## Folder Structure
```
src/
  Assets/
    Fonts/          — Gotham Rounded (Medium, Bold, Light), Varela Round
    Images/         — Navbar icons, modal icons
  Components/
    Navbar/         — Left sidebar, collapsible
    Modals/         — AddModal, EditModal, ViewModal, DeleteModal
    TableTemplate/  — Shared Table component
    InputError/     — Field validation error display
  Helpers/
    apiCalls/       — All axios API calls per module
    Validation/     — Form field validators per module
    Utils/          — Common utilities (auth, formatting)
  Pages/
    Login/
    Dashboard/
    Manage/         — Customers, Drivers, Helpers, Trucks, Users
    Contracts/      — Contracts, ContractRoutes
    Trips/          — Trips
    Trail/          — Audit Trail
  App.js            — All routes centralized here
  index.js
  index.css         — Font faces + CSS variables
```

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure API URL
Edit `.env`:
```
REACT_APP_API_URL=http://localhost/logistics-api/public
```
Update to match your CodeIgniter backend URL.

### 3. Run development server
```bash
npm start
```
App will open at `http://localhost:3000`

### 4. Build for production
```bash
npm run build
```

## Modules
| Module | Route | Description |
|--------|-------|-------------|
| Dashboard | /dashboard | Overview cards + quick navigation |
| Customers | /customers | CRUD — client companies |
| Drivers | /drivers | CRUD — truck drivers with license info |
| Helpers | /helpers | CRUD — crew who accompany drivers |
| Trucks | /trucks | CRUD — fleet with plate number, km/liter |
| Contracts | /contracts | CRUD — fixed monthly contracts per customer |
| Contract Routes | /contract-routes | CRUD — predefined origin/destination per contract |
| Trips | /trips | CRUD — trip logs linked to contract, route, truck, drivers, helpers |
| Users | /users | CRUD — system users (admin/staff) |
| Audit Trail | /trail | Read-only change log |

## Auth
Token stored in `localStorage` under key `token`. All API calls include `api-key` and `user-key` headers matching the existing ERP pattern. Unauthorized responses (401) auto-logout.
