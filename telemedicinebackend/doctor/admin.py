from django.contrib import admin
from .models import (

    IndividualDoctorSchedule,
    IndividualDoctorFee
)

@admin.register(IndividualDoctorSchedule)
class IndividualDoctorScheduleAdmin(admin.ModelAdmin):
    list_display = ("doctor","date", "day", "start_time", "end_time", "is_off", "reason")
    list_filter = ("day",)



@admin.register(IndividualDoctorFee)
class IndividualDoctorFeeAdmin(admin.ModelAdmin):
    list_display = ("doctor", "amount")