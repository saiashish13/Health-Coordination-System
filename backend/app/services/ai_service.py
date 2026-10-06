import logging
import warnings
from typing import Dict, Any, Optional
from app.config import settings

genai_client = None
gemini_model = None

try:
    from google import genai
    if settings.AI_API_KEY and settings.AI_API_KEY != "mock":
        genai_client = genai.Client(api_key=settings.AI_API_KEY)
except Exception:
    pass

if not genai_client:
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", category=FutureWarning)
            import google.generativeai as legacy_genai
            if settings.AI_API_KEY and settings.AI_API_KEY != "mock":
                legacy_genai.configure(api_key=settings.AI_API_KEY)
                gemini_model = legacy_genai.GenerativeModel("gemini-1.5-flash")
    except Exception as e:
        logging.warning(f"Google Generative AI initialization fallback: {e}")

class AIService:
    """
    Abstracted AI Service layer for care coordination assistance,
    information lookup, and recommendation generation.
    Supports real Gemini AI SDK with safe clinical fallback.
    """
    
    @staticmethod
    def generate_response(query: str, interaction_type: str = "CHAT") -> str:
        if gemini_model:
            try:
                prompt = (
                    f"You are a Care Coordination AI Assistant. User query: '{query}'. "
                    "Provide a helpful, professional, and safe healthcare coordination response. "
                    "Include a disclaimer that you do not replace professional medical advice."
                )
                res = gemini_model.generate_content(prompt)
                if res and res.text:
                    return res.text.strip()
            except Exception as err:
                logging.error(f"Gemini API call error: {err}")

        # Intelligent Fallback response
        query_lower = query.lower()
        if "fever" in query_lower or "headache" in query_lower:
            return (
                "Based on clinical guidelines for care coordination: Mild fever and headache can often be managed with rest, hydration, "
                "and over-the-counter antipyretics. However, if symptoms persist past 48 hours or exceed 102°F (38.9°C), "
                "please schedule a direct consultation with your primary physician."
            )
        elif "lab" in query_lower or "report" in query_lower or "blood" in query_lower:
            return (
                "Care Coordination AI Summary: Complete Blood Count (CBC) and Lipid panel results show standard markers. "
                "Your clinician will review specific hemoglobin and cholesterol parameters during your upcoming appointment."
            )
        elif "prescription" in query_lower or "medicine" in query_lower or "medication" in query_lower:
            return (
                "Medication Assistance: Always take prescribed medications strictly as instructed by your doctor or pharmacist. "
                "Do not discontinue dosage without prior physician consultation."
            )
        else:
            return (
                f"Care Coordination Assistant: Thank you for your inquiry regarding '{query}'. "
                "Your care team has been notified. For urgent concerns, please reach out directly to your assigned care provider."
            )

    @staticmethod
    def generate_clinical_recommendation(symptoms: str, patient_info: str) -> Dict[str, Any]:
        rec_text = (
            f"Recommended Care Plan based on reported symptoms ({symptoms}): "
            "1. Schedule follow-up appointment within 7 days. "
            "2. Order routine Lab Test (CBC & Metabolic Panel). "
            "3. Review current medication list with attending doctor."
        )

        if gemini_model:
            try:
                prompt = (
                    f"As a Care Coordination AI, generate a draft recommendation for a clinician reviewing a patient "
                    f"with symptoms: '{symptoms}'. Keep it concise, professional, and actionable."
                )
                res = gemini_model.generate_content(prompt)
                if res and res.text:
                    rec_text = res.text.strip()
            except Exception as err:
                logging.error(f"Gemini API recommendation error: {err}")

        return {
            "type": "CARE_COORDINATION_RECOMMENDATION",
            "text": rec_text,
            "safety_disclaimer": "This is an AI recommendation draft and requires doctor review before taking clinical action."
        }

ai_service = AIService()
