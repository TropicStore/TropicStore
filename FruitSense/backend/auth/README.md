# FruitSense Auth (DynamoDB)

DynamoDB-backed authentication for the FruitSense app. Replaces Firebase Auth.
The mobile app never talks to DynamoDB directly - it goes through the same
API Gateway -> Lambda path as the chamber endpoints.

## Architecture

```
React app
   │  POST /auth/signup, POST /auth/login, GET /auth/me, POST /auth/logout
   ▼
API Gateway (FruitChamberHTTPAPI)
   ▼
AuthLambda (backend/auth/lambda_function.py)
   ▼
DynamoDB table: FruitSense-Users
```

- Passwords: PBKDF2-HMAC-SHA256, random 16-byte salt, 180 000 iterations
  (stdlib `hashlib`, no external Python packages, no Layer needed).
- Sessions: signed HMAC-SHA256 tokens (`payload.expiry.signature`), 30-day TTL.
  Verified by the Lambda with the `AUTH_TOKEN_SECRET` env var. Tokens are never
  stored server-side; the app holds one and sends `Authorization: Bearer <token>`.

## Routes

| Method | Path               | Body / Header                | Response                                   |
|--------|--------------------|------------------------------|--------------------------------------------|
| POST   | `/auth/signup`     | `{email, password, displayName}` | `201 {user}` / `400` / `409`           |
| POST   | `/auth/login`      | `{email, password}`          | `200 {token, expiresIn, user}` / `401`     |
| GET    | `/auth/me`         | `Authorization: Bearer <t>`  | `200 {user}` / `401`                       |
| POST   | `/auth/logout`     | `Authorization: Bearer <t>`  | `200 {ok:true}` / `401`                    |

## Deploy

1. **Create the DynamoDB table** `FruitSense-Users` (ap-southeast-1):
   - Partition key: `email` (String)
   - Billing mode: PAY_PER_REQUEST
   - Schema reference: `database/FruitSense-Users.schema.json`

2. **Create the Lambda** `FruitSenseAuthLambda`:
   - Runtime: Python 3.12, Architecture: arm64, Timeout: 10 s
   - Code: `lambda_function.py` (zip it or paste inline)
   - Environment variables:
     - `USERS_TABLE=FruitSense-Users`
     - `AUTH_TOKEN_SECRET=<long random string>` (`python3 -c "import secrets;print(secrets.token_hex(32))"`)
   - IAM role permissions (inline policy):
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         { "Effect": "Allow", "Action": ["dynamodb:GetItem", "dynamodb:PutItem"], "Resource": "arn:aws:dynamodb:ap-southeast-1:*:table/FruitSense-Users" },
         { "Effect": "Allow", "Action": ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"], "Resource": "*" }
       ]
     }
     ```

3. **Add routes to the existing HTTP API** (`FruitChamberHTTPAPI`):
   Add a `/auth/{proxy+}` resource (or four explicit routes) pointing to the
   Lambda, and re-deploy the stage.

## Frontend config

The app reads one value: the API base URL in `src/constants/config.ts`
(`apiBaseUrl`). Auth uses the same Gateway (paths `/auth/*`). The auth token is
attached to all requests (including chamber calls) automatically by
`src/services/chamberApi.ts` via `setAuthTokenProvider`.

## Protecting chamber routes (recommended)

After auth is live, have the chamber Lambda also call the same token-verification
logic (or a shared `VerifyAuthTokenFunction`/authorizer) before serving
`/chamber/*`, so only signed-in users can read telemetry and send controls.
Sharing the `AUTH_TOKEN_SECRET` unifies a custom Lambda authorizer with the
user table.