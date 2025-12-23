from twilio.rest import Client
from django.conf import settings

import random

def generate_otp():
    return str(random.randint(100000, 999999))

def send_otp_twilio(otp, phone):
    """
    DEV MODE:
    OTP hamesha verified number par jayega
    """
    client = Client(
        settings.TWILIO_ACCOUNT_SID,
        settings.TWILIO_AUTH_TOKEN
    )

    message = client.messages.create(
        body=f"Your login OTP is {otp}",
        from_=settings.TWILIO_PHONE_NUMBER,
        to=phone # 👈 VERIFIED NUMBER ONLY
    )

    return message.sid
