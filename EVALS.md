# Zodia – Golden Test Set (v1)

Each case describes an input and assertions our backend contract tests must pass.

```yaml
- name: astro-daily-capricorn
  endpoint: /readings/astro/daily
  input:
    date: 2025-08-08
    sign: Capricorn
    profile:
      gender: male
      relationship_status: single
      birth:
        date: 1992-01-05
        time: 08:15
        location: Lyon, FR
      moon_phase: Waning Crescent
      aspects: ["Sun trine Moon", "Venus sextile Mars"]
  asserts:
    - json_valid: true
    - schema: astro_daily_v1
    - sections_min: 3
    - display_text_max: 1200

- name: astro-daily-scorpio-tight
  endpoint: /readings/astro/daily
  input:
    date: 2025-08-08
    sign: Scorpio
  asserts:
    - json_valid: true
    - schema: astro_daily_v1
    - display_text_max: 900

- name: tarot-three-card
  endpoint: /readings/tarot
  input:
    spread: "Three Card"
    cards:
      - { position: "Past", name: "The Sun", upright: true }
      - { position: "Present", name: "The Moon", upright: false }
      - { position: "Future", name: "The Star", upright: true }
  asserts:
    - json_valid: true
    - schema: tarot_reading_v1
    - insights_min: 3
    - display_text_max: 1200

- name: tarot-career
  endpoint: /readings/tarot
  input:
    spread: "Career Focus"
    topic: "Work transition"
    cards:
      - { position: "Root", name: "Ace of Pentacles", upright: true }
      - { position: "Challenge", name: "Five of Wands", upright: true }
      - { position: "Advice", name: "Temperance", upright: true }
  asserts:
    - json_valid: true
    - schema: tarot_reading_v1

- name: palm-basic
  endpoint: /readings/palm
  input:
    image_id: "demo_001"
    notes: "preprocessed 1024px, exif stripped"
  asserts:
    - json_valid: true
    - schema: palm_reading_v1
    - lines_detected_min: 1
    - display_text_max: 1200

- name: clairvoyance-love
  endpoint: /readings/clairvoyance
  input:
    topic: "Love"
    question: "Will reconciliation serve my growth?"
  asserts:
    - json_valid: true
    - schema: clairvoyance_v1
    - guidance_min: 3
    - display_text_max: 1200