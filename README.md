# Flowly

### Healthcare Authorization Management Platform

Flowly is a full-stack B2B application designed to manage healthcare authorization workflows across multiple departments.

The project is inspired by real operational processes in the healthcare insurance sector and focuses on one core problem: turning complex authorization workflows into a structured, traceable and role-based digital process.

---

## Overview

Healthcare authorization requests often involve several departments, documentation exchanges, clinical review and multiple status transitions.

Flowly centralizes that workflow into a single application where each team can see what requires their attention, perform the actions available to their role and follow the complete history of every request.

The application is built around four operational roles:

- **Prestaciones**
- **Dirección Médica**
- **Asesoría Jurídica**
- **Admin**

Each role has its own permissions, work queue and available actions.

---

## Key Features

### Role-Based Access Control

Authentication and authorization are handled through JWT and role-based middleware.

Users only have access to the routes, information and workflow actions associated with their role.

### Authorization Workflow

Requests move through controlled states rather than arbitrary status changes.

The system validates transitions and determines which actions are available depending on:

- Current request status
- Responsible department
- User role
- Previous workflow history

### Role-Specific Dashboards

Each role receives an operational dashboard focused on the work that requires attention.

Dashboards include:

- Key operational metrics
- Priority work queue
- Recent activity
- Request status distribution
- Contextual next actions

### Request Management

Authorization requests include:

- Insured person information
- Requested healthcare service
- Current status
- Responsible department
- Documentation
- Internal notes
- Complete activity history
- Contextual workflow actions

### Policyholder Management

Users with the appropriate permissions can access policyholder profiles and review their associated authorization requests.

### Document Management

Flowly manages documents associated with authorization requests and supports the generation of structured PDF documents for healthcare workflows.

Generated documents include authorization documents and several clinical document families.

### Traceability

Relevant actions are recorded in the request history, providing a chronological view of:

- Status changes
- Department transfers
- User actions
- Documentation events
- Workflow decisions

### Internal Communications

The platform includes internal communication channels for operational coordination between departments.

---

## Tech Stack

### Frontend

- Next.js
- React
- CSS Modules
- Lucide Icons
- REST API integration

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT authentication
- Role-based authorization
- PDF generation

### Architecture

The backend follows a layered structure:

```text
routes
   ↓
controllers
   ↓
services
   ↓
models
   ↓
MongoDB
```

Cross-cutting concerns such as authentication, authorization and validation are handled through middleware.

---

## Core Domain

Flowly models a healthcare authorization process around several connected entities:

```text
User
  │
  ├── Role
  │
  ▼
Authorization Request
  │
  ├── Policyholder
  ├── Healthcare Service
  ├── Documents
  ├── Internal Notes
  ├── Current Department
  ├── Current Status
  └── Activity History
```

---

## Workflow

A request can require different actions throughout its lifecycle, including:

```text
Request created
      ↓
Initial review
      ↓
Documentation required
      ↓
Clinical / operational review
      ↓
Medical or legal escalation
      ↓
Final decision
      ↓
Authorized / Rejected
```

The exact path depends on the request and the actions performed by each department.

Workflow transitions are validated by the backend to prevent unauthorized or inconsistent state changes.

---

## Roles

| Role | Responsibility |
|---|---|
| **PRESTACIONES** | Initial management and operational processing of authorization requests |
| **DIRECCION_MEDICA** | Medical review and clinical decision support |
| **ASESORIA_JURIDICA** | Legal review when required by the workflow |
| **ADMIN** | Global operational visibility and platform administration |

---

## Project Structure

```text
flowly/
│
├── back/
│   ├── src/
│   │   ├── configuration/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── scripts/
│   └── tests/
│
└── front/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── styles/
    │
    └── public/
```

---

## Local Development

Clone the repository:

```bash
git clone https://github.com/lidiaaire/flowly.git
cd flowly
```

### Backend

```bash
cd back
npm install
```

Create the required environment configuration and start the API:

```bash
npm start
```

### Frontend

From the project root:

```bash
cd front
npm install
npm run dev
```

The frontend will be available on the local Next.js development server.

---

## Security

Flowly implements several authorization layers:

- JWT authentication
- Protected API routes
- Role-based access control
- Backend workflow validation
- Restricted actions based on role and request state

Authorization rules are enforced on the backend rather than relying exclusively on frontend visibility.

---

## Product Approach

Flowly was designed around a real operational problem rather than around isolated technical exercises.

The main product principles are:

- **Actionability** — users should immediately understand what requires their attention.
- **Traceability** — important actions and decisions must remain visible.
- **Role clarity** — each department should see the information and actions relevant to its work.
- **Workflow integrity** — requests cannot move through invalid states.
- **Operational usability** — interfaces prioritize speed, hierarchy and readability for daily administrative work.

---

## Case Study

The complete product and UX case study is available in my portfolio:

**[View Flowly Case Study](https://portfolio-lidia-one.vercel.app/projects/flowly)**

---

## Author

**Lidia García**

Full Stack Developer focused on B2B applications, digital products and Healthcare Tech.

[Portfolio](https://portfolio-lidia-one.vercel.app/) · [LinkedIn](https://www.linkedin.com/in/lidiagarciatorregrosa) · [GitHub](https://github.com/lidiaaire)
