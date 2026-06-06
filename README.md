# VendorBridge 🌉

### Procurement & Vendor Management ERP

VendorBridge is a centralized Enterprise Resource Planning (ERP) platform designed to simplify and digitize procurement operations for organizations. It manages the entire procurement lifecycle: from registering vendors and tracking their performance to issuing Requests for Quotations (RFQs), comparing vendor bids, processing approvals, and automatically generating purchase orders (POs) and invoices.

The application is built with a clean architecture, role-based workflows, and a sleek, premium, light-themed user interface.

---

## 🚀 Key Modules & Features

### 🔐 1. Authentication & Authorization
* **Dual-Flow Access**: Clean Sign-In page and a multi-step Sign-Up portal.
* **Role Picker**: Choose between **Procurement Officer**, **Finance Manager (Approver)**, and **Vendor** during signup, with descriptive panels explaining role-based capabilities.
* **Dynamic Signup Form**: Standard input fields for administrators/officers and customized business forms for vendors (including Category, GSTIN, Contact Person, Phone, and Address).
* **JWT Authentication**: Secure API endpoints with session-based tokens and automatic sign-in upon registration.

### 🏢 2. Vendor Management & Rating System
* **Interactive Reviews**: Procurement Officers and Managers can leave star ratings (1–5★) and textual reviews for any vendor.
* **Rating Distribution**: Inline collapsible panels displaying the overall average rating alongside a visual breakdown bar chart (from 5★ to 1★).
* **Live Sync**: Ratings are automatically computed on the backend and immediately updated on the main vendors database record.

### 📝 3. Request For Quotations (RFQs)
* **RFQ Creation**: Procurement Officers can build RFQs specifying items, quantities, deadlines, and description terms.
* **Vendor Assignments**: Target select vendors directly during creation.
* **Inline Vendor Submissions**: Assigned vendors can log in, view their pending RFQs, and submit or update their estimated pricing and delivery times directly.

### 📊 4. Quotation Comparison Matrix
* **Quotation Comparison**: Compare all bids side-by-side.
* **Smart Highlighting**: Dynamic, color-coded price bars and a 🏆 **Trophy Indicator** automatically highlight the lowest bidder to simplify the selection process.
* **Direct Actions**: Submit chosen quotations directly for financial approval with one click.

### ⚖️ 5. Procurement Approvals
* **Approvals Hub**: Pending RFQs are queued for the Finance Manager to review.
* **Status Updates**: Approve or reject with custom remarks.
* **PO Auto-Generation**: Approving a quotation instantly spawns a matching Purchase Order (PO) in the documents repository.

### 📄 6. Document Generation & Distribution
* **PDF Generation**: Purchase Orders and Invoices are generated dynamically as printable PDFs via **PDFKit** on the backend.
* **Email Simulation**: Send POs/Invoices directly to vendors via simulated emails with UI status updates.
* **Payment Tracker**: Mark invoices as paid directly from the documents view.

### 📈 7. Logs & Analytics
* **Color-Coded Timeline Logs**: Complete auditing of every procurement event (e.g., login, RFQ creation, quote submission, approvals).
* **Analytical Dashboard**: Spend tracking, monthly trend charts, and vendor rating summaries built using robust CSS modules.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Custom Vanilla CSS, Lucide Icons, Axios |
| **Backend** | Node.js, Express, PostgreSQL (`pg` / `pg-pool`), JWT, PDFKit, BcryptJS |
| **Configuration** | Dotenv, ES Modules syntax |

---

## 📂 Project Structure

```
├── backend/
│   ├── migrations/         # Database migration SQL files
│   ├── middleware/         # Express auth token verification
│   ├── routes/             # API routes (auth, vendors, rfqs, quotations, approvals, docs, logs, pdf)
│   ├── utils/              # Helper functions (email simulator, log trackers)
│   ├── db.js               # PostgreSQL connection pool configuration
│   ├── migrate.js          # Migration execution script
│   ├── seed.js             # Initial schema setup and database seeder
│   ├── server.js           # Server startup script
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/          # React page components (Dashboard, Vendors, Rfqs, Login, etc.)
│   │   ├── api.js          # Centralized Axios client with token interceptors
│   │   ├── index.css       # Core global styles and theme variables
│   │   ├── App.jsx         # App shell and routing configuration
│   │   └── main.jsx        # App entry point
│   ├── index.html
│   └── package.json
```

---

## 🔧 Installation & Database Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+)
* [PostgreSQL](https://www.postgresql.org/) database server running locally or hosted

### 1. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Create a `.env` file from the provided boilerplate template:
```bash
cp .env.example .env
```

Configure your environment variables in `.env`:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/vendorbridge
JWT_SECRET=your_jwt_secret_key_here
```

Install packages, run the seed file to create tables, and populate baseline data:
```bash
npm install
npm run seed
```

If you ever need to apply migrations manually on an existing database:
```bash
npm run migrate
```

Start the backend API server:
```bash
npm start
```
The backend server will run on `http://localhost:5000`.

### 2. Frontend Setup

Navigate to the frontend directory:
```bash
cd ../frontend
```

Create a `.env` file to configure the API base URL:
```env
VITE_API_URL=http://localhost:5000
```

Install packages and start the Vite development server:
```bash
npm install
npm run dev
```
The frontend application will run on `http://localhost:5173`.

---

## 🔑 Demo Credentials

To test the application's role-based workflows, use these seeded testing accounts (all accounts use the password `password123`):

| Role | Email Address | Password | Description |
|---|---|---|---|
| **System Admin** | `admin@vendorbridge.com` | `password123` | Full access to manage vendor directories. |
| **Procurement Officer** | `officer@vendorbridge.com` | `password123` | Create RFQs, view vendor quotations, and run comparisons. |
| **Finance Manager** | `manager@vendorbridge.com` | `password123` | Review pending RFQs, approve/reject bids, and view generated logs. |
| **Apex Rep (Vendor)** | `vendor1@vendorbridge.com` | `password123` | Submit quotes for assigned RFQs and update business info. |
| **Zenith Rep (Vendor)** | `vendor2@vendorbridge.com` | `password123` | Submit quotes for assigned RFQs and update business info. |
| **Matrix Rep (Vendor)** | `vendor3@vendorbridge.com` | `password123` | Submit quotes for assigned RFQs and update business info. |

---

## 🤝 Contributing
For development, please ensure you perform changes in a new branch and test authentication flows (Sign In/Sign Up) as well as the vendor rating widgets before making commits.