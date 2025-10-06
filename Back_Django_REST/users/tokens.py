from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_str

class AccountActivationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return (
            force_str.text_type(user.pk) + force_str.text_type(timestamp) + force_str.text_type(user.is_verified)
        )

account_activation_token = AccountActivationTokenGenerator()
