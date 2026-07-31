# Mobile Migration Guide: Dynamic Exam Types and Score Configuration

## Source of truth

This guide is derived from web client commit:

- Commit: `e52b4f9ee7d8a82ad5c3aa6085fce2451abb641d`
- Title: `Refactor Exam Type + Fix Bugs (#48)`
- Commit date: `2026-05-22 13:32:06 +0700`

The mobile app currently uses APIs with the old exam type model. This document describes the contract and behavior changes visible in the updated web app so an AI coding agent can migrate the mobile app without preserving obsolete hard-coded assumptions.

Important boundary: the web repository proves client requests and consumed response fields. Where web code maps raw API data with `any`, this document labels the raw response shape as consumed/inferred, not a complete backend specification.

## Migration objective

Replace the old static exam-type design:

- Exam types represented by hard-coded string codes such as `NB`, `GB`, `KTSHN`, `NBC`, or `GBT`.
- UI labels, score thresholds, hierarchy, and feature availability selected from local constant maps.
- Requests that identify exam types by `code` or `examTypeCode`.

With the dynamic design:

- Exam types are server-managed records identified by `id`.
- Each exam/year-plan object contains an `examType` object.
- The server supplies feature flags and score minimums for each exam type.
- Screens and reports use IDs and metadata, not knowledge of specific exam codes.

## Breaking changes at a glance

| Old mobile assumption | New required behavior |
| --- | --- |
| `ExamType` is an enum/string code. | `ExamType` is an object fetched from API and embedded in exam responses. |
| `exam.generalInfo.type` or `yearPlanExam.type` contains code. | Read `exam.generalInfo.examType` or `yearPlanExam.examType`. |
| Form submits `{ code: "NB" }` when creating an exam. | Submit `{ examTypeId: "<uuid-or-id>" }`. |
| Year-plan auto-generation submits codes. | Submit `examTypeIds` and use new auto-generate endpoint. |
| Parent/child types are recognized by local code switches. | Use `examType.parentId` and `examType.isPrimary`. |
| Score minimums are hard-coded per exam code. | Read `examType.scores` from raw API, normalized as `scoreMinimums`. |
| View logic tests codes such as `NN`, `CN`, or `NB`. | Use server flags such as `editExamineeSalary`, `hasTopic`, or `showInReport`. |
| Dashboard totals are fields such as `totalNB`. | Dashboard receives dynamic `examTypes[]` entries. |

## Old constants to delete or stop using

The old web model removed or deprecated these concepts. Equivalent hard-coded constants in mobile should be removed from business logic:

```ts
PRIMARY_EXAM_TYPES
ADVANCED_EXAM_TYPES
ALL_EXAM_TYPES
EXAM_TYPE_LABELS
EXAM_TYPE_SHORT_LABELS
SCORE_MINIMUMS_MAP
EXAM_TYPES_WITH_SCORE
getScoreMinimums(examTypeCode)
isExamTypeWithScore(examTypeCode)
getPrimaryExamType(examTypeCode)
examHasTopic(examTypeCode)
```

Do not replace these with a new list of known IDs. Exam types are configuration data.

## New domain model

### Raw API exam type fields consumed by web

The new client consumes the following raw fields from objects returned by exam-type or exam endpoints:

```ts
type RawExamType = {
  id: string;
  code: string;
  name: string;
  hasTopic: boolean;
  hasTraining: boolean;
  canDelete?: boolean;
  scores?: Record<ScoreKey, number | null | undefined>;
  isPrimary?: boolean;
  parentId?: string | null;
  hasMinutes?: boolean;
  editExamineeSalary?: boolean;
  canGenerateExaminees?: boolean;
  autoGenerateInYearPlan?: boolean;
  examineeCanRegister?: boolean;
  showLastExam?: boolean;
  canPermanentlyPostpone?: boolean;
  showInReport?: boolean;
};
```

### Recommended mobile app model

Use a normalized model at repository/mapping boundary. Keep raw naming only in DTOs.

```ts
type ExamType = {
  id: string;
  code: string;
  name: string;
  hasTopic: boolean;
  hasTraining: boolean;
  canTakeExam: boolean;
  hasPractical: boolean;
  canDelete: boolean;
  scoreMinimums: Record<ScoreKey, number | null | undefined>;
  isPrimary: boolean;
  parentId: string;
  hasMinutes: boolean;
  editExamineeSalary: boolean;
  canGenerateExaminees: boolean;
  autoGenerateInYearPlan: boolean;
  examineeCanRegister: boolean;
  showLastExam: boolean;
  canPermanentlyPostpone: boolean;
  showInReport: boolean;
};
```

### Web-compatible normalizer

The web client derives two values and defaults optional flags to `false`. Mobile should use equivalent behavior unless backend/mobile product requirements explicitly override it.

```ts
function mapExamType(raw: RawExamType): ExamType {
  return {
    id: raw.id,
    code: raw.code,
    name: raw.name,
    hasTopic: raw.hasTopic,
    hasTraining: raw.hasTraining,
    canTakeExam: raw.hasTraining === true,
    hasPractical: raw.hasTopic && raw.hasTraining,
    canDelete: raw.canDelete ?? false,
    scoreMinimums: raw.scores ?? {},
    isPrimary: raw.isPrimary ?? false,
    parentId: raw.parentId ?? raw.id,
    hasMinutes: raw.hasMinutes ?? false,
    editExamineeSalary: raw.editExamineeSalary ?? false,
    canGenerateExaminees: raw.canGenerateExaminees ?? false,
    autoGenerateInYearPlan: raw.autoGenerateInYearPlan ?? false,
    examineeCanRegister: raw.examineeCanRegister ?? false,
    showLastExam: raw.showLastExam ?? false,
    canPermanentlyPostpone: raw.canPermanentlyPostpone ?? false,
    showInReport: raw.showInReport ?? false,
  };
}
```

Notes:

- The current web implementation derives `canTakeExam` from `hasTraining`, not from a raw API field.
- The current web implementation derives `hasPractical` from `hasTopic && hasTraining`.
- `parentId` is normalized to `id` when the backend returns `null` or omits it. A primary type therefore has `parentId === id` after mapping.
- Preserve `code` for display and diagnostics only. Do not use it as feature logic or request identifier where an ID endpoint is available.

## Score model migration

### Key names

Use API score keys consistently:

```ts
type SubjectKey = "at" | "vhdn" | "ltcm" | "th";
type ScoreKey = "average" | SubjectKey;
```

| New key | Meaning | Replaces old client field |
| --- | --- | --- |
| `average` | Final/average score | `averageScore` |
| `at` | Safety score | `safetyExamScore` |
| `vhdn` | Corporate culture score | `corporateCultureScore` |
| `ltcm` | Professional theory score | `professionalScore` |
| `th` | Practical/oral score | `practicalScore` |

### Threshold source

Old behavior:

```ts
minimum = SCORE_MINIMUMS_MAP[examTypeCode].practicalScore;
```

New behavior:

```ts
minimum = exam.examType.scoreMinimums.th;
```

Only render or evaluate a score criterion when its configured minimum is neither `null` nor `undefined`. A numeric value of `0` is a valid enabled criterion.

```ts
function hasMinimum(value: number | null | undefined): value is number {
  return value !== null && value !== undefined;
}
```

### Exam registration score response mapping

Raw examinee scores are consumed in object form. Theory subject values may contain `{ score }`; practical data may additionally contain examiner scores.

```ts
type RawScores = {
  at?: { score?: number | null };
  vhdn?: { score?: number | null };
  ltcm?: { score?: number | null };
  th?: {
    score?: number | null;
    examinerScore?: RawExaminerScore[];
  };
  finalScore?: number | null;
};
```

Recommended normalized result:

```ts
type ExamineeScores = {
  average: number | null;
  at: number | null;
  vhdn: number | null;
  ltcm: number | null;
  th: number | null;
  examiners: ExaminerScore[];
};
```

Map `average` from registration `finalScore` or `scores.finalScore`, depending on the enclosing response consumed by the endpoint.

### Score write payloads

Score editing endpoints continue to use subject-key payloads; migrate local form/state names if mobile currently converts them to old descriptive fields:

```json
{
  "at": { "score": 8.5 },
  "vhdn": { "score": 7.5 },
  "ltcm": { "score": 8.0 },
  "th": []
}
```

`th` is an optional array of examiner edits for result editing, while examiner scoring submits theory objects plus the examiner's `score`, `evaluation`, and `note`.

## API contract changes

### 1. Get dynamic exam types

New endpoint:

```http
GET /api/v1/exams/types?primaryOnly={boolean}
```

Consumed response:

```json
{
  "returnData": [
    {
      "id": "exam-type-id",
      "code": "NB",
      "name": "Example name",
      "hasTopic": true,
      "hasTraining": true,
      "scores": {
        "average": 7,
        "at": 8,
        "vhdn": 7,
        "ltcm": 6,
        "th": 6
      },
      "isPrimary": true,
      "parentId": null,
      "showInReport": true
    }
  ]
}
```

Mobile implementation:

1. Add an exam-type repository/cache.
2. Map every returned row through `mapExamType`.
3. Use full list for selection, hierarchy, flags, reports, and history labels.
4. Use `primaryOnly=true` only where a product screen requires primary types; do not approximate primary types by codes.

The web client also filters `isPrimary` locally after requesting `primaryOnly=true`, so mobile may defensively do the same.

### 2. Admin CRUD for exam type configuration

These endpoints were added for administrative management. Implement only if mobile includes admin system settings.

```http
POST   /api/v1/exams/types/
PUT    /api/v1/exams/types/{examTypeId}
DELETE /api/v1/exams/types/{examTypeId}
```

Write payload:

```json
{
  "code": "NB",
  "name": "Example name",
  "hasTopic": true,
  "hasTraining": true,
  "showInReport": true,
  "scores": {
    "average": 7,
    "at": 8,
    "vhdn": 7,
    "ltcm": 6,
    "th": 6
  }
}
```

The updated web form exposes only fields shown above. Other raw flags are read by UI but are not edited through that form in this commit.

Observed duplicate-code error message:

```text
EXAM_TYPE_CODE_EXIST_ERROR
```

### 3. Create or edit an exam period

Payload breaking change:

```diff
- { "code": "NB", "roundId": "...", "name": "...", "examMonth": "..." }
+ { "examTypeId": "<exam-type-id>", "roundId": "...", "name": "...", "examMonth": "..." }
```

Endpoints used by web:

```http
POST /api/v1/exams
PUT  /api/v1/exams/{examId}
```

Mobile action:

- Load selectable exam types from `GET /api/v1/exams/types`.
- Store selected `ExamType.id`.
- Display `ExamType.name` or `ExamType.code`.
- Submit `examTypeId`, never selected code.

### 4. Exam and employee exam response models

Any mobile DTO that currently turns `examType.code` directly into `type: ExamTypeCode` must instead retain mapped metadata:

```diff
- generalInfo.type: "NB"
+ generalInfo.examType: ExamType
```

The same change applies to:

- Normal exam lists/details.
- Employee exam periods and employee exam history.
- Year-plan exam list/details.
- Dashboard/chart records containing exam type metadata.

For exam general information, the web mapper overrides mapped type thresholds with top-level `schema.scores`, defaulting to an empty object when that field is absent:

```ts
exam.generalInfo.examType = {
  ...mapExamType(raw.examType),
  scoreMinimums: raw.scores ?? {},
};
```

To match web exactly, mobile should use top-level exam `scores` for exam-specific scoring screens. If actual mobile API inspection proves some detail endpoint sends thresholds only as `examType.scores`, add an explicitly tested compatibility fallback rather than assuming it.

### 5. Fetch exam rounds by year

Changed query support:

```http
GET /api/v1/exam-plans/rounds?year={number}
```

Previously web fetched rounds without a year. Mobile should pass the selected plan/year when round choices must be scoped.

### 6. Year-plan registration detail filter

Parameter breaking change:

```diff
 GET /api/v1/exam-plans/{planId}/registrations?round={round}
-    &examTypeCode={code}
+    &examTypeId={examTypeId}
```

Mobile action: replace code selection/state with selected `ExamType.id`.

### 7. Year-plan auto-generation

Endpoint and payload breaking changes:

```diff
- POST /api/v1/exam-plans/{planId}/department/{departmentId}/codes
- Body: { "codes": ["NB", "GB"] }
+ POST /api/v1/exam-plans/{planId}/department/auto-generate
+ Body: { "departmentId": "<optional-department-id>", "examTypeIds": ["<id-1>", "<id-2>"] }
```

The old all-departments endpoint used by web was removed:

```http
POST /api/v1/exam-plans/{planId}/auto-all
```

Use the new endpoint without `departmentId`, or with an omitted/null equivalent accepted by backend, for the corresponding all-department flow.

The web app only offers types with:

```ts
examType.autoGenerateInYearPlan === true
```

### 8. Exam rollback

New operation in the same commit:

```http
POST /api/v1/exams/{examId}/rollback
```

This is adjacent to the refactor rather than core exam-type migration. Add it only if the mobile workflow exposes status rollback.

### 9. Finish result decision payload

Related form contract change:

- Registration approval decision continues to require number/date/files.
- Finishing exam result now uses a payload where `number` and `signedDate` are optional, while files remain required in web validation.

Endpoint:

```http
POST /api/v1/exams/scores/{examId}/final
```

Do not reuse a strict approval-decision form schema for this result-finalization call.

### 10. Home dashboard/chart response

Old mapping read fixed backend totals such as:

```text
totalNB, totalGB, totalKTSHN, totalTrainedNB, totalTrainedGB, ...
```

New consumed response uses dynamic exam-type entries:

```ts
type RawHomeChart = {
  totalEmployee: number;
  totalMale: number;
  totalFemale: number;
  totalRegisteredEmployee: number;
  totalTrainingEmployee: number;
  examTypes?: Array<RawExamType & {
    total: number;
    totalTrained: number;
  }>;
};
```

Map dashboard results by exam type ID:

```ts
type HomeChart = {
  examinees: Record<string, {
    totalTakenExam: number;
    totalTrained: number;
    examType: ExamType;
  }>;
};
```

Render dynamic cards/series from entries. Do not pre-create chart series for known codes.

## Feature flags replacing code-based branching

Any mobile logic such as `if (examTypeCode === "NN")` is suspect. Replace it with metadata whenever the corresponding behavior is represented below.

| ExamType field | Required mobile behavior visible in web |
| --- | --- |
| `hasTopic` | Require/show topic-related education data and choose topic-aware schedule/edit behavior. |
| `hasTraining` | Include type in training/education visualizations; web also derives `canTakeExam`. |
| `hasPractical` | Show practical scheduling/completion UI; currently derived from `hasTopic && hasTraining`. |
| `hasMinutes` | Allow/upload meeting minutes during department review. |
| `editExamineeSalary` | Show and validate payroll/salary fields for adding/editing examinees; include payroll column in decision view. |
| `canGenerateExaminees` | Display generate-examinees action in exam plan detail. |
| `autoGenerateInYearPlan` | Include type in year-plan automatic generation selection. |
| `examineeCanRegister` | Show registration action/column in registration review flow. |
| `showLastExam` | Include this type, grouped under its primary parent, in last-exam history cards. |
| `showInReport` | Include records in reporting aggregation and chart metadata. |
| `parentId` | Group subtype exams into primary exam type in lists/history/reports. |
| `isPrimary` | Support primary-only selectors or filtering. |
| `canDelete` | Enable deletion only when returned as allowed in an admin management UI. |

## Hierarchy and grouping behavior

### Primary type resolution

Do not map specific child codes such as `NBC -> NB`. Resolve by ID:

```ts
const primaryTypeId = examType.parentId ?? examType.id;
```

With normalized data this becomes:

```ts
const primaryTypeId = examType.parentId; // self ID for primary type
```

### Group exam list rows

The web app groups exam periods using:

```ts
groupKey = `${roundId} - ${primaryTypeId}`;
```

The grouped row shows primary exam type metadata when available, while child exam periods remain available as sub-items.

### Last exam history

Replace fixed "last NB / last GB / last KTSHN" cards:

1. Fetch dynamic exam types.
2. Keep types where `showLastExam === true`.
3. Map child types to their primary parent using `parentId`.
4. Deduplicate by primary ID.
5. For employee history, group eligible exams by primary ID.
6. Select the latest exam by event month per primary ID.
7. Render a card for every configured primary type, including types with no historical exam.

## Report migration

The web report no longer initializes static buckets by exam code. Mobile reporting should follow the same dynamic shape.

### Dynamic report metadata

```ts
type ReportExamTypeMeta = {
  id: string;
  code: string;
  name: string;
  hasTraining: boolean;
  canTakeExam: boolean;
};
```

### Aggregation algorithm

1. Fetch all exam types.
2. Keep only `showInReport === true`.
3. Construct displayed parent buckets: a shown child belongs to a shown parent when its `parentId` points to one; otherwise it remains its own bucket.
4. Key `perExamType`, `examinees`, and chart series by bucket type ID, not code.
5. Ignore exams whose type is not enabled for reports.
6. Add child exam data into parent bucket where configured.

### Statistics currently expected by web

```ts
type ExamStatistics = {
  total: number;
  engaged: number;
  disengaged: number;
  pendingDecision: number;
  passedEducation: number;
  unpassedEducation: number;
  noEducationResult: number;
  passedExam: number;
  notpassedExam: number;
  noExamResult: number;
  participated: number;
  inProgress: number;
  notParticipated: number;
};
```

Filter training charts using `hasTraining`; filter exam participation charts using `canTakeExam`. In the current web mapper these flags have identical effective values because `canTakeExam` is derived from `hasTraining`.

## Suggested mobile implementation sequence

### Phase 1: Find obsolete coupling

Search mobile source for:

```text
ExamType
PRIMARY_EXAM_TYPES
ADVANCED_EXAM_TYPES
ALL_EXAM_TYPES
EXAM_TYPE_LABELS
SCORE_MINIMUMS
averageScore
safetyExamScore
corporateCultureScore
professionalScore
practicalScore
examTypeCode
code:
totalNB
totalGB
totalKTSHN
```

Classify every match as DTO, persisted cache, navigation argument, request payload, display code, business rule, score field, report, or chart.

### Phase 2: Add DTOs and normalizers

1. Add `RawExamType` DTO and normalized `ExamType` model.
2. Add canonical score key model: `average`, `at`, `vhdn`, `ltcm`, `th`.
3. Add `mapExamType` and `mapScores`.
4. Change exam, employee-exam, history, and year-plan mappings to preserve `examType` object.
5. Keep compatibility adapters only temporarily at boundaries that cannot be migrated in one release.

### Phase 3: Add repository and caching

1. Implement `GET /api/v1/exams/types`.
2. Cache list by user/session or normal query-cache lifetime.
3. Refresh the cache after exam-type admin mutations, if mobile supports them.
4. Never permanently persist feature flags without invalidation; configuration can change server-side.

### Phase 4: Migrate request payloads

1. Create/edit exam: `code` to `examTypeId`.
2. Year-plan registration detail: `examTypeCode` query to `examTypeId`.
3. Year-plan generation: old endpoint and `codes` to new endpoint and `examTypeIds`.
4. Add `year` to exam-round retrieval where the screen has selected year context.
5. Split result-finalization validation from approval-decision validation.

### Phase 5: Migrate UI rules

1. Replace labels with `examType.name` and compact labels with `examType.code`.
2. Replace topic/training/practical/salary/generate/register/minutes code switches with flags.
3. Replace static last-exam sections with dynamic `showLastExam` groups.
4. Replace score table columns/criteria with configured `scoreMinimums`.
5. Do not hide score minimum `0`; hide only null/undefined criteria.

### Phase 6: Migrate dashboards and reports

1. Consume dashboard `examTypes[]` rather than fixed totals.
2. Build series dynamically using `id` keys and `code`/`name` labels.
3. Initialize reports from `showInReport` configured types.
4. Merge child type results into configured parent bucket via `parentId`.

### Phase 7: Remove compatibility code

After all callers compile and tests pass:

1. Delete old enum maps and score-minimum maps.
2. Remove code-based feature checks.
3. Remove deprecated serialized cache values, or migrate them on cache-version bump.
4. Ensure navigation/deep-link state passes `examId` or `examTypeId`, not a code assumed to be stable.

## Example end-to-end mobile flow after migration

### Create exam

```text
Open create screen
  -> GET /api/v1/exams/types
  -> render options using ExamType.name
  -> user selects item with id = "type-123"
  -> POST /api/v1/exams { examTypeId: "type-123", roundId, name, examMonth }
  -> response exam.examType mapped through mapExamType
  -> screen behavior controlled by returned examType flags
```

### Render examinee result

```text
GET exam registrations
  -> map raw scores { at, vhdn, ltcm, th, finalScore }
  -> get thresholds from exam.generalInfo.examType.scoreMinimums
  -> render only configured criteria
  -> evaluate pass styling with configured threshold
```

## Test checklist for mobile agent

### Model and mapping tests

- Maps full raw exam type into normalized model.
- Defaults missing nullable flag fields to `false`.
- Normalizes missing `parentId` to self `id`.
- Derives `hasPractical` and `canTakeExam` exactly as current web behavior.
- Maps score keys and practical examiner scores correctly.
- Preserves a configured score minimum of `0`.

### API request tests

- Create/edit exam sends `examTypeId`, not `code`.
- Year-plan registration detail sends `examTypeId`, not `examTypeCode`.
- Year-plan auto-generation uses new path and `examTypeIds`.
- Rounds request includes `year` when supplied.
- Admin exam-type CRUD sends the documented fields if feature is implemented.

### Screen behavior tests

- New server-created exam type appears without app release.
- Name/code rendering comes from API data.
- Topic features follow `hasTopic`.
- Practical controls follow `hasPractical`.
- Salary inputs and validation follow `editExamineeSalary`.
- Generate action follows `canGenerateExaminees`.
- Minutes upload follows `hasMinutes`.
- Registration action follows `examineeCanRegister`.
- Score criteria and pass thresholds follow `scoreMinimums`.

### Hierarchy/report/chart tests

- Child type groups into parent based on `parentId`, with no code switch.
- Last-exam cards only use `showLastExam` configured groups.
- Reports exclude types with `showInReport === false`.
- Reports aggregate visible child types under visible parent.
- Dashboard renders a newly returned exam type dynamically.
- Empty/missing `examTypes` dashboard response does not crash.

### Regression tests

- Existing exam detail, history, registration, scoring, decision, and year-plan flows still load.
- Offline/local persisted cache is invalidated or migrated when old enum-shaped data exists.
- Unknown exam type codes do not crash any view.
- Null/omitted optional flags produce conservative hidden/disabled behavior.

## Integration cautions found in web commit

These are implementation details an agent should understand before using web code as a literal copy source:

1. Several response mappers use `any`, while Zod response schemas do not list every consumed exam-type field. Treat mapper-consumed fields as contract evidence and validate them against actual mobile API responses during implementation.
2. Web derives `canTakeExam` from `hasTraining` and `hasPractical` from `hasTopic && hasTraining`; these are not proven independent backend fields in this commit.
3. The general exam mapper overwrites thresholds with top-level `schema.scores ?? {}`, while the exam-type mapper reads `examType.scores`. Test both exam list/detail payload shapes before adding any mobile compatibility fallback.
4. `addYearPlanExamSchema` in web still contains `code`, while auto-generation and admin registration detail are migrated to IDs. Do not change an unobserved mobile endpoint solely by analogy; capture its actual request/response or backend contract first.
5. A few web screen references to legacy `generalInfo.type` remain in this commit. They are migration leftovers, not the target model.

## Completion criteria

Mobile migration is complete when:

- No business logic branches on known exam type codes.
- All changed request paths/payloads use exam type IDs as documented.
- Exam-related models retain normalized `ExamType` metadata.
- Score thresholds and score visibility are configuration-driven.
- History, reports, and charts render dynamically for backend-created exam types.
- Tests cover new types and missing/nullable configuration fields.

## Web reference files from the source commit

Use these files as implementation references while migrating mobile:

```text
src/models/exam-type.model.ts
src/models/exam.model.ts
src/models/score.model.ts
src/models/exam/subject.model.ts
src/mappers/exam/exam-type.mapper.ts
src/mappers/exam/score.mapper.ts
src/mappers/exam.mapper.ts
src/services/exam.service.ts
src/services/system.service.ts
src/helpers/exam.helper.ts
src/hooks/queries/report/use-exam-report-query.ts
src/mappers/chart.mapper.ts
```
