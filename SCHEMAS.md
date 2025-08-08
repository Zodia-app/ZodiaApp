cat > docs/SCHEMAS.md << 'EOF'
# Zodia – Response Schemas (v1)

> All AI endpoints MUST return JSON conforming to these schemas. Backend validates and retries on failure.

## Astrology Daily (astro_daily_v1)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "astro_daily_v1",
  "type": "object",
  "required": ["date", "sign", "sections", "display_text"],
  "properties": {
    "date": {"type": "string", "pattern": "^\d{4}-\d{2}-\d{2}$"},
    "sign": {"type": "string"},
    "sections": {
      "type": "array",
      "minItems": 3,
      "items": {
        "type": "object",
        "required": ["title", "content"],
        "properties": {
          "title": {"type": "string", "maxLength": 60},
          "content": {"type": "string", "maxLength": 700}
        }
      }
    },
    "lucky_numbers": {"type": "array", "items": {"type": "integer"}, "maxItems": 5},
    "mood": {"type": "string"},
    "display_text": {"type": "string", "maxLength": 1200}
  }
}