# Frontend Dashboard - Multi-Tenant Application

A robust and scalable multi-tenant Next.js frontend built with modern web technologies, offering seamless user experiences, and tailored features for Lab Admins, Vendors, Customers, and Super Admins.

## 🚀 Key Features

| Feature | Description |
| ------- | ----------- |
| **Multi-Tenant Architecture** | Dynamic routing (`app/(tenant)/[companySlug]`) isolates views for different companies. |
| **Authentication & Security** | Comprehensive Login, Registration, Forgot/Reset Password flows via JWT. |
| **Admin Dashboards** | Specialized portals and tailored metrics for Lab Admins, Vendors, and overall Super Admins. |
| **Marketplace & E-Commerce** | Complete Vendor integrations, Shopping Cart, Orders, and localized Invoices. |
| **Patient & Lab Management**| Reagent stock workflows, Patient management, and tracking lab expenditures. |
| **Responsive UI Design** | Built utilizing Tailwind CSS, ensuring pixel-perfect display across varying devices. |
| **Animations & Integrations**| Incorporates Radix UI, Framer Motion, and AOS for smooth, rich user micro-interactions. |

## 🛠️ Technology Stack

| Technology | Purpose |
| ---------- | ------- |
| **Next.js 16.x** | Core framework leveraging React 19 and the App Router pattern. |
| **Tailwind CSS 4** | Utility-first CSS framework for rapid and highly customizable styling. |
| **Radix UI** | Unstyled, accessible UI primitive components (Dialogs, Selects, Switches). |
| **Axios** | Robust HTTP client configured for handling API requests and automatic token attachments. |
| **Framer Motion** | Declarative animations and gestures library tailored for React. |
| **next-themes** | Native support for Light, Dark, and System color schemes. |

## 💻 Local Setup & Installation

### Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js** (v18 or higher recommended)
- **npm** / **yarn** / **pnpm** (Package manager)
- **Backend API**: The Symfony backend must be running for full application functionality.

### Installation Steps

1. **Clone the repository** and navigate to the frontend folder:
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install all dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure the Environment**:
   Create a `.env.local` or edit the existing `.env` file to define the required backend API variables:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
   *(Ensure the host port matches your local Symfony backend server).*

4. **Start the Development Server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Launch the Application**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your web browser. A company-specific URL structure is heavily utilized (e.g., `http://localhost:3000/company-slug`).

## 🏗️ Production Build

To test and generate an optimized production bundle:
```bash
npm run build
npm run start
```
