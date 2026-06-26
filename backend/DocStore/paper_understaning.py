from DocStore.chunkintelligence import ChunkIntelligenceEngine
from DocStore.synthesis import PaperSynthesisService
from cancel_manager import CancellationError, is_cancelled

class PaperUnderstandingService:
    def __init__(self, llm):
        self.llm = llm

    def _raise_if_cancelled(self, task_id):
        if is_cancelled(task_id):
            print(f"cancellation detected: {task_id}")
            raise CancellationError()

    def generate(self, document_store, task_id):
        self._raise_if_cancelled(task_id)
        print("Running Chunk Intelligence...")
        engine = ChunkIntelligenceEngine(
            llm=self.llm,
            batch_size=5
        )
        structured_chunks = (
            engine.process_chunks(
                document_store.chunks,
                task_id
            )
        )
        self._raise_if_cancelled(task_id)
        print(
            f"Generated {len(structured_chunks)} structured chunks"
        )
        print("Generating Paper Understanding...")
        synthesis_service = PaperSynthesisService (llm=self.llm)
        self._raise_if_cancelled(task_id)
        
        paper_understanding = (
            synthesis_service.synthesize(
                structured_chunks,
                task_id
            )
        )
        self._raise_if_cancelled(task_id)
        return paper_understanding
