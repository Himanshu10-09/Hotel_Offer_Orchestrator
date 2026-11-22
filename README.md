# Hotel Offer Orchestrator

Compare hotel prices from two suppliers, keep the best offer for each hotel, and search by price range.

Built with TypeScript, Express, Temporal, Redis, and React.

## Run locally

Requirements: Docker Desktop with Docker Compose.

```sh
docker compose up --build
```

| App | Address |
| --- | --- |
| Dashboard and API | [http://localhost:3000](http://localhost:3000) |
| Temporal UI | [http://localhost:8233](http://localhost:8233) |

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/hotels?city=delhi` | Return the best hotel offers for a city |
| `GET` | `/api/hotels?city=delhi&minPrice=4000&maxPrice=6000` | Filter offers by an inclusive price range |
| `GET` | `/supplierA/hotels?city=delhi` | View Supplier A's hotel list |
| `GET` | `/supplierB/hotels?city=delhi` | View Supplier B's hotel list |
| `GET` | `/health` | Check service health |

Hotel responses are sorted by price and contain these fields:

```json
{
  "name": "Holtin",
  "price": 5340,
  "supplier": "Supplier B",
  "commissionPct": 20
}
```

Example requests:

```sh
curl "http://localhost:3000/api/hotels?city=delhi"
curl "http://localhost:3000/api/hotels?city=delhi&minPrice=4000&maxPrice=6000"
curl "http://localhost:3000/api/hotels?city=paris"
curl "http://localhost:3000/health"
```

## Tests and development

Run the test suite:

```sh
npm test
```

For local development outside Docker, install Node.js 20 or newer, copy `.env.example` to `.env`, and install dependencies:

```sh
cp .env.example .env
npm install
npm run build
```

Start the API and Temporal worker in separate terminals with `npm start` and `npm run start:worker`. Redis and Temporal must be available at the addresses in `.env`.

## Postman

Import [`postman/hotel-offer-orchestrator.postman_collection.json`](postman/hotel-offer-orchestrator.postman_collection.json) and set `baseUrl` to `http://localhost:3000`.

## License

[MIT](LICENSE)
