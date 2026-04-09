# BioMask Sentinel: AI-Powered Aadhaar Privacy Vault

### 🛡️ Secure PII Redaction & Biometric Identity Verification

BioMask Sentinel is a high-security prototype designed to address the challenges of digital identity theft. It automates the **Masked Aadhaar** mandate by redacting sensitive 12-digit numbers while verifying the user's identity through **1:1 Biometric Face Matching** against the document's portrait.

---

## 🌟 Key Technical Highlights

* **Liveness-Locked Workflow:** Prevents "Replay Attacks" by requiring a liveness check before unlocking the document submission portal.
* **Context-Aware Redaction:** Uses a spatial sorting algorithm on OCR bounding boxes to differentiate between sensitive PII (first 8 digits) and non-sensitive identification (last 4 digits).
* **Deep Learning Inference:** Leverages the `VGG-Face` model to handle the "Aging Gap"—matching a fresh live capture against a potentially years-old ID photo.
* **Stateless Processing:** Images are never persisted to a database; processing happens in-memory with automatic cleanup to ensure **Data Sovereignty**.

---

## 🔒 Security Design Principles
* **Zero-Persistence:** The system employs a stateless architecture. Uploaded Aadhaar images are processed in volatile memory and never written to permanent storage.
* **End-to-End Encryption (E2EE) Simulation:** Data in transit is handled via secure multipart form-data, simulating production-grade secure tunnels.
* **Biometric Salting:** Facial embeddings are used for comparison only and are discarded post-inference, preventing the creation of a biometric database.

---

## 📂 Project Structure
```text
├── backend/
│   ├── uploads/          # Temporary buffer for processing
│   ├── main.py           # FastAPI routes & logic
│   ├── processor.py      # OCR & Biometric AI pipeline
│   └── requirements.txt  # Python dependencies
└── frontend/
    ├── app/              # Next.js 14 App Router
    ├── hooks/            # Custom Liveness & Webcam hooks
    └── components/       # Modular UI Stepper components
```
-----

## 🏗️ The Architecture

### **The Backend (Python/FastAPI)**

The engine performs heavy computational tasks:

1.  **Text Detection:** `EasyOCR` scans the document for numerical sequences.
2.  **PII Masking:** `OpenCV` dynamically calculates coordinates for black-box overlays.
3.  **Face Verification:** `DeepFace` generates embeddings for both the live face and the ID photo, calculating the **Cosine Similarity** to verify ownership.

### **The Frontend (Next.js/TypeScript)**

A modern, responsive dashboard focused on UX:

1.  **Stealth Capture:** Takes a silent webcam snapshot at the millisecond of upload to ensure the person submitting the file is the person being verified.
2.  **Security UI:** Real-time feedback via Lucide icons and confidence-score progress bars.

-----

## 🚀 Engineering Stack

  * **FastAPI:** Chosen for its asynchronous capabilities, allowing the AI pipeline to handle multiple concurrent verification requests without blocking.
  * **DeepFace (VGG-Face):** Selected for its high tolerance to "document aging" and low-resolution grayscale artifacts typical in ID photos.
  * **Next.js (App Router):** Utilized for optimized client-side rendering and secure state management during the multi-step verification flow.

-----

## 🧪 Challenges Solved

| Challenge | Solution |
| :--- | :--- |
| **OCR Fragmentation** | Implemented a horizontal coordinate sorter to group 4-4-4 digit blocks into a single 12-digit Aadhaar sequence. |
| **Identity Impersonation** | Built a "Secret Snapshot" mechanism that captures the live user's face without alerting potential spoofers. |
| **Compliance** | Mapped logic directly to UIDAI's Masked Aadhaar circulars, ensuring exactly 8 digits are redacted. |

-----

## 🚀 Deployment & Installation

### Prerequisites

  * Python 3.9+
  * Node.js 18+

### 1\. Backend Service

```bash
cd backend
python -m venv venv
Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2\. Frontend Application

```bash
cd frontend
npm install
npm run dev
```

-----

## 🗺️ Future Roadmap

  - **Mobile OCR Optimization:** Enhancing accuracy for skewed or low-light mobile captures.
  - **Deepfake Detection:** Adding texture analysis to prevent high-resolution screen-replay attacks.
  - **Multi-ID Support:** Expanding the PII masking logic to support PAN, Passport, and Voter IDs.

-----