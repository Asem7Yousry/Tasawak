# Tasawak

Tasawak is a Node.js e-commerce API built with Express 5 and MongoDB. It supports product catalogs and variations, customer accounts, carts, discounts, orders, Stripe payments and subscriptions, and asynchronous order and email processing.

## Features

- Customer signup, login, token refresh, profile management, and OTP-based password recovery.
- Product, variation, category, brand, shipping-cost, and subscription-plan management.
- Cart operations with Redis caching, MongoDB persistence, coupon discounts, and address-based shipping.
- Checkout with cash on delivery or Stripe Checkout and PaymentIntents.
- Stripe webhooks for payment, refund, and subscription events.
- RabbitMQ-backed asynchronous processing for cart synchronization, order and payment updates, refunds, inventory restoration, and email notifications.
- Delayed cancellation of eligible unpaid orders, with inventory restoration.
- Centralized request validation and error handling.

## Requirements

- Node.js `^22.18.0` and npm.
- MongoDB. Use a deployment that supports transactions for order inventory restoration.
- Redis.
- RabbitMQ.
- Stripe credentials for Stripe checkout, subscriptions, and webhook processing.
- SMTP credentials for email delivery.

## Setup

Install dependencies:

```sh
npm install
```

Create a `.env` file in the repository root and configure the variables your enabled features require. The application loads this file through dotenv.

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP server port; defaults to `8000`. |
| `NODE_ENV` | Set to `development` to enable Morgan request logging. |
| `DB_URI` | MongoDB connection URI. |
| `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` | Redis connection settings. |
| `RABBITMQ_URL` | AMQP connection URL. |
| `SECRET_KEY`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` | JWT signing and expiration settings. |
| `STRIPE_SECRET_KEY` | Stripe API secret key. |
| `SIGNING_SECRET` or `LOCAL_SIGNING_SECRET` | Stripe webhook signing secret. |
| `Gmail_Host`, `Gmail_Port`, `Gmail_User`, `Gmail_Password` | SMTP server and authentication settings used by the mailer. |
| `Email` | Optional sender address; defaults to `Gmail_User`. |
| `FRONTEND_URL`, `CHECKOUT_SUCCESS_PATH`, `CHECKOUT_CANCEL_PATH` | Stripe checkout redirect URLs. Checkout paths have application defaults. |
| `ORDER_CANCEL_DELAY_MS` | RabbitMQ message TTL used for delayed unpaid-order processing. |
| `Redis_Expriation_Time` | Cart cache lifetime in seconds. Preserve this spelling when configuring it. |
| `Expriation_Time` | Password-reset OTP lifetime in milliseconds. Preserve this spelling when configuring it. |
| `ALGORITHEM`, `DIGEST` | Node crypto algorithm and digest encoding used to hash password-reset OTPs. |

Keep credentials in local environment configuration or your deployment's secret store; do not commit them.

## Run the application

Start the HTTP API in development mode:

```sh
npm run dev
```

In a second terminal, start the background worker:

```sh
npm run worker
```

The API (`src/server.js`) connects to MongoDB and configures RabbitMQ before listening. The worker (`src/worker.js`) connects to MongoDB, configures RabbitMQ, and starts the message consumers. Both processes need the appropriate environment variables and access to their services.

Other package scripts:

```sh
npm start       # Start the API with Node
npm run pro     # Start with NODE_ENV=production (uses Nodemon)
npm test        # Run Jest in watch-all mode
```

## Tests

Run Jest once, or run one test file:

```sh
npx jest --runInBand
npx jest --runInBand __test__/order.queue.service.test.js
```

To run an individual test by name, add `-t`:

```sh
npx jest --runInBand __test__/order.queue.service.test.js -t "cancels an eligible order"
```

The email delivery integration test sends real SMTP messages; configure and review its SMTP settings before running it. There are no build or lint scripts in `package.json`.

## Architecture

- `src/app.js` configures Express middleware, JSON parsing, route registration, and centralized error handling. `src/config/mainRotes.js` mounts the API routers under `/api`.
- Routers in `src/routes/` apply authentication, administrator authorization, and validators before dispatching to `src/controllers/`. Controllers delegate business operations to `src/services/`; Mongoose schemas are in `src/models/`.
- Cart reads use Redis as a cache, with MongoDB as persistent storage. Cart changes publish RabbitMQ messages; the worker persists eligible updates using a synchronization token so an older queued update does not overwrite newer cart state.
- Checkout selects a payment strategy through `src/payments/payment.factory.js`. Stripe webhooks are handled by `src/utils/stripe_utils/eventHandler.stripe.js`; the webhook route retains the raw request body for signature verification. Payment and order events are then processed asynchronously by RabbitMQ consumers.
- RabbitMQ exchanges, queues, and bindings are declared in `src/rabbitmq/`. Consumer setup is in `src/consumers/setup.consumers.js`; the consumers handle order updates, inventory restoration, refunds, cart operations, and email delivery.
- Transactional email HTML templates are in `src/Views/`. Email delivery and order notifications are implemented in `src/utils/sendEmails.js` and `src/utils/orderNotifications.js`.

## API overview

All routes are mounted under `/api`. Read the corresponding router in `src/routes/` for exact methods, validation rules, and access requirements.

| Resource | Base path | Examples |
| --- | --- | --- |
| Users and authentication | `/api/users` | Signup, login, token generation, password recovery, and user administration. |
| Products and variations | `/api/product` | Browse products; administrators manage products and variations. |
| Categories | `/api/category` | Browse categories; administrators manage categories and subcategories. |
| Brands | `/api/brand` | Browse brands; administrators manage the catalog. |
| Cart | `/api/cart` | `/my-cart`, `/add-to-cart`, `/apply-coupon`, and `/address-shipping-cost` require authentication. |
| Coupons | `/api/coupon` | Browse coupons; administrators create and manage them. |
| Orders | `/api/order` | `/checkout`, customer order access, administrator order management, refunds, and subscriptions. |
| Shipping costs | `/api/shipping-cost` | Administrator management of shipping-cost records. |
| Plans | `/api/plans` | Plan and cost management, subscriptions, and customer payment methods. |

Order checkout accepts `paymentprovider` in the request body or header (`cash` is the default). For Stripe checkout, `paymentmethod` selects `session` or `paymentintent`. Stripe sends payment events to `POST /api/order/webhook-completed`.

Protected routes use JWT authentication. The centralized error middleware formats application errors; inspect the route and validation definitions for request-specific behavior.

## Deployment

Docker files are under `docker/`; the GitHub Actions workflow in `.github/workflows/ci-cd.yml` builds and publishes the image and deploys it on pushes to `main`. Configure deployment secrets and environment variables for the external services before deploying.

## Contributing

Create a branch for changes, test them before submitting, and include a clear description with pull requests.

## License

ISC
