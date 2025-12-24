from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login, logout
from .models import *
from .models import OTP
from rest_framework.permissions import IsAuthenticated
from .serializers import *
from django.db import IntegrityError
from .utils import generate_otp, send_otp_twilio
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.paginator import Paginator, EmptyPage
from django.db.models import Q

def get_tokens_for_user(user):
    """
    Helper function to generate JWT tokens for user
    """
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):
    
    print("Login request data:", request.data)  # Debugging line
    mobile_number = request.data.get("mobile_number")
    password = request.data.get("password")  # optional

    if not mobile_number:
        return Response({"message": "Mobile number is required"}, status=400)

    try:
        user = User.objects.get(mobile_number=mobile_number)
    except User.DoesNotExist:
        return Response({"message": "User not found"}, status=404)

    # 🔐 Doctor / Hospital → password required
    if user.role in ["doctor", "hospital"]:
        if not password:
            return Response({"message": "Password required"}, status=400)

        if not user.check_password(password):
            return Response({"message": "Invalid password"}, status=401)

    # 🔑 Generate OTP
    otp_code = generate_otp()
    OTP.objects.create(user=user, otp=otp_code)

    # 📲 SEND OTP VIA TWILIO (DEV MODE)
    send_otp_twilio(otp_code)

    return Response(
        {
            "message": "OTP sent to registered number",
            "user_id": user.id,
            "role": user.role
        },
        status=200
    )

@api_view(["POST"])
@permission_classes([AllowAny])
def verify_otp_and_login(request):
    """
    Step-2 OTP verification & JWT issue
    """

    user_id = request.data.get("user_id")
    otp_entered = request.data.get("otp")

    if not user_id or not otp_entered:
        return Response(
            {"message": "User ID and OTP are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        otp_obj = OTP.objects.filter(user_id=user_id).latest("created_at")
    except OTP.DoesNotExist:
        return Response(
            {"message": "OTP not found"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if otp_obj.is_expired():
        return Response(
            {"message": "OTP expired"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if otp_obj.otp != otp_entered:
        return Response(
            {"message": "Invalid OTP"},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = otp_obj.user
    tokens = get_tokens_for_user(user)

    return Response(
        {
            "message": "Login successful",
            "user": {
                "id": user.id,
                "role": user.role,
                "mobile_number": user.mobile_number,
            },
            "tokens": tokens,
        },
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
def logout_user(request):
    """
    Function-based logout API - destroys session
    """
    logout(request)
    return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile_view(request):
    user = request.user
    return Response({
        "id": user.id,
        "role": user.role,
        "mobile_number": user.mobile_number,
    })

    
    

@api_view(["POST"])
@permission_classes([AllowAny])
def create_patient_user(request):
    """
    Create Patient User (OTP based login only)
    """
    try:
        serializer = CreatePatientSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "message": "Validation error",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        patient = serializer.save()

        return Response(
            {
                "message": "Patient created successfully",
                "patient": {
                    "id": patient.id,
                    "first_name": patient.first_name,
                    "last_name": patient.last_name,
                    "mobile_number": patient.mobile_number,
                    "role": patient.role,
                }
            },
            status=status.HTTP_201_CREATED
        )

    except IntegrityError:
        return Response(
            {
                "message": "Patient with this mobile number already exists"
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    except Exception as e:
        return Response(
            {
                "message": "Something went wrong while creating patient",
                "error": str(e),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    
@api_view(["POST"])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])
def create_doctor_user(request):
    """
    Create Doctor User
    Password auto-generated (firstname+lastname@123)
    Login: mobile number + password + OTP
    """
    try:
        serializer = CreateDoctorSerializer(
            data=request.data,
            context={"request": request}
        )

        if not serializer.is_valid():
            return Response(
                {
                    "message": "Validation error",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        doctor = serializer.save()
        generated_password = serializer.context.get("generated_password")

        return Response(
            {
                "message": "Doctor registered successfully",
                "doctor": {
                    "id": doctor.id,
                    "first_name": doctor.first_name,
                    "last_name": doctor.last_name,
                    "mobile_number": doctor.mobile_number,
                    "email": doctor.email,
                    "role": doctor.role,
                },
                # ⚠️ DEV MODE ONLY
                "generated_password": generated_password,
            },
            status=status.HTTP_201_CREATED
        )

    except IntegrityError:
        return Response(
            {
                "message": "Doctor with this mobile number already exists"
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    except Exception as e:
        return Response(
            {
                "message": "Something went wrong while creating doctor",
                "error": str(e),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_doctor_users(request):
    """
    Get doctor list with:
    - Search by first_name, last_name, specialization
    - Pagination
    """

    try:
        # 🔐 ROLE CHECK
        if request.user.role not in ["admin", "hospital", "hospital-doctor","patient"]:
            return Response(
                {"message": "You are not authorized to view doctors"},
                status=status.HTTP_403_FORBIDDEN
            )

        # ---------------- QUERY PARAMS ----------------
        search_query = request.GET.get("search", "").strip()
        page = int(request.GET.get("page", 1))
        per_page = int(request.GET.get("per_page", 10))

        # ---------------- BASE QUERY ----------------
        try:
            doctors = User.objects.filter(role="doctor")
        except Exception as e:
            return Response(
                {
                    "message": "Database error while fetching doctors",
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # ---------------- SEARCH FILTER ----------------
        try:
            if search_query:
                doctors = doctors.filter(
                    Q(first_name__icontains=search_query) |
                    Q(last_name__icontains=search_query) |
                    Q(specialization__icontains=search_query)
                )
        except Exception as e:
            return Response(
                {
                    "message": "Search filter failed",
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        doctors = doctors.order_by("-created_at")

        # ---------------- PAGINATION ----------------
        try:
            paginator = Paginator(doctors, per_page)
            paginated_doctors = paginator.get_page(page)
        except EmptyPage:
            return Response(
                {"message": "Page number out of range"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {
                    "message": "Pagination failed",
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # ---------------- SERIALIZATION ----------------
        serializer = DoctorListSerializer(paginated_doctors, many=True)

        # ---------------- SUCCESS RESPONSE ----------------
        return Response(
            {
                "message": "Doctor list fetched successfully",
                "total_records": doctors.count(),
                "total_pages": paginator.num_pages,
                "current_page": page,
                "per_page": per_page,
                "records_on_this_page": len(serializer.data),
                "doctors": serializer.data
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



@api_view(["POST"])
@permission_classes([AllowAny])
def create_hospital_user(request):
    """
    Create Hospital User
    Password auto-generated: hospitalname@123
    Login: mobile number + password + OTP
    """
    try:
        serializer = CreateHospitalSerializer(
            data=request.data,
            context={"request": request}
        )

        if not serializer.is_valid():
            return Response(
                {
                    "message": "Validation error",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        hospital = serializer.save()
        generated_password = serializer.context.get("generated_password")

        return Response(
            {
                "message": "Hospital registered successfully",
                "hospital": {
                    "id": hospital.id,
                    "hospital_name": hospital.hospital_name,
                    "mobile_number": hospital.mobile_number,
                    "email": hospital.email,
                    "role": hospital.role,
                },
                # ⚠️ DEV MODE ONLY
                "generated_password": generated_password,
            },
            status=status.HTTP_201_CREATED
        )

    except IntegrityError:
        return Response(
            {
                "message": "Hospital with this mobile number already exists"
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    except Exception as e:
        return Response(
            {
                "message": "Something went wrong while creating hospital",
                "error": str(e),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

