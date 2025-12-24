from twilio.rest import Client
from twilio.http.http_client import TwilioHttpClient
from django.conf import settings
import random


def generate_otp():
    return str(random.randint(100000, 999999))


def send_otp_twilio(otp):
    print("📲 Sending OTP:", otp)

    try:
        # ✅ Correct way to set timeout
        http_client = TwilioHttpClient(timeout=10)

        client = Client(
            settings.TWILIO_ACCOUNT_SID,
            settings.TWILIO_AUTH_TOKEN,
            http_client=http_client
        )

        message = client.messages.create(
            body=f"Your login OTP is {otp}",
            from_=settings.TWILIO_PHONE_NUMBER,
            to="+919327190573"  # VERIFIED NUMBER
        )

        print("✅ OTP SENT | SID:", message.sid)
        return message.sid

    except Exception as e:
        print("❌ TWILIO ERROR:", str(e))
        return None
