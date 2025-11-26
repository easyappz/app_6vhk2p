from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import BaseAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import AuthenticationFailed
from django.utils import timezone
from drf_spectacular.utils import extend_schema
import secrets

from .serializers import (
    MessageSerializer,
    RegisterSerializer,
    LoginSerializer,
    MemberSerializer,
    ProfileUpdateSerializer,
    ChatMessageSerializer,
    ChatMessageCreateSerializer
)
from .models import Member, AuthToken, Message


class TokenAuthentication(BaseAuthentication):
    """
    Custom token authentication using AuthToken model.
    """
    keyword = 'Bearer'

    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header:
            return None

        try:
            parts = auth_header.split()
            if len(parts) != 2 or parts[0] != self.keyword:
                return None
            
            token_key = parts[1]
        except Exception:
            return None

        try:
            auth_token = AuthToken.objects.select_related('member').get(token=token_key)
            return (auth_token.member, auth_token)
        except AuthToken.DoesNotExist:
            raise AuthenticationFailed('Invalid token')


class HelloView(APIView):
    """
    A simple API endpoint that returns a greeting message.
    """

    @extend_schema(
        responses={200: MessageSerializer}, description="Get a hello world message"
    )
    def get(self, request):
        data = {"message": "Hello!", "timestamp": timezone.now()}
        serializer = MessageSerializer(data)
        return Response(serializer.data)


class RegisterView(APIView):
    """
    Register a new user.
    """
    authentication_classes = []
    permission_classes = []

    @extend_schema(
        request=RegisterSerializer,
        responses={201: MemberSerializer}
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            member = serializer.save()
            
            # Create authentication token
            token = secrets.token_hex(32)
            AuthToken.objects.create(member=member, token=token)
            
            member_serializer = MemberSerializer(member)
            return Response(
                {
                    **member_serializer.data,
                    'token': token
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    Login user and return authentication token.
    """
    authentication_classes = []
    permission_classes = []

    @extend_schema(
        request=LoginSerializer,
        responses={200: dict}
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
            try:
                member = Member.objects.get(username=username)
                if member.check_password(password):
                    # Create new token
                    token = secrets.token_hex(32)
                    AuthToken.objects.create(member=member, token=token)
                    
                    member_serializer = MemberSerializer(member)
                    return Response(
                        {
                            'token': token,
                            'user': member_serializer.data
                        },
                        status=status.HTTP_200_OK
                    )
                else:
                    return Response(
                        {'error': 'Invalid username or password'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except Member.DoesNotExist:
                return Response(
                    {'error': 'Invalid username or password'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    Logout user by deleting authentication token.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: dict}
    )
    def post(self, request):
        # Delete the current token
        if hasattr(request, 'auth') and request.auth:
            request.auth.delete()
        
        return Response(
            {'message': 'Successfully logged out'},
            status=status.HTTP_200_OK
        )


class ProfileView(APIView):
    """
    Get and update user profile.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: MemberSerializer}
    )
    def get(self, request):
        serializer = MemberSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request=ProfileUpdateSerializer,
        responses={200: MemberSerializer}
    )
    def put(self, request):
        serializer = ProfileUpdateSerializer(
            data=request.data,
            context={'member': request.user}
        )
        if serializer.is_valid():
            member = serializer.update(request.user, serializer.validated_data)
            member_serializer = MemberSerializer(member)
            return Response(member_serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MessagesListView(APIView):
    """
    Get list of all chat messages.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: dict}
    )
    def get(self, request):
        # Get query parameters
        limit = int(request.query_params.get('limit', 100))
        offset = int(request.query_params.get('offset', 0))

        # Get total count
        total_count = Message.objects.count()

        # Get messages with pagination, ordered by created_at descending
        messages = Message.objects.select_related('member').order_by('-created_at')[offset:offset + limit]
        
        # Serialize messages
        serializer = ChatMessageSerializer(messages, many=True)
        
        return Response(
            {
                'count': total_count,
                'results': serializer.data
            },
            status=status.HTTP_200_OK
        )


class MessageCreateView(APIView):
    """
    Create a new chat message.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=ChatMessageCreateSerializer,
        responses={201: ChatMessageSerializer}
    )
    def post(self, request):
        serializer = ChatMessageCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            message = serializer.save()
            response_serializer = ChatMessageSerializer(message)
            return Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)