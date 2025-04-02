from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.loginView, name='login'),
    path('register/', views.registerView, name='register'),
    path('login/raw/', views.loginRaw, name='loginRaw'),
    path('register/raw/', views.registerRaw, name='registerRaw'),
    path('api/login/', views.loginApi, name='loginApi'),
    path('api/register/', views.registerApi, name='registerApi'),
    path('callback/', views.callbackView, name='callback'),
    path('api/check_login_status/', views.checkLoginStatus, name='check_login_status'),
    path('logout/', views.logoutView, name='logout'),
]
