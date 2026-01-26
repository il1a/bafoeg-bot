**REQUIRED TOOL** – Qdrant BAföG knowledge base.

**CONSTRAINT**: You are allowed EXACTLY ONE call to this tool per user turn. Combine all keywords into a SINGLE German query. Do NOT make parallel or multiple requests.

You MUST call this tool before answering any BAföG-related question.

**Metadata fields by source type:**

**Law documents (source_type: "law"):**
- url: Source URL
- info_category: "official_law"
- source_file: XML filename (e.g., "Bundesausbildungsförderungsgesetz.xml")
- paragraph_id: § reference (e.g., "§ 10")
- title: Section title (e.g., "Alter")
- absatz: Subsection number ("1", "2a", "3") or "full" or "intro"
- chunk_level: "absatz" or "paragraph"
- last_updated: YYYY-MM-DD format
- last_checked: YYYY-MM-DD format

**Webpages (source_type: "webpage"):**
- url: Source URL
- info_category: "faq_explanation", "official_guidance", "illustrative_example", "form_reference", etc.
- source_file: TXT filename (e.g., "Fragen und Antworten.txt")
- chunk_type: "qa_pair", "example", "paragraph", "full_document"
- chunk_index: Which chunk of the file (1-indexed)
- total_chunks: Total chunks from this file
- question: The original question text (only present for chunk_type: "qa_pair")
- last_updated: DD-MM-YYYY format
- last_checked: DD-MM-YYYY format

Always query in German, regardless of user language.