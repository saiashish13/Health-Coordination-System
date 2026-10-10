from typing import Generic, TypeVar, Optional, List
from pydantic import BaseModel

T = TypeVar("T")

class ResponseModel(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Request successful"
    data: Optional[T] = None
    error_code: Optional[str] = None

class PaginationMetadata(BaseModel):
    page: int = 1
    page_size: int = 20
    total: int = 0

class PaginatedResponseModel(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Request successful"
    data: List[T] = []
    pagination: PaginationMetadata
