# User Financial and Usage Data API Specification

This document outlines the RESTful API for fetching user financial and usage data, including token status, subscription plan details, and payment history.

## Authentication

All endpoints require a valid JSON Web Token (JWT) passed in the `Authorization` header as a Bearer token.

`Authorization: Bearer <YOUR_JWT_TOKEN>`

## Endpoints

---

### 1. Get User Resource Utilization

Fetches the current available usage tokens, including total allocated, consumed, remaining balance, and expiration date, along with other resource utilizations like documents and storage.

-   **URL:** `/api/user-resources/resource-utilization`
-   **Method:** `GET`
-   **Authentication:** Required (JWT)

#### Response Schema (200 OK)

```json
{
  "planDetails": {
    "plan_name": "Premium Plan",
    "token_limit": 100000,
    "ai_analysis_limit": 50000,
    "document_limit": 50,
    "template_access": "premium"
  },
  "resourceUtilization": {
    "tokens": {
      "remaining": 85000,
      "total_allocated": 100000,
      "total_used": 15000,
      "percentage_used": "15",
      "expiration_date": "2025-12-31T23:59:59.000Z"
    },
    "documents": {
      "used": 10,
      "limit": 50,
      "percentage_used": "20"
    },
    "queries": {
      "used": 15000,
      "limit": 50000,
      "percentage_used": "15"
    },
    "storage": {
      "used_gb": "0.50",
      "limit_gb": "15.00",
      "percentage_used": "3",
      "status": "within_limit",
      "note": "Storage limit is currently global (15GB). Per-plan storage limits require a 'storage_limit_gb' column in subscription_plans."
    }
  }
}
```

#### Error Responses

-   `401 Unauthorized`: If no valid JWT is provided.
-   `404 Not Found`: If no active subscription is found for the user.
-   `500 Internal Server Error`: For unexpected server errors.

---

### 2. Get User Subscription and Resource Details

Fetches the user's active subscription plan details, all available plan configurations, and detailed resource utilization. Can be filtered by `service` type.

-   **URL:** `/api/user-resources/plan-details`
-   **Method:** `GET`
-   **Authentication:** Required (JWT)
-   **Query Parameters:**
    -   `service` (optional): Filter resource utilization by a specific service.
        -   Allowed values: `tokens`, `queries`, `documents`, `storage`

#### Response Schema (200 OK - without `service` query parameter)

```json
{
  "activePlan": {
    "plan_id": 1,
    "plan_name": "Premium Plan",
    "description": "Access to all premium features.",
    "price": "999.00",
    "currency": "INR",
    "interval": "month",
    "type": "individual",
    "token_limit": 100000,
    "carry_over_limit": 0,
    "document_limit": 50,
    "ai_analysis_limit": 50000,
    "template_access": "premium",
    "limits": null,
    "start_date": "2024-01-01T00:00:00.000Z",
    "end_date": "2025-12-31T23:59:59.000Z",
    "subscription_status": "active"
  },
  "resourceUtilization": {
    "tokens": {
      "remaining": 85000,
      "limit": 100000,
      "total_used": 15000,
      "percentage_used": "15",
      "status": "within_limit",
      "expiration_date": "2025-12-31T23:59:59.000Z"
    },
    "queries": {
      "remaining": 85000,
      "limit": 50000,
      "total_used": 15000,
      "percentage_used": "15",
      "status": "within_limit"
    },
    "documents": {
      "remaining": 10,
      "limit": 50,
      "total_used": 10,
      "percentage_used": "20",
      "status": "within_limit"
    },
    "storage": {
      "used_gb": "0.50",
      "limit_gb": "15.00",
      "percentage_used": "3",
      "status": "within_limit",
      "note": "Storage limit is currently global (15GB). Per-plan storage limits require a 'storage_limit_gb' column in subscription_plans."
    }
  },
  "allPlanConfigurations": [
    {
      "id": 1,
      "name": "Free Plan",
      "description": "Basic access.",
      "price": "0.00",
      "currency": "INR",
      "interval": "month",
      "type": "individual",
      "token_limit": 10000,
      "carry_over_limit": 0,
      "document_limit": 5,
      "ai_analysis_limit": 5000,
      "template_access": "free",
      "limits": null,
      "razorpay_plan_id": null,
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z",
      "is_active_plan": false
    },
    {
      "id": 2,
      "name": "Premium Plan",
      "description": "Access to all premium features.",
      "price": "999.00",
      "currency": "INR",
      "interval": "month",
      "type": "individual",
      "token_limit": 100000,
      "carry_over_limit": 0,
      "document_limit": 50,
      "ai_analysis_limit": 50000,
      "template_access": "premium",
      "limits": null,
      "razorpay_plan_id": "plan_xxxxxxxxxxxxxx",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z",
      "is_active_plan": true
    }
  ]
}
```

#### Response Schema (200 OK - with `service=tokens` query parameter)

```json
{
  "activePlan": {
    "plan_id": 1,
    "plan_name": "Premium Plan",
    "description": "Access to all premium features.",
    "price": "999.00",
    "currency": "INR",
    "interval": "month",
    "type": "individual",
    "token_limit": 100000,
    "carry_over_limit": 0,
    "document_limit": 50,
    "ai_analysis_limit": 50000,
    "template_access": "premium",
    "limits": null,
    "start_date": "2024-01-01T00:00:00.000Z",
    "end_date": "2025-12-31T23:59:59.000Z",
    "subscription_status": "active"
  },
  "resourceUtilization": {
    "tokens": {
      "remaining": 85000,
      "limit": 100000,
      "total_used": 15000,
      "percentage_used": "15",
      "status": "within_limit",
      "expiration_date": "2025-12-31T23:59:59.000Z"
    }
  },
  "allPlanConfigurations": [
    // ... (same as above)
  ]
}
```

#### Error Responses

-   `400 Bad Request`: If an invalid `service` query parameter is provided.
-   `401 Unauthorized`: If no valid JWT is provided.
-   `500 Internal Server Error`: For unexpected server errors.

---

### 3. Get User Transactions

Retrieves a complete list of past payment transactions and token usage logs for the user, sorted by date.

-   **URL:** `/api/user-resources/transactions`
-   **Method:** `GET`
-   **Authentication:** Required (JWT)

#### Response Schema (200 OK)

```json
{
  "transactions": [
    {
      "id": 101,
      "tokens_used": 500,
      "action_description": "AI API call for document summary",
      "transaction_date": "2025-08-25T10:00:00.000Z",
      "type": "token_usage"
    },
    {
      "id": 201,
      "amount": "999.00",
      "currency": "INR",
      "status": "captured",
      "payment_method": "card",
      "transaction_date": "2025-08-20T14:30:00.000Z",
      "type": "payment",
      "razorpay_payment_id": "pay_xxxxxxxxxxxxxx",
      "razorpay_order_id": "order_yyyyyyyyyyyyyy",
      "payment_date": "2025-08-20T14:30:00.000Z",
      "invoice_link": "https://dashboard.razorpay.com/app/payments/pay_xxxxxxxxxxxxxx"
    },
    {
      "id": 102,
      "tokens_used": 100,
      "action_description": "Document upload processing",
      "transaction_date": "2025-08-18T09:15:00.000Z",
      "type": "token_usage"
    }
  ]
}
```

#### Error Responses

-   `401 Unauthorized`: If no valid JWT is provided.
-   `500 Internal Server Error`: For unexpected server errors.

---

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of a request.

-   `200 OK`: The request was successful.
-   `400 Bad Request`: The request was malformed or invalid parameters were provided.
-   `401 Unauthorized`: Authentication failed or no authentication token was provided.
-   `404 Not Found`: The requested resource could not be found.
-   `500 Internal Server Error`: An unexpected error occurred on the server.