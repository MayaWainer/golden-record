# Golden Record Builder

This service builds a **Golden Record** for a single subject by traversing multiple data sources, normalizing records into a shared internal shape, applying rule-based matching, and merging matched records with conflict resolution and confidence scoring.

The **Seed** is always the **first record in `data-source-a.json`**. All other records from A, B, and C are treated as candidates when constructing the Golden Record for that subject.

Sources → Normalization → Matching → Merge → Golden Record

### High-level flow

- **Ingest** raw JSON files from `data/` using source-specific adapters.
- **Normalize** each record into a strict `NormalizedRecord` model.
- **Match** each candidate against the seed using rule-based logic (email, name, phone, address).
- **Merge** matched candidates into a single `GoldenRecord`, appending new data and reconciling conflicts.
- **Score** the final result using a confidence function that looks at how many sources agree on key fields.

The service is exposed as a simple HTTP endpoint: `**GET /golden-record`**.

## Project structure

At a high level:

- **`data/`** – JSON data sources (`data-source-a/b/c.json`).
- **`src/models/`** – shared models: `NormalizedRecord` (internal shape) and `GoldenRecord` (API output).
- **`src/normalization/`** – utilities for normalizing and filtering fields (name, email, phone, address).
- **`src/ingestion/`** – per-source adapters that read JSON and emit `NormalizedRecord`s.
- **`src/matching/`** – rule-based matcher that scores subject ↔ candidate similarity.
- **`src/merge/`** – merger/accumulator and confidence scoring from cross-source agreement.
- **`src/golden-record/`** – Nest module, service, and controller exposing `GET /golden-record`.

## Assumptions & Trade-offs

This implementation intentionally keeps several aspects simplified to focus on the core entity resolution pipeline.

- **Single-subject golden record** – The pipeline builds the Golden Record starting from the first record in Source A as the seed entity.

- **Simplified address normalization** – Address parsing assumes limited formats and does not perform full international parsing or geocoding.

- **Rule-based matching** – Matching uses deterministic scoring rules instead of probabilistic or ML-based entity resolution.

- **No blocking strategy implemented** – All candidate records are evaluated sequentially. In large datasets, blocking would normally be used to reduce comparisons.

- **In-memory processing** – Records are loaded into memory for simplicity. Large-scale systems would use streaming or batched processing.

## Running the service locally

### Prerequisites

- Node.js ≥ 18
- npm


### 1. Install dependencies

From the project root (`golden-record/`):

```bash
npm install
```

### 2. Ensure data files exist

Make sure the three data-source files exist under the `data/` folder:

- `data/data-source-a.json`
- `data/data-source-b.json`
- `data/data-source-c.json`

These are already checked in with mock data; update or replace them as needed.

### 3. Start the Nest server

```bash
npm run start:dev
```

This starts the service on `http://localhost:3000`.

### 4. Trigger the Golden Record build

Call the HTTP endpoint:

```bash
curl http://localhost:3000/golden-record
```

You should receive a JSON payload matching the `GoldenRecord` model, for example:

- Normalized `firstName`/`middleName`/`lastName` for the Seed.
- Aggregated `emails`, `phoneNumbers`, and `addresses` from all matched records.
- `evidence`: one entry per matched source record, including its match score and rule-level reasons.
- `confidenceScore`: an overall 0–100 score based on cross-source agreement.

If you change the data in `data-source-a.json`, the Seed (first record) will change and the returned Golden Record will be recomputed accordingly.

## How to extend the solution

### Adding a new data source

- Create a new adapter under `src/ingestion/adapters/` that extends `JsonFileDataSourceAdapter`.
- Implement `sourceName`, `fileName`, and `toNormalized(record: RawRecord): NormalizedRecord`.
- Register the adapter in `GoldenRecordModule` and add it into the list of sources in `GoldenRecordService`.

Because matching and merging operate only on `NormalizedRecord`, you do **not** need to change the matcher or merger to support new sources.

### Adding or tuning rules

- Add a new rule function in `src/matching/match-rules.ts` implementing the `MatchRule` type.
- Include it in the `rules` array in `Matcher`.
- Adjust weights or the match threshold (`score >= 70`) to be more or less strict.

### Scaling identification to 10M+ records

For very large data sets(e.g., 10M+ records per source), the architecture would evolve to support distributed and memory-efficient processing.

- **Pre-compute search keys** (e.g., normalized email, `(firstName,lastName)` tuples, or other composite keys) from `NormalizedRecord` and index them in a database or search engine.
- **Query by key**:
  - For a given Seed, derive search keys and query each source for candidate records with matching keys (via indexed lookups) instead of scanning every row.
- **Streaming ingestion**: 
  - Instead of loading all records into memory, adapters could expose streams or async iterators to process records incrementally.
- **Controlled concurrency**:
  - Use tools such as p-limit to process records concurrently while respecting API rate limits when fetching from external services.
- **Queue-based processing**:
  - Decouple ingestion and matching using a message queue (e.g., Kafka, SQS, RabbitMQ) so records can be processed asynchronously.
- **Horizontal scaling**:
  - Run multiple worker instances consuming from the same queue to increase throughput.
- **Production enhancements**:
  - Introduce fuzzy matching, source reliability weighting, configurable match thresholds, and monitoring for match quality and throughput.
