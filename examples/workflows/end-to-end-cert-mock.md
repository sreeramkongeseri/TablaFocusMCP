# Workflow: Certification Mock End-to-End

1. Call `certification_catalog` with `board=ABGMVM`.
2. Pick `certification_level=MADHYAMA_PRATHAM`.
3. Call `assessment_builder` with `mode=cert_mock`, board, level, `count=20`.
4. Use answer key and rubric bands for scoring.
5. Feed weak objective IDs into `practice_coach` goals.
