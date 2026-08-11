# Apex Store

A full-stack e-commerce web application built with Node.js, Express, MongoDB, and Mongoose. The project follows a service-oriented MVC architecture, with a robust backend for authentication, catalog management, payments, and administration, and a dynamic frontend based on static views and reusable components.

---

## Index

1. [Overview](#overview)
2. [Project architecture](#project-architecture)
    - [The Model (Data Layer)](#1-the-model-data-layer)
    - [The View (Presentation Layer)](#2-the-view-presentation-layer)
    - [The Controller (Logic Layer)](#3-the-controller-logic-layer)
    - [Request-Response Workflow Example](#request-response-workflow-example)
    - [Backend](#backend)
    - [Authentication and users](#authentication-and-users)
    - [Product catalog](#product-catalog)
    - [Checkout and payments](#checkout-and-payments)
    - [Administration](#administration)
    - [Frontend](#frontend)
3. [Tech stack](#tech-stack)
4. [Author](#author)
5. [License](#license)

---

## Overview

Apex Store is an online store with a complete purchase flow: product catalog, filters and pagination, local and Google authentication, email verification, Stripe checkout, address and order management, and an admin panel to create and edit products and categories.

The backend is organized around Express controllers, Mongoose models, and security/authentication middleware. The frontend is served from the views folder and uses dynamic JavaScript components to render the interface and consume the API.

---

## Project architecture

### Model-View-Controller (MVC) Architecture

This project strictly adheres to the **Model-View-Controller (MVC)** architectural pattern, adapted for a modern Full Stack application serving static web assets. This separation of concerns ensures that business logic, data structures, and user interface elements remain modular, clean, and highly maintainable.

Here is how the responsibilities are distributed across the codebase:

#### 1. The Model (Data Layer)
Located in the `📂 models` directory, this layer defines the data structures and business schemas using Mongoose to interact with MongoDB Atlas.
*   **Encapsulation:** It manages data validation, default states (like setting tasks to uncompleted by default), and relational logic between entities (mapping tasks to user IDs).
*   **Independence:** The models have zero knowledge of how data is rendered or which API endpoints are requesting them.

#### 2. The View (Presentation Layer)
Located in the `📂 views` directory, this layer consists of the user interface components, static HTML files, and client-side JavaScript.
*   **Vanilla DOM Interaction:** Instead of using a heavy framework, the views use asynchronous native JavaScript (`fetch` API) to send requests to backend endpoints.
*   **Dynamic UI Updates:** It dynamically updates the browser DOM based on JSON payloads returned by the controllers, handling interface statuses, styling via Tailwind CSS v4, and real-time error notifications.

#### 3. The Controller (Logic Layer)
Located in the `📂 controllers` directory, this layer acts as the brain of the application, bridging the Model and the View.
*   **Request Handling:** Controllers intercept incoming HTTP requests from the client-side views, parse payload data, and execute the corresponding database operations through the models.
*   **Response Formatting:** After processing business routines (such as hashing passwords or authenticating JWTs), the controller sends back HTTP status codes and structured JSON data to feed the View.

### Request-Response Workflow Example

When a user interacts with the application, the data flows seamlessly through the MVC pipeline:

```text
 [ User Action ] ──> Triggered via Fetch API in View (e.g., Accessing the checkout view)
                            │
                            ▼
 [ Controller ]  ──> Intercepts request, runs route security middleware (auth.js)
                            │
                            ▼
 [   Model    ]  ──> Queries MongoDB to retrieve the user's cart items and profile details
                            │
                            ▼
 [ Controller ]  ──> Receives DB confirmation and dispatches a JSON success status
                            │
                            ▼
 [    View    ]  ──> Updates the DOM dynamically using Tailwind v4 to strike through the task
```

The project is clearly structured in layers with a simplified MVC approach:

- Model: defines the data structure and validations in the models folder.
- View: interface pages and components live in views, organized by modules such as home, catalog, checkout, signin, signup, verify, and adminDashboard.
- Controller: route and endpoint logic is handled in controllers, where operations such as registration, login, purchases, payments, and administration are processed.

### Backend

The main entry point is app.js, where Express is initialized, MongoDB is connected, and the routers are registered. Then, index.js starts the server.

Some key backend decisions:

- Express is used to mount API routes and serve static views.
- Authentication is handled with JWT stored in HttpOnly cookies.
- Middleware protects user and admin routes.
- Stripe is integrated to create PaymentIntents and confirm payments.
- Google OAuth is integrated to authenticate users through Google.
- Email verification is handled with JWT + EmailJS.
- Products, categories, orders, addresses, and payment methods are persisted in MongoDB.

### Frontend

The frontend is lightweight and modular. It is served from the views folder and uses modular JavaScript to:

- Create a dynamic navbar.
- Render product cards and catalog views.
- Handle filters, search, and pagination.
- Manage checkout and the payment flow.
- Manage forms in the admin panel.

### Authentication and users

- User registration with basic validation.
- Local sign-in with password hashing using bcrypt.
- Google authentication.
- Account verification by email.
- Role-based route protection (user/admin).

### Product catalog

- Product listing with pagination.
- Search by name.
- Filtering by category, size, and maximum price.
- Sorting by price or creation date.
- Product detail view.

### Checkout and payments

- Cart persisted in localStorage.
- Purchase summary in the checkout view.
- Creation of Stripe PaymentIntents.
- Payment confirmation and order creation.
- Saving shipping addresses and payment methods.

### Administration

- Admin panel for managing products and categories.
- CRUD for products with variants, sizes, and stock.
- CRUD for categories.
- Form validation and notification handling.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Tailwind CSS + DaisyUI |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas, Mongoose (ODM) |
| **Security** | JSON Web Tokens (JWT), Cookie-Parser, Bcrypt, CORS |
| **Utilities** | Morgan (Logging), OAuth Google, Stripe, EmailJS |

---

## Author

* [@aaronvalera](https://www.github.com/aaronvalera)

---

## License

[MIT](https://choosealicense.com/licenses/mit/)