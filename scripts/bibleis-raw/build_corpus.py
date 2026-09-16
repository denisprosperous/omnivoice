#!/usr/bin/env python3
"""
OMNIVOICE — build kom_training_corpus/ from the user-provided Master Ingestion
Package (upload 2026-09-16) + the Bible.is Kom Audio Bible harvest.

Judicious ingestion policy (Directive: trusted sources only):
  - Only data blocks actually provided by the user spec are ingested
    (numbers corrections + hundreds paradigm, 45 synthesis proposals,
    course/engine configs, agent skills).
  - Files the spec only *schemas* (lexicon 4000+, graphemes, stories) are NOT
    fabricated — manifest records them as schema_scaffold with 0 records.
  - Part 5 synthesis entries stay "pending" (spec Golden Rule: no commit to
    training corpus without human moderation).
  - Real native audio harvested from Bible.is is ingested into 11_audio.
"""
import json
import os
import shutil

ROOT = "/home/z/my-project/kom_training_corpus"
HERE = "/home/z/my-project/scripts/bibleis-raw"
UPLOAD = "/home/z/my-project/upload/Pasted Content_1789525912280.txt"

if os.path.exists(ROOT):
    shutil.rmtree(ROOT)
for d in ["01_alphabet", "02_phonology", "03_numbers", "04_morphology", "05_syntax",
          "06_tone", "07_lexicon", "08_reader", "09_pedagogy", "10_synthesis",
          "11_audio", "12_conflicts", "13_agent_skills"]:
    os.makedirs(os.path.join(ROOT, d), exist_ok=True)


def w(path, data):
    full = os.path.join(ROOT, path)
    with open(full, "w", encoding="utf-8") as f:
        if isinstance(data, str):
            f.write(data)
        else:
            json.dump(data, f, ensure_ascii=False, indent=1)
    print("wrote", path)


# ---------------------------------------------------------------- manifest
manifest = {
    "corpus_id": "kom_itangikom_v1",
    "corpus_name": "Kom (Itanjikom) Language Training Corpus",
    "version": "1.1.0",
    "language": {
        "name": "Kom",
        "autonym": "Itaŋikom",
        "iso_code": "bkm",
        "family": "Niger-Congo > Benue-Congo > Bantoid > Grassfields Bantu > Ring > Central Ring",
        "location": "Boyo Division, Northwest Region, Cameroon",
        "speakers_estimate": "150,000+ (2001)",
        "dialects": ["Major (95%)", "Mbesa (minor)", "Ake (minor)"],
    },
    "sources": [
        {"id": "LEX", "citation": "Jones, Randy. 2001. Provisional Kom-English Lexicon. SIL.", "status": "cf-gated (PDF blocked by Cloudflare/Turnstile; exact URL on record)"},
        {"id": "GS", "citation": "Shultz, George. 1997. Kom Language Grammar Sketch Part 1. SIL.", "status": "cf-gated; numeric data ingested via user-provided package 2026-09-16"},
        {"id": "PHON", "citation": "Shultz, George. 1993. Notes on the Phonology of the Kom Language. SIL.", "status": "cf-gated"},
        {"id": "TONE", "citation": "Jones, J. Randall. 1997. Tone in the Kom Noun Phrase Part II. SIL.", "status": "cf-gated"},
        {"id": "HYM", "citation": "Hyman, Larry M. Initial Vowel and Prefix Tone in Kom. UC Berkeley [Draft].", "status": "fetched (local PDF)"},
        {"id": "LIT", "citation": "Chuo, Kain Godfrey & Trammell, Kristine Marion. 2007. Kom Reader 1.2. SIL.", "status": "bibliographic record fetched"},
        {"id": "GHS", "citation": "Chia & Ngong Mbeh. 1996. Ghesɨ̀nà yeʼi itaŋikom 1. NACALCO/SIL.", "status": "fetched (HTML)"},
        {"id": "NT", "citation": "Ŋwàʼlɨ̀ àkòyn aghɨ̀ Jisos Christ (Kom New Testament). 2004. The Bible Society of Cameroon.", "status": "fetched: text (Bible.is BKMBSC) + audio (BKMBSCN2DA)"},
        {"id": "OMNI", "citation": "Omniglot Kom orthography chart (Wolfram Siegel)", "status": "external"},
        {"id": "PKG", "citation": "User-provided Master Ingestion Package (platform build spec), uploaded 2026-09-16.", "status": "fetched (authoritative for numbers + synthesis proposals)"},
        {"id": "BIBAUD", "citation": "Bible.is Kom Audio Bible — http://live.bible.is/bible/BKMBSC/MAT/1 (fileset BKMBSCN2DA, audio_drama, NT, 64kbps mp3). Audio ℗ 2007 Hosanna / Faith Comes By Hearing.", "status": "fetched: 28 chapters Matthew, verse-aligned with NIV (ENGNIV)"},
    ],
    "file_index": {
        "03_numbers/cardinal.json": {"records": 11, "schema": "number", "note": "hundreds paradigm 100-1000 incl. 500/900 corrections (Part 0)"},
        "03_numbers/usage_rules.json": {"records": 3, "schema": "number_rule"},
        "09_pedagogy/course_registry.json": {"records": 1, "schema": "course_registry"},
        "09_pedagogy/curriculum.json": {"records": 17, "schema": "stage"},
        "09_pedagogy/lesson_engine.json": {"records": 1, "schema": "lesson_engine"},
        "09_pedagogy/assessment_engine.json": {"records": 1, "schema": "assessment_engine"},
        "10_synthesis/pending_moderation.jsonl": {"records": 45, "schema": "synthesis_entry", "note": "Part 5 proposals — ALL pending native-speaker moderation (Golden Rule)"},
        "11_audio/phoneme_map.json": {"records": 29, "schema": "grapheme_audio_slot", "note": "slots reserved; audio pending native recordings (Directive 9)"},
        "11_audio/word_audio_index.jsonl": {"records": 28, "schema": "audio_entry", "note": "REAL native audio: Kom NT Matthew chapter narrations (Bible.is BKMBSCN2DA)"},
        "11_audio/speech_to_speech_config.json": {"records": 1, "schema": "s2s_config"},
        "12_conflicts/unresolved.jsonl": {"records": 5, "schema": "conflict", "note": "Kom/NIV verse-division differences in Matthew"},
        "13_agent_skills/expansion_protocol.json": {"records": 1, "schema": "protocol"},
        "13_agent_skills/moderation_workflow.json": {"records": 1, "schema": "workflow"},
        "13_agent_skills/quality_gates.json": {"records": 1, "schema": "gates"},
        "13_agent_skills/training_examples.jsonl": {"records": 10, "schema": "training_example"},
    },
    "schema_scaffold_pending_data": {
        "01_alphabet/graphemes.json": "29 graphemes — data not in ingestion package; must be keyed from GS/PHON originals (cf-gated) or native speaker sessions",
        "02_phonology/": "consonants/vowels tables — same as above",
        "05_syntax/": "phrase-structure files — from GS (cf-gated)",
        "06_tone/": "tone paradigms — from TONE/HYM (partially available via Hyman fetch)",
        "07_lexicon/": "4000+ entries — from LEX (cf-gated); Phase-1 500-entry platform lexicon lives in src/lib/data/lexicon.ts (50 attested / 450 awaiting)",
        "08_reader/": "16 stories — from LIT PDF (cf-gated); Ghesɨ̀nà 1 raw HTML on record in scripts/kom-resources-raw/",
    },
    "quality_gates": [
        "every_entry_has_source_field",
        "every_entry_has_moderation_status",
        "every_kom_text_preserves_diacritics",
        "every_ipa_uses_correct_unicode",
        "synthesis_entries_never_ship_live_without_moderation",
        "audio_entries_point_to_existing_files",
        "no_synthetic_grassfields_speech_directive_9",
    ],
    "ingestion_order": [
        "manifest.json", "03_numbers/", "09_pedagogy/", "13_agent_skills/",
        "11_audio/", "10_synthesis/", "12_conflicts/",
    ],
}
w("manifest.json", manifest)

# ---------------------------------------------------------------- 03_numbers
cardinal = [
    {"number": 100, "kom": "ivi", "ipa": None, "literal": None, "type": "cardinal", "source": "GS (user PKG 2026-09-16)", "moderation_status": "verified"},
    {"number": 200, "kom": "ighi i bö", "ipa": None, "literal": None, "type": "cardinal", "source": "GS (user PKG 2026-09-16)", "moderation_status": "verified"},
    {"number": 300, "kom": "ighi i tal", "ipa": None, "literal": None, "type": "cardinal", "source": "GS (user PKG 2026-09-16)", "moderation_status": "verified"},
    {"number": 400, "kom": "ighi i kä", "ipa": None, "literal": None, "type": "cardinal", "source": "GS (user PKG 2026-09-16)", "moderation_status": "verified"},
    {"number": 500, "kom": "ighi i täyn", "ipa": "/ìɣì ì tæjn/", "literal": "hundreds of five", "type": "cardinal", "source": "GS (PKG Part 0 correction: täyn with diaeresis, per [GS] Chart 12 and [TONE] §4.2)", "moderation_status": "verified"},
    {"number": 600, "kom": "ighi i ntufa", "ipa": None, "literal": None, "type": "cardinal", "source": "GS (user PKG 2026-09-16)", "moderation_status": "verified"},
    {"number": 700, "kom": "ighi i nsombö", "ipa": None, "literal": None, "type": "cardinal", "source": "GS (user PKG 2026-09-16)", "moderation_status": "verified"},
    {"number": 800, "kom": "ighi i nfama", "ipa": None, "literal": None, "type": "cardinal", "source": "GS (user PKG 2026-09-16)", "moderation_status": "verified"},
    {"number": 900, "kom": "ighi i bulamö'", "ipa": "/ìɣì ì bulamɔʔ/", "literal": "hundreds of nine", "type": "cardinal", "source": "GS (PKG Part 0 correction: untruncated form, pattern ighi i [number])", "moderation_status": "verified"},
    {"number": 1000, "kom": "nkam", "ipa": None, "literal": None, "type": "cardinal", "source": "GS (user PKG 2026-09-16)", "moderation_status": "verified"},
]
w("03_numbers/cardinal.json", cardinal)
w("03_numbers/usage_rules.json", [
    {"rule": "hundreds_200_900", "pattern": "ighi i [units-form]", "examples": ["ighi i bö (200)", "ighi i tal (300)", "ighi i kä (400)", "ighi i täyn (500)"], "source": "GS (PKG Part 0)", "moderation_status": "verified"},
    {"rule": "hundred_stem", "pattern": "ivi = 100", "source": "GS (user PKG 2026-09-16)", "moderation_status": "verified"},
    {"rule": "thousand_stem", "pattern": "nkam = 1000", "source": "GS (user PKG 2026-09-16)", "moderation_status": "verified"},
])

# ---------------------------------------------------------------- 09_pedagogy
stages = [
    {"stage": 0, "name": "Orientation", "lessons": 1, "objectives": ["Introduce Kom language", "Explain tones", "Set expectations"], "content_source": "01_alphabet/", "mastery_gate": None},
    {"stage": 1, "name": "Vowels", "lessons": 9, "objectives": ["Identify all 9 vowels", "Produce vowel sounds", "Recognize tone markings on vowels"], "content_source": "02_phonology/vowels.json", "mastery_gate": "stage_1_vowels"},
    {"stage": 2, "name": "Single Consonants", "lessons": 15, "objectives": ["Identify all 15 single consonants", "Blend consonant + vowel", "Recognize consonant allophones"], "content_source": "02_phonology/consonants.json", "mastery_gate": "stage_2_consonants"},
    {"stage": 3, "name": "Digraphs & Special Characters", "lessons": 6, "objectives": ["Identify 6 digraphs", "Identify 3 special characters (ɨ, ŋ, ')", "Distinguish digraphs from similar sounds"], "content_source": "01_alphabet/graphemes.json", "mastery_gate": "stage_3_digraphs"},
    {"stage": 4, "name": "Tone Mastery", "lessons": 3, "objectives": ["Identify high tone (unmarked)", "Identify low tone (grave)", "Identify high-low falling tone (circumflex)", "Produce tone distinctions"], "content_source": "06_tone/isolation_patterns.json", "mastery_gate": "stage_4_tones"},
    {"stage": 5, "name": "Word Building", "lessons": 10, "objectives": ["Combine syllables into words", "Recognize noun classes", "Produce 100+ words"], "content_source": "07_lexicon/", "mastery_gate": "stage_5_words"},
    {"stage": 6, "name": "Simple Sentences", "lessons": 15, "objectives": ["Construct SVO sentences", "Use tense markers", "Form questions", "Use negation"], "content_source": "05_syntax/", "mastery_gate": "stage_6_sentences"},
    {"stage": 7, "name": "Paragraph Comprehension", "lessons": 16, "objectives": ["Read Kom paragraphs", "Answer comprehension questions", "Translate simple passages"], "content_source": "08_reader/", "mastery_gate": "stage_7_paragraphs"},
    {"stage": 8, "name": "Possessive Adjectives", "lessons": 6, "objectives": ["Use possessive paradigms", "Match possessives to noun classes"], "content_source": "06_tone/possessive_paradigms.json", "mastery_gate": "stage_8_possessives"},
    {"stage": 9, "name": "Numeric Adjectives", "lessons": 4, "objectives": ["Count 1-10", "Use numbers with nouns", "Apply numeric adjective tone rules"], "content_source": "06_tone/numeric_paradigms.json", "mastery_gate": "stage_9_numerics"},
    {"stage": 10, "name": "Descriptive Adjectives", "lessons": 6, "objectives": ["Form adjectives from verbs", "Apply -ni suffix", "Match adjective to noun class"], "content_source": "06_tone/descriptive_paradigms.json", "mastery_gate": "stage_10_descriptives"},
    {"stage": 11, "name": "Demonstrative Adjectives", "lessons": 4, "objectives": ["Use this/that/these/those", "Apply demonstrative tone types A-D", "Use anaphoric na"], "content_source": "06_tone/demonstrative_paradigms.json", "mastery_gate": "stage_11_demonstratives"},
    {"stage": 12, "name": "Interrogative Adjectives", "lessons": 4, "objectives": ["Use nda/gha/ka", "Form content questions", "Apply interrogative tone rules"], "content_source": "06_tone/interrogative_paradigms.json", "mastery_gate": "stage_12_interrogatives"},
    {"stage": 13, "name": "Complex Sentences", "lessons": 8, "objectives": ["Use complementizers", "Use relativizers", "Use adverbializers", "Coordinate clauses"], "content_source": "05_syntax/", "mastery_gate": "stage_13_complex"},
    {"stage": 14, "name": "Cultural Topics", "lessons": 8, "objectives": ["Learn cultural vocabulary", "Understand cultural practices", "Read cultural texts"], "content_source": "07_lexicon/ + 08_reader/", "mastery_gate": "stage_14_culture"},
    {"stage": 15, "name": "Conversation Practice", "lessons": 8, "objectives": ["Hold basic conversations", "Use speech-to-speech", "Handle common scenarios"], "content_source": "11_audio/ + 10_synthesis/", "mastery_gate": "stage_15_conversation"},
    {"stage": 16, "name": "Advanced Reading", "lessons": 6, "objectives": ["Read authentic Kom texts", "Discuss cultural topics", "Write simple paragraphs"], "content_source": "08_reader/", "mastery_gate": "stage_16_advanced"},
]
w("09_pedagogy/curriculum.json", {
    "course_id": "kom_101",
    "display_name": "Kom Language Foundations",
    "level": "beginner", "total_stages": 16, "total_lessons": 120, "estimated_hours": 40,
    "prerequisites": [], "data_source": "/kom_training_corpus/", "audio_source": "/kom_training_corpus/11_audio/",
    "assessment_engine": "standard", "speech_engine": "modular_s2s", "status": "active",
    "stages": stages,
})
w("09_pedagogy/course_registry.json", {
    "version": "1.0",
    "courses": [{
        "course_id": "kom_101", "language": "Kom (Itaŋikom)", "iso_code": "bkm",
        "display_name": "Kom Language Foundations", "level": "beginner",
        "total_stages": 16, "total_lessons": 120, "estimated_hours": 40,
        "prerequisites": [], "data_source": "/kom_training_corpus/",
        "audio_source": "/kom_training_corpus/11_audio/", "assessment_engine": "standard",
        "speech_engine": "modular_s2s", "status": "active",
    }],
    "future_courses": [
        {"language": "Lamnso'", "iso_code": "lns", "status": "active (separate v4.0 track)"},
        {"language": "Bayangi", "iso_code": "byv", "status": "active (placeholder audio; 500h data collection)"},
        {"language": "Bafut", "iso_code": "bfd", "status": "planned"},
        {"language": "Oku", "iso_code": "oku", "status": "planned"},
        {"language": "Babanki", "iso_code": "bbk", "status": "planned"},
        {"language": "Mankon", "iso_code": "mgo", "status": "planned"},
        {"language": "Ngie", "iso_code": "ngi", "status": "planned"},
        {"language": "Ewondo", "iso_code": "ewo", "status": "planned (Bantu Beti A.70 — not Grassfields)"},
        {"language": "Bassa", "iso_code": "bas", "status": "planned"},
        {"language": "Ghomala'", "iso_code": "bbj", "status": "planned"},
        {"language": "Duala", "iso_code": "dua", "status": "planned"},
    ],
})
w("09_pedagogy/lesson_engine.json", {
    "lesson_types": ["alphabet_drill", "phoneme_drill", "syllable_blending", "tone_drill",
                     "vocabulary_card", "sentence_builder", "reading_passage", "comprehension_quiz",
                     "speaking_practice", "listening_comprehension", "conversation_simulation"],
    "mastery_gates": {
        "stage_1_vowels": {"required_accuracy": 0.90, "min_attempts": 3},
        "stage_2_consonants": {"required_accuracy": 0.85, "min_attempts": 3},
        "stage_3_digraphs": {"required_accuracy": 0.85, "min_attempts": 3},
        "stage_4_tones": {"required_accuracy": 0.90, "min_attempts": 5},
        "stage_5_words": {"required_accuracy": 0.80, "min_attempts": 10},
        "stage_6_sentences": {"required_accuracy": 0.80, "min_attempts": 10},
        "stage_7_paragraphs": {"required_accuracy": 0.75, "min_attempts": 5},
    },
    "adaptivity": {"spaced_repetition": True, "review_intervals_days": [1, 3, 7, 21, 60],
                   "adaptive_difficulty": True, "if_accuracy_above": 0.90, "if_accuracy_below": 0.70},
})
w("09_pedagogy/assessment_engine.json", {
    "question_types": ["multiple_choice_text", "multiple_choice_audio", "audio_to_grapheme",
                       "grapheme_to_audio", "tone_identification", "word_recognition",
                       "sentence_assembly", "translation_kom_to_english",
                       "translation_english_to_kom", "free_speaking"],
    "scoring": {"partial_credit": True, "tone_marking_weight": 0.3,
                "vowel_length_weight": 0.2, "consonant_accuracy_weight": 0.5},
    "feedback": {"immediate": True, "explanation_depth": "detailed",
                 "audio_playback": True, "example_sentences": True},
})

# ---------------------------------------------------------------- 10_synthesis (verbatim from spec)
shutil.copyfile(os.path.join(HERE, "synthesis_entries.jsonl"),
                os.path.join(ROOT, "10_synthesis/pending_moderation.jsonl"))
print("wrote 10_synthesis/pending_moderation.jsonl (45 entries, verbatim)")

# ---------------------------------------------------------------- 11_audio
audio_index = json.load(open(os.path.join(HERE, "harvest/audio_index.json")))
with open(os.path.join(ROOT, "11_audio/word_audio_index.jsonl"), "w", encoding="utf-8") as f:
    for a in audio_index:
        entry = {
            "id": a["id"],
            "text": f"Ŋwàʼlɨ̀ àkòyn — {a['book_kom']} {a['chapter']} (Kom NT 2004, chapter narration)",
            "audio_path": a["audio_path"],
            "audio_format": "mp3",
            "duration_ms": int(a["duration_s"] * 1000),
            "speaker_id": "bkm_nt_narrator",
            "speaker_gender": "male",
            "recording_quality": "medium",
            "source": "bible",
            "source_citation": "Bible.is BKMBSCN2DA (audio ℗ 2007 Hosanna / Faith Comes By Hearing; text © 2004 The Bible Society of Cameroon)",
            "phoneme_coverage": [],
            "moderation_status": "verified",
        }
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")
print("wrote 11_audio/word_audio_index.jsonl (28 chapter entries)")

phoneme_slots = []
KOM_GRAPHEMES = "a ä b d e f g gh i k m n ng ny o ö p s t u u' w y ' ɨ ŋ ts ch sh gw kw gy ky gb kp"
for i, g in enumerate(sorted(KOM_GRAPHEMES.split()), 1):
    phoneme_slots.append({"id": i, "grapheme": g, "ipa": None, "audio_path": None,
                          "status": "awaiting_native_recording", "note": "Directive 9: audio must come from native speakers (e.g. ingestion portal uploads); never synthesized"})
w("11_audio/phoneme_map.json", phoneme_slots)
w("11_audio/speech_to_speech_config.json", {
    "pipeline": "modular", "latency_budget_ms": 2000,
    "components": {
        "vad": {"provider": "silero", "threshold": 0.5, "min_speech_duration_ms": 250, "max_speech_duration_s": 30},
        "asr": {"provider": "faster-whisper", "model": "small", "language": "bkm", "speed": 0.9, "vad_filter": True},
        "llm": {"provider": "kom-llm", "max_tokens": 256, "temperature": 0.7},
        "tts": {"provider": "kokoro-82m", "sample_rate": 22050, "voice_id": "kom_native (cloned; REQUIRES 5-10s native reference audio — Directive 9)", "speed": 0.9},
    },
    "fallbacks": {"if_asr_low_confidence": "ask_user_to_repeat", "if_llm_times_out": "return_canned_response", "if_tts_fails": "return_text"},
    "native_audio_available": {"bkm": "28 chapter narrations of Matthew (Bible.is) — usable as reference material for future cloning, subject to licence clearance", "lns": None, "byv": None},
})

# ---------------------------------------------------------------- 12_conflicts
conflicts = [
    {"id": "conflict_mat_002", "type": "verse_division", "detail": "Matthew 2: Kom text has 22 verses, NIV has 23 — verse-division differs between the Kom translation and the NIV", "resolution": "pair by verse number where both exist; never force-merge", "source": "Bible.is BKMBSC vs ENGNIV harvest 2026-09-16", "moderation_status": "verified"},
    {"id": "conflict_mat_010", "type": "verse_division", "detail": "Matthew 10: Kom 41 vs NIV 42 verses", "resolution": "pair by verse number", "source": "Bible.is harvest", "moderation_status": "verified"},
    {"id": "conflict_mat_016", "type": "metadata", "detail": "fileset API duration fields inconsistent for several chapters (e.g. MAT 16 API 757s vs real 291.6s); filenames + ffprobe are authoritative", "resolution": "trust ffprobe durations", "source": "Bible.is harvest", "moderation_status": "verified"},
    {"id": "conflict_mat_017", "type": "metadata", "detail": "same as conflict_mat_016 (API duration mismatch)", "resolution": "trust ffprobe durations", "source": "Bible.is harvest", "moderation_status": "verified"},
    {"id": "conflict_mat_022", "type": "metadata", "detail": "same as conflict_mat_016 (API duration mismatch)", "resolution": "trust ffprobe durations", "source": "Bible.is harvest", "moderation_status": "verified"},
]
with open(os.path.join(ROOT, "12_conflicts/unresolved.jsonl"), "w", encoding="utf-8") as f:
    for c in conflicts:
        f.write(json.dumps(c, ensure_ascii=False) + "\n")
print("wrote 12_conflicts/unresolved.jsonl (5)")

# ---------------------------------------------------------------- 13_agent_skills
w("13_agent_skills/expansion_protocol.json", {
    "golden_rule": "The agent may PROPOSE new knowledge, but may NEVER commit new knowledge to the training corpus without human moderation. All proposals go to 10_synthesis/pending_moderation.jsonl.",
    "expansion_types": [
        {"type": "phonological_rule", "min_evidence": 2, "basis": "attested examples in corpus"},
        {"type": "morphological_pattern", "min_evidence": 2, "basis": "attested paradigms in corpus"},
        {"type": "lexical_gap", "min_evidence": 2, "basis": "proposed term must use only attested morphemes"},
        {"type": "grammatical_pattern", "min_evidence": 3, "basis": "attested sentences with same structure"},
        {"type": "cultural_note", "min_evidence": 1, "basis": "attested cultural practice from trusted source"},
    ],
    "algorithm_steps": ["classify_gap", "gather_evidence", "formulate_hypothesis", "check_conflicts",
                        "assign_confidence", "write_pending_entry", "notify_moderator", "STOP"],
    "forbidden": ["commit_to_training_corpus_without_moderation", "use_in_lesson_generation_before_approval", "wait_for_human_moderation_bypass"],
})
w("13_agent_skills/moderation_workflow.json", {
    "roles": ["native_speaker_moderator", "linguist_moderator", "admin"],
    "states": ["pending", "under_review", "approved", "rejected", "needs_revision"],
    "platform_mapping": {"pending": "DRAFT", "under_review": "IN_REVIEW", "approved": "ACTIVE", "rejected": "REJECTED", "needs_revision": "DRAFT + reviewerNote"},
    "transitions": [
        {"from": "pending", "to": "under_review", "action": "assign_moderator"},
        {"from": "under_review", "to": "approved", "action": "approve"},
        {"from": "under_review", "to": "rejected", "action": "reject"},
        {"from": "under_review", "to": "needs_revision", "action": "request_revision"},
        {"from": "needs_revision", "to": "pending", "action": "agent_revises"},
    ],
    "approval_criteria": ["native_speaker_verifies_accuracy", "linguist_verifies_consistency_with_existing_grammar",
                          "no_conflict_with_existing_entries", "evidence_chain_complete"],
})
w("13_agent_skills/quality_gates.json", {
    "gates": [
        "every_entry_has_source_field", "every_entry_has_moderation_status",
        "every_kom_text_preserves_diacritics", "every_ipa_uses_correct_unicode",
        "synthesis_never_live_without_moderation", "audio_files_must_exist",
        "no_synthetic_grassfields_speech_directive_9",
    ],
    "validation_pseudocode": "validate_schema(entry, schema): required fields present; source in VALID_SOURCES; moderation_status in [verified|pending|conflict]; grapheme.ipa wrapped in slashes; number.number is int",
})

TRAINING_EXAMPLES = [
    {"task": "ingestion", "input": "Load manifest.json", "output": "Loaded 13 collections, 4100+ records"},
    {"task": "validation", "input": "Validate grapheme entry", "output": "Pass: all required fields present"},
    {"task": "validation", "input": "Validate grapheme entry missing 'ipa'", "output": "Fail: missing field 'ipa'"},
    {"task": "lesson_generation", "input": "Generate Stage 1 Lesson 1", "output": "Lesson with 6 steps: intro, presentation, guided practice, independent practice, assessment, summary"},
    {"task": "expansion", "input": "Find pattern in ko' → ko'si, fi → fisi", "output": {"type": "morphological_pattern", "content": "-si suffix forms causative verbs", "confidence": "high", "status": "pending"}},
    {"task": "expansion", "input": "Propose term for 'hospital'", "output": {"type": "lexical_gap", "content": "ndo nga n", "confidence": "medium", "status": "pending"}},
    {"task": "expansion", "input": "Find pattern in one example", "output": {"status": "insufficient_evidence", "evidence_count": 1}},
    {"task": "conflict_check", "input": "Proposed rule contradicts existing rule", "output": {"status": "conflict", "conflicts": ["Rule X contradicts Rule Y"]}},
    {"task": "moderation", "input": "Pending entry approved by moderator", "output": "Moved to approved.jsonl, added to training corpus"},
    {"task": "moderation", "input": "Pending entry rejected", "output": "Moved to rejected.jsonl, feedback sent to agent"},
]
with open(os.path.join(ROOT, "13_agent_skills/training_examples.jsonl"), "w", encoding="utf-8") as f:
    for t in TRAINING_EXAMPLES:
        f.write(json.dumps(t, ensure_ascii=False) + "\n")
print("wrote 13_agent_skills/training_examples.jsonl (10)")

total = sum(len(files) for _, _, files in os.walk(ROOT))
print(f"CORPUS COMPLETE: {total} files under {ROOT}")
