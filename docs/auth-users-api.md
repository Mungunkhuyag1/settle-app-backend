# Auth болон Users API

Энэ төсөл local `JWT + email/password` authentication ашиглана.

## Ерөнхий урсгал

1. Хэрэглэгч `sign-up` endpoint-оор бүртгүүлнэ
2. Backend password-ийг hash хийгээд `users` хүснэгтэд хадгална
3. Backend JWT access token буцаана
4. Хэрэглэгч `sign-in` endpoint-оор нэвтэрч дахин token авч болно
5. Хамгаалагдсан endpoint-д `Authorization: Bearer <token>` header явуулна

## Орчны хувьсагч

```env
JWT_SECRET=change-this-secret
JWT_EXPIRES_IN=7d
```

## Auth API

### `POST /api/v1/auth/sign-up`

Зорилго:
- шинэ хэрэглэгч бүртгэх
- JWT access token буцаах

Request:

```json
{
  "email": "bataa@mezorn.com",
  "password": "StrongPass123",
  "firstName": "Батаа",
  "lastName": "Батболд"
}
```

Response:

```json
{
  "accessToken": "jwt-token",
  "tokenType": "Bearer",
  "expiresIn": "7d",
  "user": {
    "id": "uuid",
    "email": "bataa@mezorn.com",
    "firstName": "Батаа",
    "lastName": "Батболд",
    "imageUrl": null,
    "lastSeenAt": "2026-04-01T03:35:00.000Z",
    "createdAt": "2026-04-01T03:00:00.000Z",
    "updatedAt": "2026-04-01T03:35:00.000Z"
  }
}
```

### `POST /api/v1/auth/sign-in`

Зорилго:
- имэйл, нууц үгээр нэвтрэх
- JWT access token буцаах

Request:

```json
{
  "email": "bataa@mezorn.com",
  "password": "StrongPass123"
}
```

### `GET /api/v1/auth/me`

Зорилго:
- bearer token-оор нэвтэрсэн хэрэглэгчийн мэдээлэл авах

Headers:

```http
Authorization: Bearer <jwt-access-token>
```

Response:

```json
{
  "user": {
    "id": "uuid",
    "email": "bataa@mezorn.com",
    "firstName": "Батаа",
    "lastName": "Батболд",
    "imageUrl": null,
    "lastSeenAt": "2026-04-01T03:35:00.000Z",
    "createdAt": "2026-04-01T03:00:00.000Z",
    "updatedAt": "2026-04-01T03:35:00.000Z"
  }
}
```

## Users API

### `GET /api/v1/users/me`

Зорилго:
- нэвтэрсэн хэрэглэгчийн профайлыг авах

### `PATCH /api/v1/users/me`

Зорилго:
- нэвтэрсэн хэрэглэгчийн профайлыг шинэчлэх

### `GET /api/v1/users/:id`

Зорилго:
- дотоод `users.id` UUID-аар хэрэглэгч авах

### `GET /api/v1/users/me/expenses`

Зорилго:
- нэвтэрсэн хэрэглэгчийн оролцсон эсвэл төлсөн бүх expense-ийг авах

### `GET /api/v1/users/me/settlements`

Зорилго:
- нэвтэрсэн хэрэглэгчтэй холбоотой бүх settlement-ийг авах

### `GET /api/v1/users/me/balances`

Зорилго:
- нэвтэрсэн хэрэглэгчийн group бүр дээрх өөрийн balance мэдээллийг авах
