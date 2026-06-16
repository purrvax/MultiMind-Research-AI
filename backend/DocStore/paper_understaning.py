from DocStore.chunkintelligence import ChunkIntelligenceEngine
from DocStore.synthesis import PaperSynthesisService

class PaperUnderstandingService:
    def __init__(self, llm):
        self.llm = llm

    def generate(self, document_store):
        print("Running Chunk Intelligence...")
        engine = ChunkIntelligenceEngine(
            llm=self.llm,
            batch_size=5
        )
        structured_chunks = (
            engine.process_chunks(
                document_store.chunks
            )
        )
        print(
            f"Generated {len(structured_chunks)} structured chunks"
        )
        print("Generating Paper Understanding...")
        synthesis_service = PaperSynthesisService (llm=self.llm)
        
        paper_understanding = (
            synthesis_service.synthesize(
                structured_chunks
            )
        )
        return paper_understanding