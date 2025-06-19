🧠 SageExcel - Smart Excel Analyzer
SageExcel is a smart and interactive platform for analyzing Excel data visually and efficiently. Whether you're a student, analyst, or data enthusiast, SageExcel helps you turn raw spreadsheets into insightful visualizations with just a few clicks.

🚀 Features
📊 Data Upload & Parsing: Upload Excel files and automatically parse tabular data for analysis.

📈 Visualizations: Generate and view charts (bar, line, pie, etc.) based on selected columns.

💾 History View: Revisit previous uploads and analyses.

🔐 Authentication: Login system with Redux state management.

🧑‍💼 Admin Dashboard: Separate layout with minimal UI but full access to user profile and settings.

🎨 Responsive UI: Mobile-friendly design using Tailwind CSS & Framer Motion for smooth transitions.

🌙 Dark Mode: Auto-switch UI based on user's preference.
🛠️ Tech Stack
Frontend: React.js / Next.js

State Management: Redux

Styling: Tailwind CSS

Animations: Framer Motion

Routing: React Router

Notifications: react-hot-toast

Backend (Optional): Node.js + Express + MongoDB (assumed for user, file, chart data)

Excel Parsing: xlsx.js or SheetJS

💻 Getting Started
1. Clone the repository
bash
Copy
Edit
git clone https://github.com/your-username/sageexcel.git
cd sageexcel
2. Install dependencies

bash
pnpm install
# or
npm install

3. Create .env file
VITE_GEMINI_API_KEY=your_google_gemini_key
REACT_APP_BACKEND_URL=http://localhost:5000

4. Run the development server
pnpm dev
# or
npm run dev
