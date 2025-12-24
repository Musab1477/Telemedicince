from django.db import models

# Create your models here.
class Appointment(models.Model):

    STATUS_CHOICES = [
        ("booked", "Booked"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    PAYMENT_STATUS = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("failed", "Failed"),
    ]

    doctor = models.ForeignKey(
        'Authentication.User',
        on_delete=models.CASCADE,
        related_name="doctor_appointments"
    )

    patient = models.ForeignKey(
        'Authentication.User',
        on_delete=models.CASCADE,
        related_name="patient_appointments"
    )

    appointment_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="booked"
    )
    
    doctor_link = models.URLField(max_length=500, null=True, blank=True)
    patient_link = models.URLField(max_length=500, null=True, blank=True)
    # 💳 Payment fields
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS,
        default="pending"
    )

    razorpay_order_id = models.CharField(
        max_length=200, blank=True, null=True
    )

    razorpay_payment_id = models.CharField(
        max_length=200, blank=True, null=True
    )

    amount = models.DecimalField(
        max_digits=10, decimal_places=2
    )

    # 📝 Transcription after call
    transcription_file = models.FileField(
        upload_to="transcriptions/",
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = (
            "doctor",
            "appointment_date",
            "start_time"
        )

    def __str__(self):
        return f"{self.patient} → {self.doctor} | {self.appointment_date}"

