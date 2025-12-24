from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import *
import razorpay
from django.conf import settings
from decimal import Decimal
from .serializers import *
from datetime import date

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_razorpay_order(request):

    try:
        amount = request.data.get("amount")  # in rupees
        print(amount)
        client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )
        
        amount = Decimal(amount)
        amount_in_paise = int(amount * 100)

        order = client.order.create({
            "amount": int(amount_in_paise),  # paise
            "currency": "INR",
            "payment_capture": 1
        })

        return Response({
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": "INR"
        })

    except Exception as e:
        print(e)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
import random
import string

def generate_random_alphanumeric(length):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_payment_and_create_appointment(request):

    try:
        data = request.data
        print(data)
        client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )

        client.utility.verify_payment_signature({
            "razorpay_order_id": data["razorpay_order_id"],
            "razorpay_payment_id": data["razorpay_payment_id"],
            "razorpay_signature": data["razorpay_signature"],
        })
        
        room = generate_random_alphanumeric(10)
        
        patient_url = f"https://1d28ac482789.ngrok-free.app/peer1/{room}"
        doctor_url = f"https://1d28ac482789.ngrok-free.app/peer2/{room}"

        appointment = Appointment.objects.create(
            doctor_id=data["doctor_id"],
            patient=request.user,
            appointment_date=data["date"],
            start_time=data["start_time"],
            end_time=data["end_time"],
            amount=data["amount"],
            payment_status="paid",
            razorpay_order_id=data["razorpay_order_id"],
            razorpay_payment_id=data["razorpay_payment_id"],
            doctor_link=doctor_url,
            patient_link=patient_url
        )

        return Response(
            {
                "message": "Appointment booked successfully",
                "appointment_id": appointment.id
            },
            status=status.HTTP_201_CREATED
        )

    except razorpay.errors.SignatureVerificationError:
        return Response(
            {"message": "Payment verification failed"},
            status=status.HTTP_400_BAD_REQUEST
        )

    except Exception as e:
        print(e)
        return Response(
            {"message": "Something went wrong", "error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# @api_view(["POST"])
# @permission_classes([IsAuthenticated])
# @parser_classes([MultiPartParser, FormParser])
# def upload_transcription(request, appointment_id):

#     try:
#         appointment = Appointment.objects.get(
#             id=appointment_id,
#             doctor=request.user
#         )

#         appointment.transcription_file = request.FILES["file"]
#         appointment.status = "completed"
#         appointment.save()

#         return Response(
#             {"message": "Transcription uploaded successfully"},
#             status=status.HTTP_200_OK
#         )

#     except Appointment.DoesNotExist:
#         return Response(
#             {"message": "Appointment not found"},
#             status=status.HTTP_404_NOT_FOUND
#         )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_booked_appointments(request):
    """
    Get appointments with status filter:
    - upcoming  -> booked + today/future
    - completed -> status = completed
    - cancelled -> status = cancelled
    - all       -> all appointments
    """

    user = request.user

    try:
        # ---------------- QUERY PARAM ----------------
        status_filter = request.GET.get("status", "all").lower()
        today = date.today()

        # ---------------- BASE QUERY ----------------
        try:
            if user.role == "patient":
                appointments = Appointment.objects.filter(patient=user)

            elif user.role == "doctor":
                appointments = Appointment.objects.filter(doctor=user)

            elif user.role == "admin":
                appointments = Appointment.objects.all()

            else:
                return Response(
                    {"message": "Unauthorized role"},
                    status=status.HTTP_403_FORBIDDEN
                )

        except Exception as e:
            return Response(
                {
                    "message": "Database error while fetching appointments",
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # ---------------- SEARCH FILTER ----------------
        try:
            if status_filter == "upcoming":
                # ✅ booked + today & future
                appointments = appointments.filter(
                    status="booked",
                    appointment_date__gte=today
                )

            elif status_filter == "completed":
                appointments = appointments.filter(
                    status="completed"
                )

            elif status_filter == "cancelled":
                appointments = appointments.filter(
                    status="cancelled"
                )

            elif status_filter == "all":
                pass  # no filter

            else:
                return Response(
                    {
                        "message": "Invalid status filter",
                        "allowed_values": [
                            "upcoming",
                            "completed",
                            "cancelled",
                            "all"
                        ]
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        except Exception as e:
            return Response(
                {
                    "message": "Error while applying status filter",
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # ---------------- ORDERING ----------------
        appointments = appointments.order_by(
            "appointment_date", "start_time"
        )

        # ---------------- SERIALIZER ----------------
        serializer = AppointmentSerializer(
            appointments, many=True
        )

        return Response(
            {
                "message": "Appointments fetched successfully",
                "status_filter": status_filter,
                "count": appointments.count(),
                "appointments": serializer.data
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {
                "message": "Unexpected error occurred",
                "error": str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
