from cachetools import LRUCache
class RAGCache:
    _cache = LRUCache(
        maxsize=20
    )
    @classmethod
    def get(cls,key):
        return cls._cache.get(key)
    @classmethod
    def set(cls,key,value):
        cls._cache[key]=value