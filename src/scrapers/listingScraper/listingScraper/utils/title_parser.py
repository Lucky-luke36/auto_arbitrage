import re
import json
import os

# Load makes/models once at import time
MAKES_JSON_PATH = os.path.join(os.path.dirname(__file__), "../../makes_models.json")
with open(MAKES_JSON_PATH, "r", encoding="utf-8") as f:
    MAKES_MODELS = json.load(f)

# Build lookup dict: { "make": ["model1", "model2", ...], ... }
MAKES_DICT = {
    make_entry["name"]: [m["name"] for m in make_entry.get("models", [])]
    for make_entry in MAKES_MODELS
}

VALID_MAKES = set(MAKES_DICT.keys())
# Sort makes by word count (longest first) so multi-word makes are matched first
SORTED_MAKES = sorted(VALID_MAKES, key=lambda x: -len(x.split()))


def parse_title(title):
    """
    Parses a vehicle title into year, make, model, and trim.
    Handles multi-word makes, and validates models from JSON.
    """
    result = {
        "year": "",
        "make": "",
        "model": "",
        "trim": "",
        "valid_make": False,
        "valid_model": False,
    }

    # Normalize whitespace
    title = " ".join(title.split())

    # Extract year (first 4-digit number starting with 19 or 20)
    year_match = re.search(r"\b(19|20)\d{2}\b", title)
    if year_match:
        result["year"] = year_match.group()
        title = title.replace(result["year"], "", 1).strip()

    # Find make by longest prefix match
    matched_make = None
    for make in SORTED_MAKES:
        if title.lower().startswith(make.lower()):
            matched_make = make
            break

    if matched_make:
        result["make"] = matched_make
        result["valid_make"] = True
        remainder = title[len(matched_make):].strip()
    else:
        # fallback: guess first word
        parts = title.split()
        result["make"] = parts[0] if parts else ""
        remainder = " ".join(parts[1:]) if len(parts) > 1 else ""

    # Try to match model from JSON
    models = MAKES_DICT.get(result["make"], [])
    parts = remainder.split()

    if parts:
        # check longest model name match
        matched_model = None
        for model in sorted(models, key=lambda x: -len(x.split())):
            if remainder.lower().startswith(model.lower()):
                matched_model = model
                break

        if matched_model:
            result["model"] = matched_model
            result["valid_model"] = True
            remainder = remainder[len(matched_model):].strip()
        else:
            result["model"] = parts[0]
            remainder = " ".join(parts[1:])

        if remainder:
            result["trim"] = remainder

    return result
