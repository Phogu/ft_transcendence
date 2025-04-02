from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth.decorators import user_passes_test, login_required
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from profiles.models import UserProfile
import requests
import os
from dotenv import load_dotenv
import json
from django.core.validators import EmailValidator
from django.core.exceptions import ValidationError



def is_not_authenticated(user):
    return not user.is_authenticated

# Create your views here.
def index(request):
    return render(request, 'home/home.html')

@user_passes_test(is_not_authenticated, login_url='/dashboard/')
def loginView(request):
    load_dotenv()
    return render(request, 'home/base.html', {'current_page': 'home/login.html', 'ClientID': os.getenv('CLIENT_ID'), 'RedirectURI': os.getenv('REDIRECT_URI')})

@user_passes_test(is_not_authenticated, login_url='/dashboard/')
def loginRaw(request):
    load_dotenv()
    return render(request, 'home/login.html', {'ClientID': os.getenv('CLIENT_ID'), 'RedirectURI': os.getenv('REDIRECT_URI')})

@user_passes_test(is_not_authenticated, login_url='/dashboard/')
def registerView(request):
    load_dotenv()
    return render(request, 'home/base.html', {'current_page': 'home/register.html', 'ClientID': os.getenv('CLIENT_ID'), 'RedirectURI': os.getenv('REDIRECT_URI')})

@user_passes_test(is_not_authenticated, login_url='/dashboard/')
def registerRaw(request):
    load_dotenv()
    return render(request, 'home/register.html', {'ClientID': os.getenv('CLIENT_ID'), 'RedirectURI': os.getenv('REDIRECT_URI')})

@user_passes_test(is_not_authenticated, login_url='/dashboard/')
def forgotPassword(request):
    return render(request, 'home/base.html', {'current_page': 'home/forgot-password.html'}) 

@user_passes_test(is_not_authenticated, login_url='/dashboard/')
def forgotPasswordRaw(request):
    return render(request, 'home/forgot-password.html')

@user_passes_test(is_not_authenticated, login_url='/dashboard/')
def resetPassword(request):
    return render(request, 'home/base.html', {'current_page': 'home/reset-password.html'})

@user_passes_test(is_not_authenticated, login_url='/dashboard/')
def resetPasswordRaw(request):
    return render(request, 'home/reset-password.html')

@login_required(login_url='/login/')
def logoutView(request):
    if request.user.is_authenticated:
        logout(request)
    return redirect('/')

# Json request and response
def loginApi(request):
    try:
        if request.method == 'POST':
            if request.content_type == 'application/json':
                data = json.loads(request.body)
                username = data.get('username')
                password = data.get('password')
            else:
                return JsonResponse({'status': 'error', 'message': 'Invalid Request'})
            
            if not username or not password:
                return JsonResponse({'success': False, 'message': 'Username and password are required.'})

            if not User.objects.filter(username=username).exists():
                    return JsonResponse({'status': 'error', 'message': 'User not found'})
            
            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)
                return JsonResponse({'status': 'success', 'message': 'Login successful. Redirecting...'})
            else:
                return JsonResponse({'status': 'error', 'message': 'Invalid Username or Password'})
        else:
            return JsonResponse({'status': 'error', 'message': 'Invalid Request'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)})
    
def registerApi(request):
    try:
        if request.method == 'POST':
            if request.content_type == 'application/json':
                data = json.loads(request.body)
                username = data.get('username')
                firstname = data.get('firstname')
                lastname = data.get('lastname')
                email = data.get('email')
                password = data.get('password')
                confirm_password = data.get('password2')
            else:
                return JsonResponse({'status': 'error', 'message': 'Invalid Request'})
            
            if not username or not email or not password or not confirm_password:
                return JsonResponse({'success': False, 'message': 'All fields are required.'})
            
            try:
                email_validator = EmailValidator()
                email_validator(email)
            except ValidationError:
                return JsonResponse({'success': False, 'message': 'Invalid email address.'})
            
            if password != confirm_password:
                return JsonResponse({'success': False, 'message': 'Passwords do not match.'})
            
            if User.objects.filter(username=username).exists():
                return JsonResponse({'success': False, 'message': 'Username already exists.'})
            
            if User.objects.filter(email=email).exists():
                return JsonResponse({'success': False, 'message': 'Email already exists.'})
            
            user = User.objects.create_user(username=username, email=email, password=password, first_name=firstname, last_name=lastname)
            user.save()
            UserProfile.objects.create(user=user)
            return JsonResponse({'status': 'success', 'message': 'User created successfully. Redirecting...'})
        else:
            return JsonResponse({'status': 'error', 'message': 'Invalid Request'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)})
    
def callbackView(request):
    code = request.GET.get('code')
    
    if not code:
        return JsonResponse({'error': 'Code not found in the request'}, status=400)
    
    load_dotenv()
    token_url = os.getenv('TOKEN_URL')
    data = {
        'grant_type': 'authorization_code',
        'client_id': os.getenv('CLIENT_ID'),
        'client_secret': os.getenv('CLIENT_SECRET'),
        'code': code,
        'redirect_uri': os.getenv('REDIRECT_URI'),
    }

    response = requests.post(token_url, data=data)
    response_data = response.json()

    if 'access_token' not in response_data:
        return JsonResponse({'error': 'Failed to get access token'}, status=400)

    access_token = response_data['access_token']
    
    # Kullanıcı bilgilerini API'den çekiyoruz
    user_response = requests.get('https://api.intra.42.fr/v2/me', headers={
        'Authorization': f'Bearer {access_token}'
    })

    user_data = user_response.json()

    if 'login' not in user_data:
        return JsonResponse({'error': 'Failed to get user info'}, status=400)

    profile, created = UserProfile.objects.get_or_create(intra_username=user_data['login'], defaults={
        'profile_image': user_data['image']['link']
    })

    if created:
        user = User.objects.create_user(
            username=user_data['login'],
            first_name=user_data['first_name'],
            last_name=user_data['last_name'],
            email=user_data['email'],
        )
        profile.user = user
        profile.save()
    else:
        user = profile.user

    login(request, user)

    return redirect('/dashboard/')

def checkLoginStatus(request):
    if request.user.is_authenticated:
        return JsonResponse({'logged_in': True})
    else:
        return JsonResponse({'logged_in': False})