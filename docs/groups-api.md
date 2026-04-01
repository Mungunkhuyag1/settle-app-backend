# Groups API

## Гол дүрэм

- Хэрэглэгч зөвхөн өөрийн owner эсвэл member байгаа группүүдийг харна
- Групп үүсгэсэн хэрэглэгч автоматаар `owner` болно
- Зөвхөн `owner` хэрэглэгч хүн нэмэх, хасах эрхтэй
- Ямар ч бүртгэлтэй хэрэглэгчийг ямар ч групп рүү нэмж болно

## Endpoints

### `POST /api/v1/groups`

Зорилго:
- шинэ групп үүсгэх

Request:

```json
{
  "name": "Lunch Team",
  "description": "Мезорны өдрийн хоолны групп"
}
```

### `GET /api/v1/groups`

Зорилго:
- нэвтэрсэн хэрэглэгчийн харьяалагдаж буй бүх группийг авах

### `GET /api/v1/groups/:groupId`

Зорилго:
- тухайн группийн дэлгэрэнгүй авах

### `GET /api/v1/groups/:groupId/members`

Зорилго:
- группийн гишүүдийн жагсаалт авах

### `POST /api/v1/groups/:groupId/members`

Зорилго:
- owner хэрэглэгч группт гишүүн нэмэх

Request:

```json
{
  "userId": "uuid"
}
```

### `DELETE /api/v1/groups/:groupId/members/:userId`

Зорилго:
- owner хэрэглэгч группээс гишүүн хасах
