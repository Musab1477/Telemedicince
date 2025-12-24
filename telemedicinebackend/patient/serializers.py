from rest_framework import serializers
from .models import *

class AppointmentSerializer(serializers.ModelSerializer):

    doctor_name = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            "id",
            "doctor",
            "doctor_name",
            "patient",
            "patient_name",
            "appointment_date",
            "start_time",
            "end_time",
            "status",
            "payment_status",
            "amount",
            "doctor_link",
            "patient_link",
            "razorpay_order_id",
            "razorpay_payment_id",
            "transcription_file",
            "created_at",
        ]

    def get_doctor_name(self, obj):
        if obj.doctor:
            return f"{obj.doctor.first_name} {obj.doctor.last_name}".strip()
        return None

    def get_patient_name(self, obj):
        if obj.patient:
            return f"{obj.patient.first_name} {obj.patient.last_name}".strip()
        return None
