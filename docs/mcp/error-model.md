# Error Model

All errors return:

```json
{
  "code": "INVALID_INPUT | NOT_FOUND | VALIDATION_FAILED | COVERAGE_GAP | RATE_LIMITED | INTERNAL_ERROR",
  "message": "human-readable message",
  "details": {}
}
```

## Codes

- `INVALID_INPUT`: malformed or missing required fields.
- `NOT_FOUND`: requested item does not exist in dataset.
- `VALIDATION_FAILED`: composition math or invariants failed.
- `COVERAGE_GAP`: data missing for requested operation.
- `RATE_LIMITED`: per-tool quota exceeded.
- `INTERNAL_ERROR`: unexpected server failure (redacted message by default).
