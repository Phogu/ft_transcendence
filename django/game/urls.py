from django.urls import path
from . import views

urlpatterns = [
    path('', views.game, name='game'),
    path('raw/', views.gameRaw, name='gameRaw'),
    path('api/save-match/', views.saveMatch, name='saveMatch'),
]
