from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.contrib.auth.models import User
import json
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .models import UserProfile, FriendRequest
from django.utils.timesince import timesince
from django.contrib.auth import update_session_auth_hash
from django.views.decorators.csrf import csrf_exempt
from django.core.validators import EmailValidator
from django.core.exceptions import ValidationError

# Create your views here.
@login_required(login_url='/login/')
def profiles(request):
    return render(request, 'base.html', {'current_page': 'profiles/index.html'})

@login_required(login_url='/login/')
def profilesRaw(request):
    return render(request, 'profiles/index.html')

@login_required(login_url='/login/')
def profileOther(request, username):
    if username == request.user.username:
        return render(request, 'base.html', {'current_page': 'profiles/index.html'})

    if User.objects.filter(username=username).exists():
        user = User.objects.get(username=username)
        user_profile = UserProfile.objects.get(user=user)
        return render(request, 'base.html', {'current_page': 'profiles/allprofile.html', 'user': user, 'user_profile': user_profile})
    else:
        return JsonResponse({'error': 'User not found!'})
    
@login_required(login_url='/login/')
def profileOtherRaw(request, username):
    if username == request.user.username:
        return render(request, 'profiles/index.html')

    if User.objects.filter(username=username).exists():
        user = User.objects.get(username=username)
        user_profile = UserProfile.objects.get(user=user)
        return render(request, 'profiles/allprofile.html', {'user': user, 'user_profile': user_profile})
    else:
        return JsonResponse({'error': 'User not found!'}, status=404)

@login_required(login_url='/login/')
def updateProfileInfo(request):
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Unauthorized'})
        
        try:
            data = json.loads(request.body)
            newUsername = data.get('username')
            newEmail = data.get('email')
            newFirstName = data.get('first_name')
            newLastName = data.get('last_name')
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'})

        if not newUsername or not newEmail or not newFirstName or not newLastName:
            return JsonResponse({'error': 'All fields are required!'})

        try:
            email_validator = EmailValidator()
            email_validator(newEmail)
        except ValidationError:
            return JsonResponse({'error': 'Invalid email address!'})

        if newUsername != request.user.username:
            if User.objects.filter(username=newUsername).exists():
                return JsonResponse({'error': 'Username already exists!'})
            request.user.username = newUsername
            request.user.save()

        if newEmail != request.user.email:
            if User.objects.filter(email=newEmail).exists():
                return JsonResponse({'error': 'Email already exists!'})
            request.user.email = newEmail
            request.user.save()

        if newFirstName != request.user.first_name:
            request.user.first_name = newFirstName
            request.user.save()

        if newLastName != request.user.last_name:
            request.user.last_name = newLastName
            request.user.save()

        return JsonResponse({'message': 'Profile information updated successfully!'})
    return JsonResponse({'error': 'Invalid request method'})

@login_required(login_url='/login/')
def updateProfilePicture(request):
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Unauthorized'})

        user_profile = UserProfile.objects.get(user=request.user)
        if 'profile_image' not in request.FILES:
            return JsonResponse({'error': 'No image provided'})
        
        image = request.FILES['profile_image']
        file_path = f'static/images/user/{request.user.username}_{image.name}'
        
        path = default_storage.save(file_path, ContentFile(image.read()))

        if user_profile.profile_image != '/static/images/user/default.png':
            default_storage.delete(user_profile.profile_image[1:])
        
        user_profile.profile_image = f'/{path}'
        user_profile.save()

        return JsonResponse({'message': 'Profile picture updated successfully!', 'image_url': user_profile.profile_image})
    return JsonResponse({'error': 'Invalid request method'})

@login_required(login_url='/login/')
def updateProfilePassword(request):
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Unauthorized'})
        
        try:
            data = json.loads(request.body)
            newPassword = data.get('new_password')
            confirmNewPassword = data.get('confirm_password')
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'})
        
        if not newPassword or not confirmNewPassword:
            return JsonResponse({'error': 'All fields are required!'})
        
        if newPassword != confirmNewPassword:
            return JsonResponse({'error': 'Passwords do not match!'})
        
        request.user.set_password(newPassword)
        request.user.save()
        update_session_auth_hash(request, request.user)

        return JsonResponse({'message': 'Password updated successfully!'})
    return JsonResponse({'error': 'Invalid request method'})

@login_required(login_url='/login/')
def addFriendRequest(request):
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Unauthorized'})
        
        try:
            data = json.loads(request.body)
            friendUsername = data.get('friend_username')
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'})
        
        if not friendUsername:
            return JsonResponse({'error': 'All fields are required!'})
        
        if not User.objects.filter(username=friendUsername).exists():
            return JsonResponse({'error': 'User not found!'})
        
        friend = User.objects.get(username=friendUsername)
        if friend == request.user:
            return JsonResponse({'error': 'You cannot add yourself as a friend!'})
        
        if request.user.profile.friends.filter(username=friendUsername).exists():
            return JsonResponse({'error': 'You are already friends with this user!'})
        
        if FriendRequest.objects.filter(from_user=request.user, to_user=friend).exists():
            return JsonResponse({'error': 'Friend request already sent!'})
        
        FriendRequest.objects.create(from_user=request.user, to_user=friend)
        
        return JsonResponse({'message': 'Friend request sent successfully!'})
    return JsonResponse({'error': 'Invalid request method'})

@login_required(login_url='/login/')
def acceptFriendRequest(request):
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Unauthorized'})
        
        try:
            data = json.loads(request.body)
            friendUsername = data.get('friend_username')
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'})
        
        if not friendUsername:
            return JsonResponse({'error': 'All fields are required!'})
        
        if not User.objects.filter(username=friendUsername).exists():
            return JsonResponse({'error': 'User not found!'})
        
        friend = User.objects.get(username=friendUsername)
        if friend == request.user:
            return JsonResponse({'error': 'You cannot add yourself as a friend!'})
        
        if not FriendRequest.objects.filter(from_user=friend, to_user=request.user).exists():
            return JsonResponse({'error': 'No friend request found!'})
        
        FriendRequest.objects.filter(from_user=friend, to_user=request.user).delete()
        request.user.profile.friends.add(friend)
        friend.profile.friends.add(request.user)
        
        return JsonResponse({'message': 'Friend request accepted successfully!'})
    return JsonResponse({'error': 'Invalid request method'})

@login_required(login_url='/login/')
def rejectFriendRequest(request):
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Unauthorized'})
        
        try:
            data = json.loads(request.body)
            friendUsername = data.get('friend_username')
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'})
        
        if not friendUsername:
            return JsonResponse({'error': 'All fields are required!'})
        
        if not User.objects.filter(username=friendUsername).exists():
            return JsonResponse({'error': 'User not found!'})
        
        friend = User.objects.get(username=friendUsername)
        if friend == request.user:
            return JsonResponse({'error': 'You cannot add yourself as a friend!'})
        
        if not FriendRequest.objects.filter(from_user=friend, to_user=request.user).exists():
            return JsonResponse({'error': 'No friend request found!'})
        
        FriendRequest.objects.filter(from_user=friend, to_user=request.user).delete()
        
        return JsonResponse({'message': 'Friend request declined successfully!'})
    return JsonResponse({'error': 'Invalid request method'})

@login_required(login_url='/login/')
def removeFriend(request):
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Unauthorized'})
        
        try:
            data = json.loads(request.body)
            friendUsername = data.get('friend_username')
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'})
        
        if not friendUsername:
            return JsonResponse({'error': 'All fields are required!'})
        
        if not User.objects.filter(username=friendUsername).exists():
            return JsonResponse({'error': 'User not found!'})
        
        friend = User.objects.get(username=friendUsername)
        if friend == request.user:
            return JsonResponse({'error': 'You cannot remove yourself as a friend!'})
        
        if not request.user.profile.friends.filter(username=friendUsername).exists():
            return JsonResponse({'error': 'You are not friends with this user!'})
        
        request.user.profile.friends.remove(friend)
        friend.profile.friends.remove(request.user)
        
        return JsonResponse({'message': 'Friend removed successfully!'})
    return JsonResponse({'error': 'Invalid request method'})

@login_required
def getFriendRequests(request):
    if request.method == 'GET':
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Unauthorized'})
        
        friend_requests = FriendRequest.objects.filter(to_user=request.user)
        friend_requests_list = []
        for friend_request in friend_requests:
            friend_requests_list.append({
                'from_user': {
                    'username': friend_request.from_user.username,
                    'profile_image': friend_request.from_user.profile.profile_image
                },
                'created_at': timesince(friend_request.created_at)
            })
        
        return JsonResponse({'friend_requests': friend_requests_list})
    return JsonResponse({'error': 'Invalid request method'})

def getStatus(request):
    profile = request.user.profile
    return JsonResponse({'status': profile.status})

@csrf_exempt
def updateStatus(request):
    if request.method == 'POST':
        new_status = request.POST.get('status', 'offline')
        profile = request.user.profile
        profile.status = new_status
        profile.save()
        return JsonResponse({'status': profile.status})