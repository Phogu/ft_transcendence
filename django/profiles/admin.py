from django.contrib import admin
from .models import UserProfile, FriendRequest

# Register your models here.
admin.site.register(UserProfile)
admin.site.register(FriendRequest)