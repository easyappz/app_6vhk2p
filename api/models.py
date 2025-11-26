from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class Member(models.Model):
    """
    Custom user model for the group chat application.
    """
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "members"
        ordering = ["-created_at"]

    def __str__(self):
        return self.username

    def set_password(self, raw_password):
        """
        Set the password by hashing it.
        """
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        """
        Check if the provided password matches the stored hashed password.
        """
        return check_password(raw_password, self.password)

    @property
    def is_authenticated(self):
        """
        Always return True. This is a way to tell if the user has been authenticated.
        """
        return True

    @property
    def is_anonymous(self):
        """
        Always return False. This is a way to tell if the user is anonymous.
        """
        return False

    def has_perm(self, perm, obj=None):
        """
        Return True if the user has the specified permission.
        For compatibility with DRF permission classes.
        """
        return True

    def has_module_perms(self, app_label):
        """
        Return True if the user has permissions to view the app.
        For compatibility with DRF permission classes.
        """
        return True


class AuthToken(models.Model):
    """
    Authentication token model for member sessions.
    """
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name="tokens")
    token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "auth_tokens"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Token for {self.member.username}"


class Message(models.Model):
    """
    Message model for the group chat.
    """
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name="messages")
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "messages"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Message by {self.member.username} at {self.created_at}"
