from rest_framework import serializers
from .models import Member, AuthToken


class MessageSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=200)
    timestamp = serializers.DateTimeField(read_only=True)


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(
        min_length=3,
        max_length=150,
        required=True
    )
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        min_length=8,
        write_only=True,
        style={'input_type': 'password'},
        required=True
    )
    password_confirm = serializers.CharField(
        min_length=8,
        write_only=True,
        style={'input_type': 'password'},
        required=True
    )

    def validate_username(self, value):
        if Member.objects.filter(username=value).exists():
            raise serializers.ValidationError("User with this username already exists")
        return value

    def validate_email(self, value):
        if Member.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists")
        return value

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match"})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        member = Member(
            username=validated_data['username'],
            email=validated_data['email']
        )
        member.set_password(validated_data['password'])
        member.save()
        return member


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ['id', 'username', 'email', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProfileUpdateSerializer(serializers.Serializer):
    username = serializers.CharField(
        min_length=3,
        max_length=150,
        required=False
    )
    email = serializers.EmailField(required=False)

    def validate_username(self, value):
        member = self.context.get('member')
        if Member.objects.filter(username=value).exclude(id=member.id).exists():
            raise serializers.ValidationError("User with this username already exists")
        return value

    def validate_email(self, value):
        member = self.context.get('member')
        if Member.objects.filter(email=value).exclude(id=member.id).exists():
            raise serializers.ValidationError("User with this email already exists")
        return value

    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.save()
        return instance
