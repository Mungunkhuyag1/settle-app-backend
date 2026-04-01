# Expenses, Balances, Settlements API

## Expense API

### `POST /api/v1/groups/:groupId/expenses`

Зорилго:
- групп дотор шинэ expense бүртгэх

Дүрэм:
- expense бүртгэж байгаа хэрэглэгч тухайн группийн member байх ёстой
- `paidByUserId` тухайн группийн member байх ёстой
- `participants` дахь бүх user тухайн группийн member байх ёстой
- `participants[].shareAmount` нийлбэр `totalAmount`-тай тэнцүү байх ёстой

Жишээ request:

```json
{
  "title": "KFC lunch",
  "description": "4 хүн хамт хооллосон",
  "paidByUserId": "user-uuid",
  "totalAmount": 42000,
  "currency": "MNT",
  "expenseDate": "2026-04-01",
  "participants": [
    { "userId": "user-1", "shareAmount": 12000 },
    { "userId": "user-2", "shareAmount": 15000 },
    { "userId": "user-3", "shareAmount": 9000 },
    { "userId": "user-4", "shareAmount": 6000 }
  ]
}
```

### `GET /api/v1/groups/:groupId/expenses`

Зорилго:
- тухайн группийн бүх expense-ийг авах

## Balance API

### `GET /api/v1/groups/:groupId/balances`

Зорилго:
- группийн гишүүн бүрийн одоогийн net balance-ийг авах
- мөн яг хэн хэнд хэд төлөх/авах ёстойг хамт авах

Тайлбар:
- positive = авах ёстой
- negative = өгөх ёстой

Response бүтэц:
- `members`: member бүрийн `netBalance`, `receivables`, `payables`
- `pairwiseSettlements`: 2 хүний хоорондын цэвэр өрийн жагсаалт

Энэ логик нь:
- expense-үүдээс 2 хүний хооронд үүссэн өрийг нэгтгэнэ
- settlement-үүдийг тухайн 2 хүний өрөөс хасна
- үлдэгдэл `0` бол харуулахгүй
- өрийг өөр хүнд шилжүүлэхгүй

## Settlement API

### `POST /api/v1/groups/:groupId/settlements`

Зорилго:
- групп дотор settlement бүртгэх

Жишээ request:

```json
{
  "fromUserId": "debtor-user-uuid",
  "toUserId": "creditor-user-uuid",
  "amount": 15000,
  "currency": "MNT",
  "settledAt": "2026-04-01T12:30:00.000Z",
  "note": "Сарын эцсийн тооцоо"
}
```

### `GET /api/v1/groups/:groupId/settlements`

Зорилго:
- тухайн группийн settlement-үүдийн жагсаалтыг авах
