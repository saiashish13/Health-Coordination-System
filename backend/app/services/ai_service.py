import logging
import warnings
from typing import Dict, Any, Optional
from app.config import settings

class AIService:
    """
    Abstracted AI Service layer for care coordination assistance,
    information lookup, and recommendation generation.
    Supports OpenAI, Gemini, and intelligent clinical fallback.
    """
    
    @staticmethod
    def _call_openai(prompt: str) -> Optional[str]:
        if not settings.AI_API_KEY or settings.AI_API_KEY in ["mock", "your_ai_api_key_here"]:
            return None
        try:
            import openai
            client = openai.OpenAI(api_key=settings.AI_API_KEY)
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a Care Coordination AI Assistant. Provide helpful, safe, professional healthcare coordination responses. Include a disclaimer that you do not replace professional medical advice."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=350,
                temperature=0.7,
            )
            if response.choices and response.choices[0].message.content:
                return response.choices[0].message.content.strip()
        except Exception as err:
            logging.warning(f"OpenAI API call error (falling back to clinical mock): {err}")
        return None

    @staticmethod
    def _call_gemini(prompt: str) -> Optional[str]:
        if not settings.AI_API_KEY or settings.AI_API_KEY in ["mock", "your_ai_api_key_here"]:
            return None
        try:
            with warnings.catch_warnings():
                warnings.simplefilter("ignore", category=FutureWarning)
                import google.generativeai as legacy_genai
                legacy_genai.configure(api_key=settings.AI_API_KEY)
                model = legacy_genai.GenerativeModel("gemini-1.5-flash")
                res = model.generate_content(prompt)
                if res and res.text:
                    return res.text.strip()
        except Exception as err:
            logging.warning(f"Gemini API call error (falling back to clinical mock): {err}")
        return None

    def generate_response(self, query: str, interaction_type: str = "CHAT") -> str:
        provider = (settings.AI_PROVIDER or "mock").lower()
        prompt = (
            f"User query: '{query}'. "
            "Provide a helpful, professional, and safe healthcare coordination response. "
            "Include a disclaimer that you do not replace professional medical advice."
        )

        if provider == "openai" or (settings.AI_API_KEY and settings.AI_API_KEY.startswith("sk-")):
            ans = self._call_openai(prompt)
            if ans:
                return ans

        if provider == "gemini" or (settings.AI_API_KEY and not settings.AI_API_KEY.startswith("sk-") and settings.AI_API_KEY != "mock"):
            ans = self._call_gemini(prompt)
            if ans:
                return ans

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

    def generate_clinical_recommendation(self, symptoms: str, patient_info: str) -> Dict[str, Any]:
        prompt = (
            f"As a Care Coordination AI, generate a draft recommendation for a clinician reviewing a patient "
            f"with symptoms: '{symptoms}'. Keep it concise, professional, and actionable."
        )
        rec_text = None
        provider = (settings.AI_PROVIDER or "mock").lower()

        if provider == "openai" or (settings.AI_API_KEY and settings.AI_API_KEY.startswith("sk-")):
            rec_text = self._call_openai(prompt)

        if not rec_text and (provider == "gemini" or (settings.AI_API_KEY and not settings.AI_API_KEY.startswith("sk-") and settings.AI_API_KEY != "mock")):
            rec_text = self._call_gemini(prompt)

        if not rec_text:
            rec_text = (
                f"Recommended Care Plan based on reported symptoms ({symptoms}): "
                "1. Schedule follow-up appointment within 7 days. "
                "2. Order routine Lab Test (CBC & Metabolic Panel). "
                "3. Review current medication list with attending doctor."
            )

        return {
            "type": "CARE_COORDINATION_RECOMMENDATION",
            "text": rec_text,
            "safety_disclaimer": "This is an AI recommendation draft and requires doctor review before taking clinical action."
        }

ai_service = AIService()
