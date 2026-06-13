from langchain_core.prompts import PromptTemplate

NOTES_GENERATION_PROMPT = PromptTemplate(
    template="""You are an expert study guide writer. Create comprehensive study notes from the following research paper content.

Paper Content:
{paper_input}

Generate study notes that include:
1. **Key Concepts** - Main ideas and definitions
2. **Methodology** - How the research was conducted
3. **Key Findings** - Important results and discoveries
4. **Important Equations/Formulas** - Mathematical concepts if any
5. **Experimental Setup** - Details of experiments if applicable
6. **Limitations** - Known constraints or limitations
7. **Future Work** - Suggested future research directions
8. **Study Tips** - Memory aids and connections to other concepts

Format the notes in clear markdown with headers and bullet points. Make them suitable for students learning this material.""",
    input_variables=["paper_input"],
    validate_template=True,
)

NOTES_HIGHLIGHT_PROMPT = PromptTemplate(
    template="""Extract and highlight the most important information from this paper excerpt for study notes.

Paper Excerpt:
{excerpt}

Provide:
1. Key takeaways (3-5 points)
2. Important definitions
3. Critical findings
4. Relevant equations
5. Study questions

Format as structured markdown.""",
    input_variables=["excerpt"],
)