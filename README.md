# SRI JAGRUTHI TRADERS - E-Commerce Platform

A professional, full-stack, Next.js based e-commerce solution built specifically for an agriculture shop setting.

## Features
### Customer Side
- **Professional UI/UX**: Farming-themed design tailored for agricultural shops.
- **Product Overview**: Easy to browse list of Seeds, Fertilizers, and Pesticides.
- **Order Integrations**: Add items to cart for online checkout, or order instantly via WhatsApp.
- **Cart & Checkout**: Simplified cart management with quantity controls. Smooth online ordering system.

### Admin Side (Dashboard)
- **Secure Authentication**: JWT-based login mechanism via HTTP-only cookies.
- **Analytics Dashboard**: Instant overview of Total Orders, Sales Volume, Stock Quantity, and Top-Selling Products.
- **Smart Stock Management System**: Instantly reduces stock automatically whenever a product is ordered online or verified sold offline via the Sales Entry system. Included features to alert Admin internally about low stock units easily.
- **Daily Sales Logging**: Interface for recording offline sales so online limits synchronize perfectly.
- **Order Processing**: Management interface to handle status transitions (Pending -> Completed -> Cancelled) effectively.

## Tech Stack
- Frontend: Next.js + React.js + TailwindCSS + Zustand + Lucide Icons
- Backend: Next.js API Routes (Node.js backend) + Mongoose + bcrypt + jose (JWT Edge Compatibility)
- Database: MongoDB

## Database Structure (MongoDB + Mongoose)
- **User**: name, email, password, role, address, phoneNumber
- **Product**: name, category, price, stock, imageUrl, description
- **Order**: customerName, phoneNumber, address, products (Array ref to Product), totalAmount, status
- **DailySale**: product (ref), quantitySold, saleDate, notes

## Setup Instructions
1. Install dependencies: Run `npm install` in your terminal.
2. Initialize MongoDB connection: Change the `MONGODB_URI` environment block locally via `.env.local`:
   Create `.env.local` inside the root:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=any_random_string_here_as_secret
   ```
3. Initialize basic database admin script by going to URL: `http://localhost:3000/api/seed`. Wait for `{"message":"Admin created successfully"}` to show in browser.
4. Run locally: `npm run dev`. Navigate to `http://localhost:3000/`.

## Deployment (Vercel)
1. Push codebase directly to an online GitHub repository.
2. Log into **Vercel** (`vercel.com`). Add New Project -> Import from your GitHub repository.
3. Open `Environment Variables` tab inside Vercel Setup.
4. Add keys to the dashboard:
   - `MONGODB_URI`: Insert valid Prod connection config to MongoDB Atlas.
   - `JWT_SECRET`: Insert string here.
5. Deploy seamlessly. Vercel automatically understands Next.js deployments.
