<<<<<<< HEAD
# 🎓 MIT-WPU Study Repository

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/atlas)

A premium, secure, and production-grade Academic Resource Management platform designed specifically for **MIT World Peace University**. This platform enables students and faculty to share, discover, and manage high-quality study materials with advanced security and institutional integration.

---

## ✨ Key Features

### 🔐 Advanced Security & Auth
*   **Institutional Verification**: Restricted to `@mitwpu.edu.in` email domains.
*   **RBAC (Role-Based Access Control)**: Specialized permissions for Students, Faculty (Teachers/HODs), and Administrators.
*   **Secure Recovery**: SHA-256 hashed token-based password reset system.
*   **Consent Management**: Mandatory Terms & Conditions and Cookie consent for every session.

### 📄 Document Management
*   **Smart Uploads**: Restricted to Faculty members to ensure academic quality.
*   **Document Intelligence**: AI-assisted academic content validation (prevents non-academic uploads).
*   **Premium Viewer**: In-browser preview for PDFs, Images, and Office documents.
*   **Version Control**: Support for multiple versions of the same resource.

### 🎨 Premium UI/UX
*   **Modern Aesthetics**: Glassmorphism design with vibrant gradients and fluid animations (Framer Motion).
*   **Dual Theme**: Full support for Sleek Dark Mode and Clean Light Mode.
*   **Zero Layout Shift**: Global skeleton loading system for a smooth experience.
*   **Mobile First**: Fully responsive design for all screen sizes.

### 🛠️ Administrative Suite
*   **User Management**: Role assignment, account moderation, and audit logs.
*   **Content Moderation**: Review, approve, or reject submissions.
*   **Analytics**: Real-time tracking of platform growth, downloads, and engagement.

---

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Zustand (State Management).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB with Mongoose ODM.
- **Storage**: Cloudinary (Media/Documents) & AWS S3 (Backup).
- **Real-time**: Socket.io for notifications and live updates.

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Cloudinary Account (for file storage)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/studyrepo.git
cd studyrepo
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory using the `.env.example` as a template.

```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
```
Create a `.env` file in the `client` directory.
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

---

## 📜 Deployment

### Recommended Platforms
- **Frontend**: Vercel or Netlify.
- **Backend**: Render, Fly.io, or DigitalOcean.
- **Database**: MongoDB Atlas.

### Environment Variables
Ensure all variables from `.env.example` are configured on your hosting platform.

---

## 🤝 Contributing
Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a PR.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

### 📞 Support
For emergency institutional support or bug reports, please contact [krishnabobade1313@gmail.com](mailto:krishnabobade1313@gmail.com).
=======
# StudyRepository
>>>>>>> cee81a112f4ffac9379423d83e890fe14a347cf8
