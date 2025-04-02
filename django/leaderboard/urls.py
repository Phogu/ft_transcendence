from django.urls import path
from . import views

urlpatterns = [
    path('', views.leaderboard, name='leaderboard'),
    path('raw/', views.leaderboardRaw, name='leaderboardRaw'),
]
