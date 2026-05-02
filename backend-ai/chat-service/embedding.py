from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
DIMENSION = 384
SIMILARITY_THRESHOLD = 0.85

# Use a mutable container so updates are visible across all imports
store = {
    "vectors": [],
    "id_map": []
}


def normalize(vec: np.ndarray) -> np.ndarray:
    norm = np.linalg.norm(vec)
    return vec / norm if norm > 0 else vec


def generate_embedding(text: str) -> np.ndarray:
    text = text.lower().strip()
    vec = model.encode(text, convert_to_numpy=True)
    return normalize(vec).astype("float32")


def load_all_embeddings(complaints: list):
    store["vectors"] = []
    store["id_map"] = []

    for c in complaints:
        if c["embedding"]:
            vec = np.array(c["embedding"], dtype="float32")
            vec = normalize(vec)
            store["vectors"].append(vec)
            store["id_map"].append(c["id"])

    print(f"Embeddings loaded: {len(store['id_map'])} complaints")


def add_to_index(complaint_id: int, embedding: np.ndarray):
    store["vectors"].append(normalize(embedding).astype("float32"))
    store["id_map"].append(complaint_id)


def search_similar(embedding: np.ndarray, candidate_ids: list):
    if not candidate_ids or not store["id_map"]:
        return []

    candidate_set = set(candidate_ids)
    matches = []

    for i, cid in enumerate(store["id_map"]):
        if cid in candidate_set:
            similarity = float(np.dot(embedding, store["vectors"][i]))
            print(f"  comparing with complaint #{cid}: similarity={similarity:.3f}")
            if similarity >= SIMILARITY_THRESHOLD:
                matches.append((cid, similarity))

    matches.sort(key=lambda x: x[1], reverse=True)
    print(f"  comparing with complaint #{cid}: similarity={similarity:.3f}")
    return matches