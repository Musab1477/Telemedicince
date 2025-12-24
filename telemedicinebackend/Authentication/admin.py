from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import *


@admin.register(User)
class UserAdmin(BaseUserAdmin):

    # ------------------ LIST PAGE CONFIG ----------------------
    list_display = (
        "id",
        "username",
        "mobile_number",
        "role",
        "hospital_name",
        "is_active",
        "is_staff",
    )

    list_filter = (
        "role",
        "gender",
        "hospital_type",
        "is_active",
        "is_staff",
        "is_superuser",
    )

    search_fields = (
        "username",
        "mobile_number",
        "first_name",
        "last_name",
        "hospital_name",
        "doctor_license_number",
        "registration_number",
    )

    ordering = ("id",)

    readonly_fields = (
        "last_login",
        "date_joined",
        "created_at",
        "updated_at",
    )

    # ------------------ FIELDSETS (EDIT USER PAGE) ----------------------

    fieldsets = (

        (_("Login Credentials"), {
            "fields": (
                "username",
                "password",
                "mobile_number",
            )
        }),

        (_("Basic Personal Details"), {
            "fields": (
                "first_name",
                "last_name",
                "email",
                "age",
                "gender",
            )
        }),

        (_("Role Information"), {
            "fields": (
                "role",
            )
        }),

        (_("Doctor Details"), {
            "fields": (
                "doctor_license_number",
                "specialization",
                "years_of_experience",
                "highest_qualification",
                "current_hospital",
                "degree_document",
                "other_certificate_document",
                "medical_license_document",
                "digital_signature_certificate",
                "consultation_fee",
            ),
            "classes": ("collapse",),
        }),

        (_("Hospital Details"), {
            "fields": (
                "hospital_name",
                "registration_number",
                "hospital_type",
                "hospital_address",
                "city",
                "state",
                "pincode",
            ),
            "classes": ("collapse",),
        }),

        (_("Hospital Admin Details"), {
            "fields": (
                "admin_name",
                "admin_phone_number",
            ),
            "classes": ("collapse",),
        }),

        (_("Address Proof & Documents"), {
            "fields": (
                "address_proof_document",
            ),
            "classes": ("collapse",),
        }),

        (_("Permissions"), {
            "fields": (
                "is_active",
                "is_staff",
                "is_superuser",
                "groups",
                "user_permissions",
            )
        }),

        (_("Important Dates"), {
            "fields": (
                "last_login",
                "date_joined",
                "created_at",
                "updated_at",
            )
        }),
    )

    # ------------------ ADD USER PAGE (CREATE FORM) ----------------------

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "username",
                "mobile_number",
                "password1",
                "password2",
                "first_name",
                "last_name",
                "email",
                "role",
            ),
        }),
    )

@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):

    # ------------------ LIST PAGE CONFIG ----------------------
    list_display = (
        "id",
        "user",
        "otp",
        "created_at",
    )

    list_filter = (
        "created_at",
        "user__role",
    )

    search_fields = (
        "user__username",
        "user__mobile_number",
        "otp",
    )

    ordering = ("-created_at",)

    readonly_fields = (
        "user",
        "otp",
        "created_at",
    )

    # ------------------ DETAIL PAGE CONFIG ----------------------

    fieldsets = (
        (_("OTP Information"), {
            "fields": (
                "user",
                "otp",
            )
        }),

        (_("Timestamp"), {
            "fields": (
                "created_at",
            )
        }),
    )